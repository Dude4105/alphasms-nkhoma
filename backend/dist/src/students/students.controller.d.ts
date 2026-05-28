import { StudentsService } from './students.service';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class StudentsController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
    create(body: any): Promise<{
        id: number;
        firstName: string;
        lastName: string;
        userId: number;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        gender: string | null;
        dob: string | null;
        guardianName: string | null;
        guardianRelation: string | null;
        guardianAddress: string | null;
        student_id: string;
        enrollmentDate: string | null;
        scholarType: string | null;
        guardianPhone: string | null;
        guardianEmail: string | null;
        classId: number | null;
        hostelId: number | null;
        classHistory: string | null;
    }>;
    findAll(query: PaginationDto): Promise<{
        data: ({
            user: {
                email: string;
                role: import(".prisma/client").$Enums.Role;
            };
            class: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                class_id: string;
                level: string | null;
                track: string | null;
                room: string | null;
                classTeacher: string | null;
                schedule: string | null;
                capacity: number | null;
                subjects: import("@prisma/client/runtime/library").JsonValue | null;
                timetable: import("@prisma/client/runtime/library").JsonValue | null;
            } | null;
            hostel: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                capacity: number;
                hostel_id: string;
                type: string | null;
                warden: string | null;
                ownerId: number;
            } | null;
        } & {
            id: number;
            firstName: string;
            lastName: string;
            userId: number;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            gender: string | null;
            dob: string | null;
            guardianName: string | null;
            guardianRelation: string | null;
            guardianAddress: string | null;
            student_id: string;
            enrollmentDate: string | null;
            scholarType: string | null;
            guardianPhone: string | null;
            guardianEmail: string | null;
            classId: number | null;
            hostelId: number | null;
            classHistory: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
            limit: number;
        };
    }>;
    findOne(id: string, term?: string, academicYear?: string): Promise<{
        schoolInfo: any;
        class: {
            name: string;
        };
        academic: {
            term: number;
            year: string;
            average: number;
            points: number;
            rank: number;
            totalStudents: number;
            attendance: number;
            topSubjects: string[];
            grades: any[];
        };
        hostel: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            capacity: number;
            hostel_id: string;
            type: string | null;
            warden: string | null;
            ownerId: number;
        } | null;
        id: number;
        firstName: string;
        lastName: string;
        userId: number;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        gender: string | null;
        dob: string | null;
        guardianName: string | null;
        guardianRelation: string | null;
        guardianAddress: string | null;
        student_id: string;
        enrollmentDate: string | null;
        scholarType: string | null;
        guardianPhone: string | null;
        guardianEmail: string | null;
        classId: number | null;
        hostelId: number | null;
        classHistory: string | null;
    } | null>;
    update(id: string, body: any): Promise<{
        id: number;
        firstName: string;
        lastName: string;
        userId: number;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        gender: string | null;
        dob: string | null;
        guardianName: string | null;
        guardianRelation: string | null;
        guardianAddress: string | null;
        student_id: string;
        enrollmentDate: string | null;
        scholarType: string | null;
        guardianPhone: string | null;
        guardianEmail: string | null;
        classId: number | null;
        hostelId: number | null;
        classHistory: string | null;
    }>;
    remove(id: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        hashedRefreshToken: string | null;
    }>;
}
