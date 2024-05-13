import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

const initializeReferralCode = (): string => {
    const codeLength = 5;
    let referralCode = randomBytes(codeLength).toString('hex').toUpperCase();
    return referralCode;
}

async function isReferralCodeUnique (referralCode: string): Promise<boolean> {
    const existingReferralCode = await prisma.user.findUnique({ where: { referral: referralCode } });
    return !existingReferralCode;
}

export async function generateReferralCode(): Promise<string> {
    let referralCode = initializeReferralCode();
    while (!(await isReferralCodeUnique(referralCode))) {
        referralCode = initializeReferralCode();
    }
    return referralCode;
};