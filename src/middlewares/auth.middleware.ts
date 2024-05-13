import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { API_KEY } from "../config";
import { User } from "../types/express";

import { HttpException } from "../exceptions/http.exception";

export class AuthMiddleware {
    authorizeUser = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const token = req.header("Authorization")?.replace("Bearer ", "");

            if (!token)
                throw new HttpException(500, `Invalid token`);

            const verifyUser = verify(token, String(API_KEY));

            if (!verifyUser)
                throw new HttpException(500, `Unauthorized`);

            req.user = verifyUser as User;

            next();
        } catch (err) {
            next(err);
        }
    };

    authorizeAttendee = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            await this.authorizeUser(req, res, () => {});

            if ((req.user as User).roleId !== 1)
                throw new HttpException(403, `Unauthorized access! Attendee role required`);

            next();
        } catch (err) {
            next(err);
        }
    };

    authorizeOrganizer = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            await this.authorizeUser(req, res, () => {});

            if ((req.user as User).roleId !== 2)
                throw new HttpException(403, `Unauthorized access! Organizer role required`);

            next();
        } catch (err) {
            next(err);
        }
    };
}