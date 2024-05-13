import { Request, Response, NextFunction } from "express";

import { AuthAction } from "../actions/auth.action";
import { User } from "@prisma/client";

import Container, { Service } from "typedi";

@Service()
export class AuthController {
    auth = Container.get(AuthAction);

    public register = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { email, username, roleId, password, referral } = req.body;
            const userData: User = {
                id: 0,
                username,
                email,
                roleId,
                password,
                referral: "",
                points: 0,
                isVerified: false,
                registrationDate: new Date(),
                updatedAt: new Date()
              };
              
              const data = await this.auth.register(userData, referral);

            res.status(200).json({
                message: `Congratulations! You have successfully register your account`,
                data,
            });
        } catch (err) {
            next(err);
        }
    };

    public login = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await this.auth.login(req.body);

            res.status(200).json({
                message: `Welcome! You have successfully logged in`,
                data,
            })
        } catch (err) {
            next(err);
        }
    };

    public refreshToken = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const email = req.user?.email;

            if (!email) {
                throw new Error(`User email not found`);
            }

            const result = await this.auth.refreshToken(email);

            res.status(200).json({
                message: `Refresh token success`,
                data: result,
            });
        } catch (err) {
            next(err);
        }
    };

    public verify = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const email = req.user?.email;

            if (!email) {
                throw new Error(`User email not found`);
            }

            await this.auth.verify(email);

            res.status(200).json({
                message: `Verify success`,
            });
        } catch (err) {
            next(err);
        }
    };

    // public logoutController = async (
    //     req: Request,
    //     res: Response,
    //     next: NextFunction
    // ): Promise<void> => {
    //     try {
    //         const token = req.headers.authorization?.split(" ")[1];

    //         if (!token) {
    //             throw new Error(`Unauthorized`);
    //         }

    //         await this.auth.logoutAction(token);

    //         res.status(200).json({
    //             message: `Logout success`,
    //         })
    //     } catch (err) {
    //         next(err);
    //     }
    // };
}