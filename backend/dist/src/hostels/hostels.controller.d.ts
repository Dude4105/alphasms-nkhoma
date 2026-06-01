import { HostelsService } from './hostels.service';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class HostelsController {
    private readonly hostelsService;
    constructor(hostelsService: HostelsService);
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
    create(body: any): Promise<{
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
    getStats(): Promise<{
        totalCapacity: number;
        currentlyBoarding: number;
        occupancyRate: string;
        maintenanceRooms: number;
    }>;
    findOne(id: string): Promise<({
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
    update(id: string, body: any): Promise<{
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
    remove(id: string): Promise<{
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
