import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class HostelsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: PaginationDto): Promise<{
        data: ({
            _count: {
                students: number;
            };
            owner: {
                user: {
                    email: string;
                    role: import(".prisma/client").$Enums.Role;
                };
            } | null;
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            capacity: number;
            hostel_id: string;
            type: string | null;
            warden: string | null;
            wardenPhone: string | null;
            wardenEmail: string | null;
            ownerId: number | null;
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
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        capacity: number;
        hostel_id: string;
        type: string | null;
        warden: string | null;
        wardenPhone: string | null;
        wardenEmail: string | null;
        ownerId: number | null;
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
        wardenPhone: string | null;
        wardenEmail: string | null;
        ownerId: number | null;
    }>;
    update(id: number, data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        capacity: number;
        hostel_id: string;
        type: string | null;
        warden: string | null;
        wardenPhone: string | null;
        wardenEmail: string | null;
        ownerId: number | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        capacity: number;
        hostel_id: string;
        type: string | null;
        warden: string | null;
        wardenPhone: string | null;
        wardenEmail: string | null;
        ownerId: number | null;
    }>;
}
