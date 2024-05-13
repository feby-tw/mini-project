import prisma from "@/prisma";
import { Event, Review, Transaction } from "@prisma/client";

import { Service } from "typedi";

interface OrganizerStats {
    attendeesSatisfaction: { eventId: number; averageRating: number }[];
    ticketSales: { eventId: number; ticketTypeId: number; percentageSold: number }[];
    revenue: { eventId: number; totalRevenue: number }[];
}

@Service()
export class DashboardQuery {

    public getRegistrationHistory = async (
        userId: number,
        sortBy: "asc" | "desc"
    ): Promise<Transaction[]> => {
        try {
            const transactions = await prisma.transaction.findMany({
                where: {
                    attendeeId: userId
                },
                orderBy: {
                    transactionDate: sortBy
                },
                include: {
                    event: {
                        select: {
                            eventName: true
                        }
                    },
                    ticket: {
                        select: {
                            ticketName: true,
                            price: true
                        }
                    }
                }
            });

            return transactions;
        } catch (err) {
            throw err;
        }
    };

    public getUpcomingEvents = async (
        userId: number
    ): Promise<Event[]> => {
        try {
            const upcomingEvents = await prisma.event.findMany({
                where: {
                    AND: [
                        {
                            transactions: {
                                some: {
                                    attendeeId: userId
                                }
                            }
                        },
                        {
                            isEnded: false
                        }
                    ]
                },
                include: {
                    locations: true,
                    schedules: true,
                    pictures: true
                }
            });
    
            return upcomingEvents;
        } catch (err) {
            throw err;
        }
    };

    public getAttendedEvents = async (
        userId: number
    ): Promise<Event[]> => {
        try {
            const attendedEvents = await prisma.event.findMany({
                where: {
                    AND: [
                        {
                            transactions: {
                                some: {
                                    attendeeId: userId
                                }
                            }
                        },
                        {
                            isEnded: true
                        }
                    ]
                },
                include: {
                    locations: true,
                    schedules: true,
                    pictures: true,
                    reviews: true
                }
            });
    
            return attendedEvents;
        } catch (err) {
            throw err;
        }
    };

    public getEventsByOrganizer = async (
        organizerId: number,
        sortBy?: "asc" | "desc"
    ): Promise<Event[]> => {
        try {
            const events = await prisma.event.findMany({
                where: {
                    organizerId
                },
                orderBy: {
                    createdAt: sortBy
                },
                include: {
                    locations: true,
                    schedules: true,
                    pictures: true,
                    promotions: true,
                    tickets: true,
                    reviews: true
                }
            });

            return events;
        } catch (err) {
            throw err;
        }
    };

    public getEventTransactions = async (
        eventId: number,
        sortBy?: "asc" | "desc"
    ): Promise<Transaction[]> => {
        try {
            const transactions = await prisma.transaction.findMany({
                where: {
                    eventId
                },
                orderBy: {
                    transactionDate: sortBy
                },
                include: {
                    event: {
                        select: {
                            eventName: true
                        }
                    },
                    ticket: {
                        select: {
                            ticketName: true,
                            price: true
                        }
                    }
                }
            });

            return transactions;
        } catch (err) {
            throw err;
        }
    };

    public getOrganizerStats = async (
    ): Promise<OrganizerStats> => {
        try {
        const events = await prisma.event.findMany({
            include: {
                transactions: true,
                tickets: true,
                reviews: true
            }
        });
        const attendeesSatisfaction: {
            eventId: number;
            averageRating: number
        }[] = events.map(event => {
            const ratings = event.reviews.map(review => review.rating || 0);
            const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
            return { eventId: event.id, averageRating };
        });

        const ticketSales: { eventId: number; ticketTypeId: number; percentageSold: number }[] = events.flatMap(event => {
            return event.tickets.flatMap(ticket => {
                const totalSeats = ticket.availableSeat;
                const soldSeats = event.transactions.reduce((acc, transaction) => acc + transaction.quantity, 0);
                const percentageSold = (soldSeats / totalSeats) * 100;
                return {
                    eventId: event.id,
                    ticketTypeId: ticket.ticketTypeId ?? 0,
                    percentageSold
                };
            });
        });

        const revenue: { eventId: number; totalRevenue: number }[] = events.map(event => {
            const totalRevenue = event.transactions.reduce((acc, transaction) => acc + transaction.totalPrice, 0);
            return { eventId: event.id, totalRevenue };
        });

        const organizerStats: OrganizerStats = {
            attendeesSatisfaction,
            ticketSales,
            revenue
        };

        return organizerStats;
        } catch (err) {
            throw err;
        }
    };
}