import { Request, Response, NextFunction } from "express";

import { EventAction } from "@/actions/event.action";

import Container from "typedi";

export class EventController {
    event = Container.get(EventAction);

    public createEvent = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            let userId: number;
            if (req.user) {
                userId = req.user.roleId;
            } else {
                throw new Error(`User not authenticated`);
            }

            const { eventData, ...formData } = req.body

            const data = await this.event.createEvent(userId, eventData, formData);

            res.status(200).json({
                message: `Event has been successfully created`,
                data
            });
        } catch (err) {
            next(err);
        }
    };

    public addPromotion = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const eventId = parseInt(req.params.eventId);
            const promotionData = req.body
            
            const promotion = await this.event.addPromotion(eventId, promotionData);

            res.status(200).json({
                message: `Promotion added successfully`,
                data: promotion 
            });
        } catch (err) {
            next (err);
        }
    };

    public addTicket = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const eventId = parseInt(req.params.eventId);
            const ticketData = req.body
            
            const ticket = await this.event.addTicket(eventId, ticketData);

            res.status(200).json({
                message: `Ticket added successfully`,
                data: ticket 
            });
        } catch (err) {
            next (err);
        }
    };

    public viewEventAsOrganizer = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const eventId: number = parseInt(req.params.eventId);

            const event = await this.event.viewEventAsOrganizer(eventId);

            res.status(200).json({
                data: event
            });
        } catch (err) {
            next(err);
        }
    };

    public editEvent = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const eventId = parseInt(req.params.eventId);
            const newData = req.body;

            const updatedEvent = await this.event.editEvent(eventId, newData);

            res.status(200).json({
                message: `Your changes have been successfully saved`,
                data: updatedEvent
            });
        } catch (err) {
            next(err);
        }
    };

    public deleteEvent = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const eventId = parseInt(req.params.eventId);

            await this.event.deleteEvent(eventId);

            res.status(200).json({
                message: `Event deleted successfully`
            });
        } catch (err) {
            next(err);
        }
    };

    public getEventsList = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const categoryId = req.query.categoryId
                ? parseInt(req.query.categoryId as string)
                : undefined;
            const eventTypeId = req.query.eventTypeId
                ? parseInt(req.query.eventTypeId as string)
                : undefined;

            const events = await this.event.getEventsList(categoryId, eventTypeId);

            res.status(200).json({
                data: events
            });
        } catch (err) {
            next(err);
        }
    };

    public browseEvent = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const searchQuery: string = req.query.q as string;
            
            const events = await this.event.browseEvent(searchQuery);

            res.status(200).json({
                data: events
            });
        } catch (err) {
            next(err);
        }
    };

    public viewEventAsAttendee = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const eventId: number = parseInt(req.params.eventId);

            const event = await this.event.viewEventAsAttendee(eventId);

            res.status(200).json({
                data: event
            });
        } catch (err) {
            next(err);
        }
    };

    public registerEvent = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { eventId, userId, ticketId, quantity, promotionId, voucherCode, usePoints } = req.body;

            const transaction = await this.event.registerEvent(eventId, userId, ticketId, quantity, promotionId, voucherCode, usePoints);

            res.status(200).json({
                message: `Event registration successful`,
                data: transaction,
            });
        } catch (err) {
            next(err);
        }
    };

    public giveReview = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const eventId = parseInt(req.params.eventId);
            const userId = parseInt(req.params.userId);
            const reviewData = req.body
            
            const review = await this.event.giveReview(eventId, userId, reviewData);

            res.status(200).json({
                message: `Thank you for your feedback! Your review has been submitted successfully`,
                data: review 
            });
        } catch (err) {
            next (err);
        }
    };
}