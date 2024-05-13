import prisma from "@/prisma";
import { Event, Location, Schedule, Picture, Transaction, Promotion, Ticket, ReferralHistory, Review } from "@prisma/client";

import { Service } from "typedi";

interface ReviewCreateInput {
    eventId: number;
    attendeeId: number;
    rating: number;
    comment: string | null;
    reviewDate: Date
}

@Service()
export class EventQuery {
    public createEvent = async (
        eventData: Omit<Event, "id">
    ): Promise<Event> => {
        try {
            return await prisma.event.create({
                data: {
                    ...eventData
                }
            });
        } catch (err) {
            throw err;
        }
    };

    public createLocation = async (
        eventId: number,
        locationData: Location
    ): Promise<Location> => {
        try {
            return await prisma.location.create({
                data: {
                    ...locationData,
                    eventId
                }
            });
        } catch (err) {
            throw err;
        }
    };

    public createSchedule = async (
        eventId: number,
        scheduleData: Schedule
    ): Promise<Schedule> => {
        try {
            return await prisma.schedule.create({
                data: {
                    ...scheduleData,
                    eventId
                }
            });
        } catch (err) {
            throw err;
        }
    };

    public createPicture = async (
        eventId: number,
        pictureData: Picture
    ): Promise<Picture> => {
        try {
            return await prisma.picture.create({
                data: {
                    ...pictureData,
                    eventId
                }
            });
        } catch (err) {
            throw err;
        }
    };

    public addPromotion = async (
        eventId: number,
        promotionData: Omit<Promotion, "id" | "eventId">
    ): Promise<Promotion> => {
        try {
            return await prisma.promotion.create({
                data: {
                    ...promotionData,
                    eventId
                }
            });
        } catch (err) {
            throw err;
        }
    };

    public addTicket = async (
        eventId: number,
        ticketData: Omit<Ticket, "id" | "eventId">
    ): Promise<Ticket> => {
        try {
            return await prisma.ticket.create({
                data: {
                    ...ticketData,
                    eventId
                }
            });
        } catch (err) {
            throw err;
        }
    };

    public getEventDetails = async (
        eventId: number
    ): Promise<Event | null> => {
        try {
            const event = await prisma.event.findUnique({
                where: {
                    id: eventId
                },
                include: {
                    organizer: true,
                    category: true,
                    eventType: true,
                    locations: true,
                    schedules: true,
                    pictures: true,
                    promotions: true,
                    tickets: true,
                    reviews: true
                }
            });

            return event;
        } catch (err) {
            throw err;
        }
    };

    public getEventById = async (
        eventId: number
    ): Promise<Event | null> => {
        try {
            const event = await prisma.event.findUnique({
                where: {
                    id: eventId
                }
            });

            return event;
        } catch (err) {
            throw err;
        }
    };

    public editEvent = async (
        eventId: number,
        newData: Partial<Event>
    ): Promise<Event> => {
        try {
            const updatedEvent = await prisma.event.update({
                where: {
                    id: eventId
                },
                data: {
                    ...newData
                }
            });
            
            return updatedEvent;
        } catch (err) {
            throw err;
        }
    };

    public deleteEvent = async (
        eventId: number
    ): Promise<void> => {
        try {
            await prisma.event.delete({
                where: {
                    id: eventId
                }
            });
        } catch (err) {
            throw err;
        }
    };

    public getEventsList = async (
        categoryId?: number,
        eventTypeId?: number
    ): Promise<Event[]> => {
        try {
            let whereClause: any = {
                isEnded: false
            };

            if (categoryId) {
                whereClause.categoryId = categoryId;
            }
            if (eventTypeId) {
                whereClause.eventTypeId = eventTypeId;
            }

            const activeEvents = await prisma.event.findMany({
                where: whereClause
            });

            return activeEvents;
        } catch (err) {
            throw err;
        }
    };

    public browseEvent = async (
        searchQuery: string
    ): Promise<Event[]> => {
        try {
            const events = await prisma.event.findMany({
                where: {
                    isEnded: false,
                    eventName: {
                        contains: searchQuery
                    }
                },
            });

            return events;
        } catch (err) {
            throw err;
        }
    };

    public viewEvent = async (
        eventId: number
    ): Promise<Event | null> => {
        try {
            const viewEvent = await prisma.event.findUnique({
                where: {
                    id: eventId,
                    isEnded: false
                },
                include: {
                    organizer: {
                        select: {
                            username: true
                        }
                    },
                    category: {
                        select: {
                            categoryName: true
                        }
                    },
                    eventType: {
                        select: {
                            eventType: true
                        }
                    },
                    locations: {
                        select: {
                            country: true,
                            city: true,
                            address: true,
                            postalCode: true
                        }
                    },
                    schedules: {
                        select: {
                            startTime: true,
                            endTime: true
                        }
                    },
                    pictures: {
                        select: {
                            picture: true
                        }
                    },
                    promotions: {
                        where: {
                            isInvalid: false
                        }
                    },
                    tickets: {
                        where: {
                            isSoldOut: false
                        }
                    },
                    reviews: true
                }
            });

            return viewEvent;
        } catch (err) {
            throw err;
        }
    };

    public getTicketById = async (
        ticketId: number
    ): Promise<Ticket | null> => {
        try {
            const ticket = await prisma.ticket.findUnique({
                where: {
                    id: ticketId
                }
            });

            return ticket;
        } catch (err) {
            throw err;
        }
    };

    public getPromotion = async (
        promotionId: number
    ): Promise<Promotion | null> => {
        try {
            return await prisma.promotion.findUnique({
                where: {
                    id: promotionId
                }
            });
        } catch (err) {
            throw err;
        }
    };

    public getVoucher = async (
        voucherCode: string
    ): Promise<ReferralHistory | null> => {
        try {
            return await prisma.referralHistory.findUnique({
                where: {
                    voucherCode
                }
            });
        } catch (err) {
            throw err;
        }
    };

    public getReferralHistories = async (
        userId: number
    ): Promise<ReferralHistory[]> => {
        try {
            return await prisma.referralHistory.findMany({
                where: {
                    referrerId: userId,
                    isExpired: false,
                    pointsUsed: {
                        lt: 10000
                    }
                },
                orderBy: {
                    validTo: "asc"
                }
            });
        } catch (err) {
            throw err;
        }
    };

    public createTransaction = async (
        transactionData: Omit<Transaction, "id">
    ): Promise<Transaction> => {
        try {
            return await prisma.transaction.create({
                data: {
                    ...transactionData
                }
            });
        } catch (err) {
            throw err;
        }
    };

    public giveReview = async (
        eventId: number,
        userId: number,
        reviewData: ReviewCreateInput
    ): Promise<Review> => {
        try {
            return await prisma.review.create({
                data: {
                    ...reviewData,
                    eventId,
                    attendeeId: userId
                }
            });
        } catch (err) {
            throw err;
        }
    };    
}