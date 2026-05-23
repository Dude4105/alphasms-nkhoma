import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class ClassesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
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
    }>;
    findAll(query: PaginationDto): Promise<{
        data: ({
            _count: {
                students: number;
            };
        } & {
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
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
            limit: number;
        };
    }>;
    findOne(class_id: string): Promise<{
        students: {
            avg: string | number;
            id: number;
            firstName: string;
            lastName: string;
            student_id: string;
            gender: string | null;
            scholarType: string | null;
        }[];
        performance: {
            classAvg: string | number;
            passRate: string | number;
            topStudent: string;
        };
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
    } | null>;
    update(class_id: string, data: any): Promise<{
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
    }>;
    remove(class_id: string): Promise<{
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
    }>;
    getUsedSubjects(class_id: string): Promise<string[]>;
    getClassResults(classId: string, term?: number, year?: string): Promise<{
        class: null;
        results: never[];
        gradingConfig?: undefined;
    } | {
        class: {
            id: string;
            name: string;
            level: string | null;
            term: number;
            year: string;
            subjects: {
                id: any;
                name: any;
                key: string;
                color: string;
            }[];
        };
        gradingConfig: any;
        results: any[];
    }>;
    private syncTeacherClasses;
}
