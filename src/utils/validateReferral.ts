import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const validateReferral = async (referralCode: string): Promise<number | null> => {
    try {
        const referrer = await prisma.user.findFirst({ where: { referral: referralCode } });
        if (referrer) {
            return referrer.id;
        } else {
            return null;
        }
    } catch (err) {
        throw err;
    }
};