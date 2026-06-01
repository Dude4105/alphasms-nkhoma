import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class GalleryService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query?: PaginationDto): Promise<{
        data: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            title: string | null;
            imageUrl: string;
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
