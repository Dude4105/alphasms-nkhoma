import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class FeedsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query?: PaginationDto): Promise<{
        data: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            content: string;
            images: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
            limit: number;
        };
    }>;
    findOne(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        images: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    create(data: {
        title: string;
        content: string;
        images?: string[];
    }): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        images: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    update(id: number, data: {
        title?: string;
        content?: string;
        images?: string[];
    }): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        images: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        images: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
