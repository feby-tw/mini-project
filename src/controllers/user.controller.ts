import { Request, Response, NextFunction } from "express";

import { UserAction } from "@/actions/user.action";

import Container from "typedi";

export class UserController {
    user = Container.get(UserAction);

    public getProfile = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            if (!req.user) {
                throw new Error(`User not authenticated`);
            }

            const data = await this.user.getProfile(req.user.userId);

            res.status(200).json({
                data,
            });
        } catch (err) {
            next(err);
        }
    };

    public editProfile = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { userId, newData } = req.body;

            const data = await this.user.editProfile(userId, newData);

            res.status(200).json({
                message: `Your changes have been successfully saved`,
                data,
            })
        } catch (err) {
            next(err);
        }
    };

    public deleteUser = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            await this.user.deleteUser(req.body.userId);

            res.status(200).json({
                message: `Your account was successfully deleted`,
            });
        } catch (err) {
            next(err);
        }
    };
}