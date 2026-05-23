import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class SubjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        subject_code: string;
        department: string | null;
        description: string | null;
    }>;
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
    findOne(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        subject_code: string;
        department: string | null;
        description: string | null;
    } | null>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        subject_code: string;
        department: string | null;
        description: string | null;
    }>;
    bulkCreate(subjects: any[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
