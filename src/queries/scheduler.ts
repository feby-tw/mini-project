import { Service } from "typedi";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

@Service()
export class ScheduleService {
    async updateUserPoints() {
        try {
            const users = await prisma.user.findMany();

            for (const user of users) {
                const referralHistories = await prisma.referralHistory.findMany({
                    where: {
                        referrerId: user.id,
                        isExpired: false,
                        pointsUsed: {
                            lt: 10000
                        }
                    },
                    orderBy: {
                        validTo: "asc"
                    }
                });

                let totalPoints = 0;
                for (const history of referralHistories) {
                    const pointsRemaining = history.pointsEarned - history.pointsUsed;

                    if (pointsRemaining > 0) {
                        totalPoints += pointsRemaining;
                    }
                }

                await prisma.user.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        points: totalPoints
                    }
                });
            }
        } catch (error) {
            throw new Error(`Error updating user points`);
        }
    };

    async checkReferralHistory() {
        try {
            const referralHistories = await prisma.referralHistory.findMany({
                where: {
                    isExpired: false
                }
            });

            for (const history of referralHistories) {
                if (new Date() > history.validTo) {
                    await prisma.referralHistory.update({
                        where: {
                            id: history.id
                        },
                        data: {
                            isExpired: true
                        }
                    });
                }
            }
        } catch (error) {
            throw new Error(`Error checking referral history`);
        }
    };

    async checkEventStatus() {
        try {
            const events = await prisma.event.findMany({
                where: {
                    isEnded: false
                }
            });

            for (const event of events) {
                const schedules = await prisma.schedule.findMany({
                    where: {
                        eventId: event.id
                    }
                });

                for (const schedule of schedules) {
                    if (new Date() > schedule.endTime) {
                        await prisma.event.update({
                            where: {
                                id: event.id
                            },
                            data: {
                                isEnded: true
                            }
                        });
                        break;
                    }
                }
            }
        } catch (error) {
            throw new Error(`Error checking event status`);
        }
    };

    async checkTicketAvailability() {
        try {
            const tickets = await prisma.ticket.findMany({
                where: {
                    isSoldOut: false
                }
            });

            for (const ticket of tickets) {
                if (ticket.availableSeat === 0) {
                    await prisma.ticket.update({
                        where: {
                            id: ticket.id
                        },
                        data: {
                            isSoldOut: true
                        }
                    })
                }
            }
        } catch (error) {
            throw new Error(`Error checking ticket availability`);
        }
    };

    async checkPromotionStatus() {
        try {
            const promotions = await prisma.promotion.findMany({
                where: {
                    isInvalid: false
                }
            });

            for (const promotion of promotions) {
                const currentDate = new Date();
                const isExpired = currentDate > promotion.validTo;
                const isUsedUp = promotion.isUsed === promotion.limit;

                if (isExpired || isUsedUp) {
                    await prisma.promotion.update({
                        where: {
                            id: promotion.id
                        },
                        data: {
                            isInvalid: true
                        }
                    });
                }
            }
        } catch (error) {
            throw new Error(`Error checking promotion status`);
        }
    };

    async checkTransactionStatus() {
        try {
            const transactions = await prisma.transaction.findMany({
                where: {
                    isCompleted: false
                }
            });

            for (const transaction of transactions) {
                const event = await prisma.event.findUnique({
                    where: {
                        id: transaction.eventId
                    }
                });

                if (event?.isEnded) {
                    await prisma.transaction.update({
                        where: {
                            id: transaction.id
                        },
                        data: {
                            isCompleted: true
                        }
                    });
                }
            }
        } catch (error) {
            throw new Error(`Error checking transaction status`);
        }
    };
}