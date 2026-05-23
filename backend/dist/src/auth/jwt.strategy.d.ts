import { PrismaService } from '../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: any): Promise<{
        userId: any;
        email: any;
        role: any;
    }>;
}
export {};
