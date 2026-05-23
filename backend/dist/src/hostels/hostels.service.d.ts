import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class HostelsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: PaginationDto): Promise<{
        data: ({
            owner: {
                user: {
                    email: string;
                    role: import(".prisma/client").$Enums.Role;
                };
            };
            _count: {
                students: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            capacity: number;
            hostel_id: string;
            type: string | null;
            warden: string | null;
            ownerId: number;
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
            limit: number;
        };
    }>;
    findOne(id: number): Promise<({
        students: {
            id: number;
            firstName: string;
            lastName: string;
            student_id: string;
        }[];
        owner: {
            user: {
                email: string;
                role: import(".prisma/client").$Enums.Role;
            };
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        capacity: number;
        hostel_id: string;
        type: string | null;
        warden: string | null;
        ownerId: number;
    }) | null>;
    getStats(): Promise<{
        totalCapacity: number;
        currentlyBoarding: number;
        occupancyRate: string;
        maintenanceRooms: number;
    }>;
    create(data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        capacity: number;
        hostel_id: string;
        type: string | null;
        warden: string | null;
        ownerId: number;
    }>;
}
