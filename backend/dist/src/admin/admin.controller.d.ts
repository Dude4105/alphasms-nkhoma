import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
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
    toggleFinalResultsMode(body: {
        enabled: boolean;
    }): Promise<{
        enabled: boolean;
        message: string;
    }>;
    getExamResultsPublished(): Promise<{
        enabled: boolean;
    }>;
    toggleExamResultsPublished(body: {
        enabled: boolean;
    }): Promise<{
        enabled: boolean;
        message: string;
    }>;
    getGradingSystem(): Promise<any>;
    updateGradingSystem(body: any): Promise<{
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
    getAdmins(): Promise<{
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        joinedDate: string;
        permissions: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray;
    }[]>;
    changePassword(req: any, data: {
        currentPass: string;
        newPass: string;
    }): Promise<{
        message: string;
    }>;
    getMe(req: any): Promise<{
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
    resolvePasswordReset(id: string): Promise<{
        message: string;
    }>;
    getAdmin(id: string): Promise<{
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        joinedDate: string;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    }> | null;
    updatePermissions(id: string, body: {
        permissions: string[];
    }): Promise<{
        message: string;
        permissions: string[];
    }>;
    deleteAdmin(id: string): Promise<{
        message: string;
    }> | null;
}
