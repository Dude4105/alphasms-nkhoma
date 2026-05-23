import { SubjectsService } from './subjects.service';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class SubjectsController {
    private readonly subjectsService;
    constructor(subjectsService: SubjectsService);
    create(body: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        subject_code: string;
        department: string | null;
        description: string | null;
    }>;
    bulkCreate(body: {
        subjects: any[];
    }): Promise<import(".prisma/client").Prisma.BatchPayload>;
    findAll(query: PaginationDto): Promise<{
        data: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            subject_code: string;
            department: string | null;
            description: string | null;
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
        name: string;
        subject_code: string;
        department: string | null;
        description: string | null;
    } | null>;
    remove(id: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        subject_code: string;
        department: string | null;
        description: string | null;
    }>;
}
