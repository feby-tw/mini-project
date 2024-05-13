import prisma from "@/prisma";
import { User, ReferralHistory } from "@prisma/client";

import { Service } from "typedi";

interface UserProfileUpdate {
    username?: string;
    email?: string;
    password?: string;
}

@Service()
export class UserQuery {
    public getUserById = async (
        userId: number
    ): Promise<User | null> => {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                }
            });

            return user;
        } catch (err) {
            throw err;
        }
    };

    public getUserByEmail = async (
        email: string
    ): Promise<User | null> => {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    email
                }
            });

            return user;
        } catch (err) {
            throw err;
        }
    };

    public getUserByUsername = async (
        username: string
    ): Promise<User | null> => {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    username
                }
            });

            return user;
        } catch (err) {
            throw err;
        }
    };

    public editProfile = async (
        userId: number,
        newData: UserProfileUpdate
    ): Promise<User> => {
        try {
            const editData = await prisma.user.update({
                where: {
                    id: userId
                },
                data: newData
            });
            
            return editData;
        } catch (err) {
            throw err;
        }
    };

    public deleteUser = async (
        userId: number
    ): Promise<void> => {
        try {
            await prisma.user.delete({
                where: {
                    id: userId
                }
            });
        } catch (err) {
            throw err;
        }
    };

    // public getReferralHistoryByVoucher = async (
    //     voucherCode: string
    // ): Promise<ReferralHistory | null> => {
    //     try {
    //         return await prisma.referralHistory.findUnique({
    //             where: {
    //                 voucherCode
    //             }
    //         })
    //     } catch (err) {
    //         throw err;
    //     }
    // };

    // public getValidReferralHistories = async (
    //     userId: number
    // ): Promise<ReferralHistory[]> => {
    //     try {
    //         const currentDate = new Date();
    //         return await prisma.referralHistory.findMany({
    //             where: {
    //                 referrerId: userId,
    //                 validTo: {
    //                     gte: currentDate
    //                 }
    //             }
    //         });
    //     } catch (err) {
    //         throw err;
    //     }
    // };

    // public updateUserPoints = async (
    //     userId: number,
    //     updatedPoints: number
    // ): Promise<void> => {
    //     try {
    //         await prisma.user.update({
    //             where: {
    //                 id: userId
    //             },
    //             data: {
    //                 points: updatedPoints
    //             }
    //         });
    //     } catch (err) {
    //         throw err;
    //     }
    // };
}