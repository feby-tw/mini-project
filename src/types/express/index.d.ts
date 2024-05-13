export type User = {
    userId: number;
    email: string;
    roleId: number;
    isVerified: boolean;
};

declare global {
    namespace Express {
        export interface Request {
            user?: User;
        }
    }
}