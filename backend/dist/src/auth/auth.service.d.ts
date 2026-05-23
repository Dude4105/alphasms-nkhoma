import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    hashData(data: string): Promise<any>;
    getTokens(userId: number, email: string, role: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    updateRefreshToken(userId: number, refreshToken: string): Promise<void>;
    login(email: string, pass: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: number;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    register(email: string, pass: string, role: Role): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: number): Promise<void>;
    refreshTokens(userId: number, refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
}
