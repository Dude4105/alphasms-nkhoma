import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(): Promise<{
        stats: {
            title: string;
            value: string;
            change: string;
            icon: string;
            color: string;
            path: string;
        }[];
        recentApplications: {
            name: string;
            class: string;
            type: string;
            date: string;
            status: string;
        }[];
        recentResetRequests: {
            id: number;
            createdAt: Date;
            email: string;
            status: string;
            resolvedAt: Date | null;
        }[];
        topPerformers: any[];
    }>;
    getSettings(): Promise<{}>;
    updateSettings(data: Record<string, string>): Promise<{
        message: string;
        termTransition: boolean;
    }>;
    getFinalResultsMode(): Promise<{
        enabled: boolean;
    }>;
    setFinalResultsMode(enabled: boolean): Promise<{
        enabled: boolean;
        message: string;
    }>;
    getExamResultsPublished(): Promise<{
        enabled: boolean;
    }>;
    setExamResultsPublished(enabled: boolean): Promise<{
        enabled: boolean;
        message: string;
    }>;
    static readonly DEFAULT_GRADING_CONFIG: {
        grades: {
            grade: string;
            label: string;
            minScore: number;
            maxScore: number;
            points: number;
        }[];
        passMinScore: number;
    };
    static resolveGrade(score: number, config?: typeof AdminService.DEFAULT_GRADING_CONFIG): {
        grade: string;
        label: string;
        points: number;
    };
    getGradingSystem(): Promise<any>;
    updateGradingSystem(data: any): Promise<{
        message: string;
        config: any;
    }>;
    addAdmin(data: {
        email: string;
        firstName: string;
        lastName: string;
        phone?: string;
        permissions?: string[];
    }): Promise<{
        message: string;
        admin: {
            email: string;
            name: string;
            id: number;
        };
    }>;
    getAllAdmins(): Promise<{
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        joinedDate: string;
        permissions: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray;
    }[]>;
    changePassword(userId: number, data: {
        currentPass: string;
        newPass: string;
    }): Promise<{
        message: string;
    }>;
    getAdminMe(userId: number): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        permissions: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray;
    }>;
    getPasswordResets(): Promise<{
        id: number;
        createdAt: Date;
        email: string;
        status: string;
        resolvedAt: Date | null;
    }[]>;
    resolvePasswordReset(requestId: number): Promise<{
        message: string;
    }>;
    updateAdminPermissions(userId: number, permissions: string[]): Promise<{
        message: string;
        permissions: string[];
    }>;
    getAdminById(userId: number): Promise<{
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        joinedDate: string;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    }>;
    deleteAdmin(userId: number): Promise<{
        message: string;
    }>;
}
