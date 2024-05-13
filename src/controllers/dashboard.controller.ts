import { Request, Response, NextFunction } from 'express';

import { DashboardAction } from '@/actions/dashboard.action';

import Container from "typedi";

export class DashboardController {
    dashboard = Container.get(DashboardAction);

    public getRegistrationHistory = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            if (!req.user) {
                throw new Error('User not authenticated');
            }

            const userId: number = req.user.userId;
            const sortBy: "asc" | "desc" = req.body.sortBy;
        
            const transactions = await this.dashboard.getRegistrationHistory(userId, sortBy);

            res.status(200).json({
                data: transactions
            });
        } catch (err) {
            next(err);
        }
    };

    public getUpcomingEvents = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const events = await this.dashboard.getUpcomingEvents(req.body);

            res.status(200).json({
                data: events
            });
        } catch (err) {
            next(err);
        }
    };

    public getAttendedEvents = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const events = await this.dashboard.getAttendedEvents(req.body);

            res.status(200).json({
                data: events
            });
        } catch (err) {
            next(err);
        }
    };

    public getEventsByOrganizer = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await this.dashboard.getEventsByOrganizer(req.body);

            res.status(200).json({
                data
            });
        } catch (err) {
            next(err);
        }
    };

    public getEventTransactions = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const eventId: number = parseInt(req.params.eventId);
            const sortBy: "asc" | "desc" = req.body.sortBy;
        
            const transactions = await this.dashboard.getEventTransactions(eventId, sortBy);

            res.status(200).json({
                data: transactions
            });
        } catch (err) {
            next(err);
        }
    };

    public getOrganizerStats = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const statistics = await this.dashboard.getOrganizerStats();

            res.status(200).json({
                data: statistics
            });
        } catch (err) {
            next(err);
        }
    };
}