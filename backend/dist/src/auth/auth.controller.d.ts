import { AuthService } from './auth.service';
import * as express from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signup(body: any, res: express.Response): Promise<{
        accessToken: string;
    }>;
    signin(body: any, res: express.Response): Promise<{
        user: {
            id: number;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
        accessToken: string;
    }>;
    logout(req: any, res: express.Response): Promise<{
        success: boolean;
    }>;
    refreshTokens(req: any, res: express.Response): Promise<{
        accessToken: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
}
