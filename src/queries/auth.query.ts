import prisma from "@/prisma";
import { User } from "@prisma/client";
import { ReferralHistory } from "@prisma/client";

import { FE_URL, API_KEY } from "@/config";
import { transporter } from "@/helpers/nodemailer";
import { validateReferral } from "@/utils/validateReferral";
import { generateReferralCode } from "@/utils/generateReferral";
import { generateVoucherCode } from "@/utils/generateVoucher";

import { Service } from "typedi";
import * as handlebars from "handlebars";
import path from "path";
import fs from "fs";
import { sign } from "jsonwebtoken";

@Service()
export class AuthQuery {
    private sendRegistrationEmail = async (
        user: User
    ) => {
        try {
            const payload = {
                email: user.email,
                isVerified: user.isVerified
            };

            const token = sign(payload, String(API_KEY), {
                expiresIn: "1hr",
            });

            const templatePath = path.join(
                __dirname,
                "../templates",
                "registrationEmail.hbs"
            );
            const urlVerify = `${FE_URL}/verify?token=${token}`;
            const templateSource = fs.readFileSync(templatePath, "utf-8");

            const compiledTemplate = handlebars.compile(templateSource);
            const html = compiledTemplate({
                email: user.email,
                url: urlVerify
            });

            await transporter.sendMail({
                from: "sender address",
                to: user.email,
                subject: `Welcome to our Event Management Platform!`,
                html
            });
        } catch (err) {
            throw err;
        }
    };

    public createReferralHistory = async (
        user: User,
        referral: string
    ): Promise<ReferralHistory | null> => {
        try {
            const referrerId = await validateReferral(referral);
            if (referrerId) {
                const validFrom = user.registrationDate;

                const validTo = new Date(validFrom);
                validTo.setMonth(validTo.getMonth() + 3);

                const referralHistory = await prisma.referralHistory.create({
                    data: {
                        referrerId,
                        referralCode: referral,
                        pointsEarned: 10000,
                        refereeId: user.id,
                        voucherCode: await generateVoucherCode(),
                        discountValue: 10,
                        validFrom,
                        validTo
                    }
                });
                return referralHistory;
            }
            return null;
        } catch (err) {
            throw err;
        }
    };

    public register = async (
        email: string,
        username: string,
        roleId: number,
        password: string
    ): Promise<User> => {
        try {
            const user = await prisma.user.create({
                data: {
                    email,
                    username,
                    roleId,
                    password,
                    referral: await generateReferralCode(),
                    isVerified: false
                },
            });

            await this.sendRegistrationEmail(user);

            return user;
        } catch (err) {
            throw err;
        }
    };

    public registerWithReferral = async (
        userData: User,
        pass: string,
        referral?:string
    ): Promise<User> => {
        try {
            const createdUser = await this.register(
                userData.email,
                userData.username,
                userData.roleId,
                pass
            );

            if (referral) {
                await this.createReferralHistory(createdUser, referral)
            }

            return createdUser;
        } catch (err) {
            throw err;
        }
    };

    public verify = async (
        email: string
    ): Promise<void> => {
        try {
            await prisma.$transaction(async (prisma: any) => {
                try {
                    await prisma.user.update({
                        where: {
                            email
                        },
                        data: {
                            isVerified: true
                        }
                    });
                } catch (err) {
                    throw err;
                }
            });
        } catch (err) {
            throw err;
        }
    };
}