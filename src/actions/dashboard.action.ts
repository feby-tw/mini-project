import { Event, Transaction } from "@prisma/client";
import { HttpException } from "@/exceptions/http.exception";

import Container, { Service } from "typedi";

import { DashboardQuery } from "@/queries/dashboard.query";

interface OrganizerStats {
    attendeesSatisfaction: { eventId: number; averageRating: number }[];
    ticketSales: { eventId: number; ticketTypeId: number; percentageSold: number }[];
    revenue: { eventId: number; totalRevenue: number }[];
}

@Service()
export class DashboardAction {
    dashboard = Container.get(DashboardQuery);

    public getRegistrationHistory = async (
        userId: number,
        sortBy: "asc" | "desc"
    ): Promise<Transaction[]> => {
        try {
            const transactions = await this.dashboard.getRegistrationHistory(userId, sortBy);

            if (!transactions || transactions.length === 0)
                throw new HttpException(404, `You have not registered for any events`);

            return transactions;
        } catch (err) {
            throw err;
        }
    };

    public getUpcomingEvents = async (
        userId: number
    ): Promise<Event[]> => {
        try {
            const events = await this.dashboard.getUpcomingEvents(userId);

            if (!events || events.length === 0)
                throw new HttpException(404, `No upcoming event`);

            return events;
        } catch (err) {
            throw err;
        }
    };

    public getAttendedEvents = async (
        userId: number
    ): Promise<Event[]> => {
        try {
            const events = await this.dashboard.getAttendedEvents(userId);

            if (!events || events.length === 0)
                throw new HttpException(404, `You have not attended any events`);

            return events;
        } catch (err) {
            throw err;
        }
    };

    public getEventsByOrganizer = async (
        organizerId: number,
        sortBy?: "asc" | "desc"
    ): Promise<Event[]> => {
        try {
            const events = await this.dashboard.getEventsByOrganizer(organizerId, sortBy);

            if (!events || events.length === 0)
                throw new HttpException(404, `No events have been created yet`);

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
            const transactions = await this.dashboard.getEventTransactions(eventId, sortBy);

            if (!transactions || transactions.length === 0)
                throw new HttpException(404, `There are no transactions in this event yet`);

            return transactions;
        } catch (err) {
            throw err;
        }
    };

    public getOrganizerStats = async (
    ): Promise<OrganizerStats> => {
        try {
            const statistics = await this.dashboard.getOrganizerStats();

            if (!statistics)
                throw new HttpException(404, `Statistics not found`);

            return statistics;
        } catch (err) {
            throw err;
        }
    };
}