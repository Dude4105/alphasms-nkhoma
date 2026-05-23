import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signup(body: any): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    signin(body: any): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: number;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    logout(req: any): Promise<void>;
    refreshTokens(req: any): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
}
