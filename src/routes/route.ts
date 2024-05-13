import { Router } from "express";
import { Routes } from "@/interfaces/routes.interface";

import { AuthController } from "@/controllers/auth.controller";
import { UserController } from '@/controllers/user.controller';
import { EventController } from '@/controllers/event.controller';
import { DashboardController } from '@/controllers/dashboard.controller';

import { AuthMiddleware } from "@/middlewares/auth.middleware";

export class AuthRoute implements Routes {
    router: Router;
    path: string;
    private Auth: AuthController;
    private User: UserController;
    private Event: EventController;
    private Dashboard: DashboardController;
    private Guard: AuthMiddleware;

    constructor() {
        this.router = Router();
        this.path = "/landing";
        this.Auth = new AuthController();
        this.Guard = new AuthMiddleware();
        this.User = new UserController();
        this.Event = new EventController();
        this.Dashboard = new DashboardController();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // Authentication Routes
        this.router.post(
            `${this.path}/register`,
            this.Auth.register
        );
        this.router.post(
            `${this.path}/login`,
            this.Auth.login
        );
        this.router.post(
            `${this.path}/verify`,
            this.Guard.authorizeUser,
            this.Auth.verify
        );
        this.router.post(
            `${this.path}/`,
            this.Guard.authorizeUser,
            this.Auth.refreshToken
        );

        // Profile Routes
        this.router.get(
            `${this.path}/profile`,
            this.Guard.authorizeUser,
            this.User.getProfile
        );
        this.router.put(
            `${this.path}/profile`,
            this.Guard.authorizeUser,
            this.User.editProfile
        );
        this.router.delete(
            `${this.path}/profile`,
            this.Guard.authorizeUser,
            this.User.deleteUser
        );

        // Attendee Routes
        this.router.get(
            `${this.path}/events`,
            this.Event.getEventsList
        );
        this.router.get(
            `${this.path}/events/browse`,
            this.Event.browseEvent
        );
        this.router.post(
            `${this.path}/events/:eventId/register`,
            this.Guard.authorizeAttendee,
            this.Event.registerEvent
        );
        this.router.post(
            `${this.path}/events/:eventId/review/:userId`,
            this.Guard.authorizeAttendee,
            this.Event.giveReview
        );
        this.router.get(
            `${this.path}/dashboard/registration-history`,
            this.Guard.authorizeAttendee,
            this.Dashboard.getRegistrationHistory
        );
        this.router.get(
            `${this.path}/dashboard/upcoming-events`,
            this.Guard.authorizeAttendee,
            this.Dashboard.getUpcomingEvents
        );
        this.router.get(
            `${this.path}/dashboard/attended-events`,
            this.Guard.authorizeAttendee,
            this.Dashboard.getAttendedEvents
        );

        // Organizer Routes
        this.router.post(
            `${this.path}/events`,
            this.Guard.authorizeOrganizer,
            this.Event.createEvent
        );
        this.router.post(
            `${this.path}/events/:eventId/promotions`,
            this.Guard.authorizeOrganizer,
            this.Event.addPromotion
        );
        this.router.post(
            `${this.path}/events/:eventId/tickets`,
            this.Guard.authorizeOrganizer,
            this.Event.addTicket
        );
        this.router.get(
            `${this.path}/events/:eventId`,
            this.Guard.authorizeOrganizer,
            this.Event.viewEventAsOrganizer
        );
        this.router.put(
            `${this.path}/events/:eventId`,
            this.Guard.authorizeOrganizer,
            this.Event.editEvent
        );
        this.router.delete(
            `${this.path}/events/:eventId`,
            this.Guard.authorizeOrganizer,
            this.Event.deleteEvent
        );
        this.router.get(
            `${this.path}/dashboard/events-by-organizer`,
            this.Guard.authorizeOrganizer,
            this.Dashboard.getEventsByOrganizer
        );
        this.router.get(
            `${this.path}/dashboard/events/:eventId/transactions`,
            this.Guard.authorizeOrganizer,
            this.Dashboard.getEventTransactions
        );
        this.router.get(
            `${this.path}/dashboard/organizer-stats`,
            this.Guard.authorizeOrganizer,
            this.Dashboard.getOrganizerStats
        );
    }
}

const authRoute = new AuthRoute();
export default authRoute.router;
