import { API_KEY } from "@/config";
import { User } from "@prisma/client";
import { Auth } from "@/interfaces/auth.interface";
import { HttpException } from "@/exceptions/http.exception";

import Container, { Service } from "typedi";
import { genSalt, hash, compare } from "bcrypt";
import { sign } from "jsonwebtoken";

import { AuthQuery } from "@/queries/auth.query";
import { UserQuery } from "@/queries/user.query";

@Service()
export class AuthAction {
    auth = Container.get(AuthQuery);
    user = Container.get(UserQuery);

    public register = async (
        userData: User,
        referral?:string
    ): Promise<User> => {
        try {
            const checkEmail = await this.user.getUserByEmail(userData.email);

            if (checkEmail)
                throw new HttpException(500, `User with this email already exists`);

            const checkUsername = await this.user.getUserByUsername(userData.username);

            if (checkUsername)
                throw new HttpException(500, `User with this username already exists`);

            const salt = await genSalt(10);
            const hashPass = await hash(userData.password, salt);

            const user = await this.auth.registerWithReferral(
                userData,
                hashPass,
                referral ? referral : ""
            );

            return user;
        } catch (err) {
            throw err;
        }
    };

    public login = async (
        data: Auth
    ) => {
        try {
            let user;

            if (data.email) {
                user = await this.user.getUserByEmail(data.email);

                if (!user)
                    throw new HttpException(500, `Login failed. User with this email doesn't exists`);
            } else if (data.username) {
                user = await this.user.getUserByUsername(data.username);

                if (!user)
                    throw new HttpException(500, `Login Failed. User with this username doesn't exists`);
            } else {
                throw new HttpException(400, `Email or username is required`);;
            }

            const isValid = await compare(data.password, user.password);

            if (!isValid)
                throw new HttpException(500, `Incorrect password`);

            const payload = {
                email: user.email,
                isVerified: user.isVerified
            };

            const token = sign(payload, String(API_KEY), { expiresIn: "1hr" });

            return token;
        } catch (err) {
            throw err;
        }
    };

    public refreshToken = async (
        email: string
    ) => {
        try {
            const findUser = await this.user.getUserByEmail(email);

            if (!findUser)
                throw new HttpException(500, `Something went wrong`);

            const payload = {
                email: findUser.email,
                role:findUser.roleId,
                isVerified: findUser.isVerified
            };

            const token = sign(payload, String(API_KEY), { expiresIn: "1hr" });

            return token;
        } catch (err) {
            throw err;
        }
    };

    public verify = async (
        email: string
    ) => {
        try {
            const findUser = await this.user.getUserByEmail(email);

            if (!findUser)
                throw new HttpException(500, `Something went wrong`);

            await this.auth.verify(findUser.email);
        } catch (err) {
            throw err;
        }
    };

//     public logoutAction = async(

//     ) => {
//         try {
            
//         } catch (err) {
//             throw err;
//         }
//     };
}