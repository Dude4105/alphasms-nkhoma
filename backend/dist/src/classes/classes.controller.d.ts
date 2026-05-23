import { ClassesService } from './classes.service';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class ClassesController {
    private readonly classesService;
    constructor(classesService: ClassesService);
    create(body: any): Promise<{
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
    findOne(id: string): Promise<{
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
    getClassResults(id: string, term?: string, year?: string): Promise<{
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
    update(id: string, body: any): Promise<{
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
    getUsedSubjects(id: string): Promise<string[]>;
    remove(id: string): Promise<{
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
}
