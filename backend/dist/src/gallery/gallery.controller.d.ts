import { PaginationDto } from '../common/dto/pagination.dto';
import { GalleryService } from './gallery.service';
export declare class GalleryController {
    private readonly galleryService;
    constructor(galleryService: GalleryService);
    findAll(query: PaginationDto): Promise<{
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
    findOne(id: string): Promise<{
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
    }, file: Express.Multer.File): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string | null;
        imageUrl: string;
    }>;
    update(id: string, data: {
        title?: string;
        description?: string;
    }, file: Express.Multer.File): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string | null;
        imageUrl: string;
    }>;
    remove(id: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string | null;
        imageUrl: string;
    }>;
}
