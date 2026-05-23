import { FeedsService } from './feeds.service';
export declare class FeedsController {
    private readonly feedsService;
    constructor(feedsService: FeedsService);
    findAllPublic(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        images: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    findAllAdmin(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        images: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    findOne(id: string): Promise<{
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
    }, files: Array<Express.Multer.File>): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        images: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    update(id: string, data: {
        title?: string;
        content?: string;
        existingImages?: string | string[];
    }, files: Array<Express.Multer.File>): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        images: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    remove(id: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        images: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
