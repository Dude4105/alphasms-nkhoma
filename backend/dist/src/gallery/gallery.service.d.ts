import { PrismaService } from '../prisma/prisma.service';
export declare class GalleryService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string | null;
        imageUrl: string;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string | null;
        imageUrl: string;
    }>;
    create(data: {
        title?: string;
        description?: string;
        imageUrl: string;
    }): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string | null;
        imageUrl: string;
    }>;
    update(id: number, data: {
        title?: string;
        description?: string;
        imageUrl?: string;
    }): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string | null;
        imageUrl: string;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string | null;
        imageUrl: string;
    }>;
}
