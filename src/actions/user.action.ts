import { User } from "@prisma/client";
import { HttpException } from "@/exceptions/http.exception";

import Container, { Service } from "typedi";

import { UserQuery } from "@/queries/user.query";

@Service()
export class UserAction {
    user = Container.get(UserQuery);

    public getProfile = async (
        userId: number
    ): Promise<User | null> => {
        try {
            const userProfile = await this.user.getUserById(userId);

            if (!userProfile)
                throw new HttpException(500, `User profile not found`);

            return userProfile;
        } catch (err) {
            throw err;
        }
    };

    public editProfile = async (
        userId: number,
        newData: User
    ): Promise<User | null> => {
        try {
            const findUser = await this.user.getUserById(userId);

            if (!findUser)
                throw new HttpException(500, `Cannot edit profile, user doesn't exist`);

            return await this.user.editProfile(userId, newData);
        } catch (err) {
            throw err;
        }
    };

    public deleteUser = async (
        userId: number
    ): Promise<void> => {
        try {
            const findUser = await this.user.getUserById(userId);

            if (!findUser)
                throw new HttpException(500, `Delete account failed, user doesn't exist`);

            return await this.user.deleteUser(userId);
        } catch (err) {
            throw err;
        }
    };
}