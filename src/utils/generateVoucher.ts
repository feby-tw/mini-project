import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

const initializeVoucherCode = (): string => {
    const codeLength = 7;
    let VoucherCode = randomBytes(codeLength).toString('hex').toUpperCase();
    return VoucherCode;
}

async function isVoucherCodeUnique (voucherCode: string): Promise<boolean> {
    const existingVoucherCode = await prisma.referralHistory.findUnique({ where: { voucherCode } });
    return !existingVoucherCode;
}

export async function generateVoucherCode(): Promise<string> {
    let voucherCode = initializeVoucherCode();
    while (!(await isVoucherCodeUnique(voucherCode))) {
        voucherCode = initializeVoucherCode();
    }
    return voucherCode;
};