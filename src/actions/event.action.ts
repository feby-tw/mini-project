import prisma from "@/prisma";
import { Event, Promotion, Review, Ticket, Transaction } from "@prisma/client";
import { EventFormData } from "@/interfaces/event.interface"
import { HttpException } from "@/exceptions/http.exception";

import Container, { Service } from "typedi";

import { EventQuery } from "@/queries/event.query";
import { UserQuery } from "@/queries/user.query";

interface ReviewCreateInput {
    eventId: number;
    attendeeId: number;
    rating: number;
    comment: string | null;
    reviewDate: Date
}

@Service()
export class EventAction {
    event = Container.get(EventQuery);
    user = Container.get(UserQuery);

    public createEvent = async (
        userId: number,
        eventData:  Omit<Event, "id" | "eventId">,
        data: EventFormData
    ): Promise<Event> => {
        try {
            const organizer = await this.user.getUserById(userId);
            if (!organizer) {
                throw new HttpException(404, `User not found`)
            }

            const event = await this.event.createEvent(eventData);

            for (const locationData of data.locations) {
                await this.event.createLocation(event.id, locationData);
            }

            for (const scheduleData of data.schedules) {
                await this.event.createSchedule(event.id, scheduleData);
            }

            for (const pictureData of data.pictures) {
                await this.event.createPicture(event.id, pictureData);
            }

            return event;
        } catch (err) {
            throw err;
        }
    };

    public addPromotion = async (
        eventId: number,
        promotionData: Omit<Promotion, "id" | "eventId">
    ): Promise<Promotion> => {
        try {
            return await this.event.addPromotion(eventId, promotionData);
        } catch (err) {
            throw err;
        }
    };

    public addTicket = async (
        eventId: number,
        ticketData: Omit<Ticket, "id" | "eventId">
    ): Promise<Ticket> => {
        try {
            return await this.event.addTicket(eventId, ticketData);
        } catch (err) {
            throw err;
        }
    };

    public viewEventAsOrganizer = async (
        eventId: number
    ): Promise<Event | null> => {
        try {
            const event = await this.event.getEventDetails(eventId);

            if (!event) {
                throw new HttpException(404, `Event not found`);
            }

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
            const existingEvent = await this.event.getEventById(eventId);
            if (!existingEvent)
                throw new HttpException(404, `Cannot edit event, event doesn't exist`);

            const updatedEvent = await this.event.editEvent(eventId, newData);

            return updatedEvent;
        } catch (err) {
            throw err;
        }
    };

    public deleteEvent = async (
        eventId: number
    ): Promise<void> => {
        try {
            const existingEvent = await this.event.getEventById(eventId);

            if (!existingEvent)
                throw new HttpException(404, `Delete event failed, event doesn't exist`);

            return await this.event.deleteEvent(eventId);
        } catch (err) {
            throw err;
        }
    };

    public getEventsList = async (
        categoryId?: number,
        eventTypeId?: number
    ): Promise<Event[]> => {
        try {
            const events = await this.event.getEventsList(categoryId, eventTypeId);

            if (!events || events.length === 0)
                throw new HttpException(404, `No events found`);

            return events;
        } catch (err) {
            throw err;
        }
    };

    public browseEvent = async (
        searchQuery: string
    ): Promise<Event[]> => {
        try {
            if (!searchQuery)
                throw new HttpException(400, `Search query is required`);

            const events = await this.event.browseEvent(searchQuery);

            if (!events || events.length === 0)
                throw new HttpException(404, `No events found`);

            return events;
        } catch (err) {
            throw err;
        }
    };

    public viewEventAsAttendee = async (
        eventId: number
    ): Promise<Event | null> => {
        try {
            const event = await this.event.viewEvent(eventId);

            if (!event) {
                throw new HttpException(404, `Event not found`)
            }

            return event;
        } catch (err) {
            throw err;
        }
    };

    public registerEvent = async (
        eventId: number,
        userId: number,
        ticketId: number,
        quantity: number,
        promotionId?: number,
        voucherCode?: string,
        usePoints?: boolean
    ): Promise<Transaction> => {
        try {
            const event = await this.event.getEventById(eventId);
            if (event?.isEnded)
                throw new HttpException(404,`Event has already ended`);

            const ticket = await this.event.getTicketById(ticketId);
            if (!ticket || ticket.availableSeat <= 0 || ticket.isSoldOut)
                throw new HttpException(404, `Ticket is not available or sold out`);

            let promotion: Promotion | null = null;
            if (promotionId) {
                promotion = await this.event.getPromotion(promotionId);
                if (!promotion || promotion.isInvalid || promotion.isUsed >= promotion.limit)
                    throw new HttpException(404, `Promotion is not valid or has reached its limit`);
            }

            const referralHistories = await this.event.getReferralHistories(userId);

            let totalPrice = ticket.price * quantity;

            if (promotion) {
                totalPrice -= promotion.discount;
            }

            let voucherDiscount = 0;
            if (voucherCode) {
                const voucher = await this.event.getVoucher(voucherCode);
                if (!voucher || voucher.isExpired || voucher.voucherUsed)
                    throw new HttpException(404, `Voucher is not valid or has been used`)
                
                voucherDiscount = (voucher.discountValue / 100) * totalPrice;
                totalPrice -= voucherDiscount;
            }

            if (usePoints) {
                let remaingPoints = 0;

                for (const history of referralHistories) {
                    const pointsRemaining = history.pointsEarned - history.pointsUsed;

                    if (pointsRemaining > 0) {
                        const pointsToUse = Math.min(pointsRemaining, totalPrice);
                        totalPrice -= pointsToUse;
                        remaingPoints += pointsToUse;

                        await prisma.referralHistory.update({
                            where: {
                                id: history.id
                            },
                            data: {
                                pointsUsed: {
                                    increment: pointsToUse
                                }
                            }
                        });

                        if (totalPrice <= 0) {
                            break;
                        }
                    }
                }

                await prisma.user.update({
                    where: {
                        id: userId
                    },
                    data: {
                        points: {
                            decrement: remaingPoints
                        }
                    }
                });
            }

            const transactionData: Omit<Transaction, "id"> = {
                attendeeId: userId,
                eventId: eventId,
                ticketId: ticketId,
                quantity: quantity,
                promotionId: promotionId ? (promotion?.discount ?? null) : null,
                voucher: voucherCode ? (voucherDiscount ?? null) : null,
                pointsRedeemed: usePoints ? totalPrice : null,
                totalPrice: totalPrice,
                transactionDate: new Date(),
                isCompleted: false
            };

            return await this.event.createTransaction(transactionData);
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
            if (reviewData.rating === undefined)
                throw new HttpException(404,`Rating is required`); 

            return await this.event.giveReview(eventId, userId, reviewData);
        } catch (err) {
            throw err;
        }
    };    
}