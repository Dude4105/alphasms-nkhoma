import { TeachersService } from './teachers.service';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class TeachersController {
    private readonly teachersService;
    constructor(teachersService: TeachersService);
    changePassword(req: any, body: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        hashedRefreshToken: string | null;
    }>;
    getGradeConfig(classId: string, subjectKey: string, term: string, academicYear: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        classId: number;
        academicYear: string;
        term: number;
        subjectKey: string;
        config: import("@prisma/client/runtime/library").JsonValue;
    } | null>;
    saveGradeConfig(req: any, body: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        classId: number;
        academicYear: string;
        term: number;
        subjectKey: string;
        config: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getGradeEntries(classId: string, subjectKey: string, term: string, academicYear: string): Promise<any[]>;
    bulkSaveGrades(req: any, body: any): Promise<any[]>;
    getProfile(req: any): Promise<{
        name: string;
        email: string | null;
        lastName: string;
        subjects: import("@prisma/client/runtime/library").JsonValue;
        classes: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getDashboard(req: any): Promise<{
        stats: never[];
        schedule: never[];
        notices: never[];
        teacherName?: undefined;
    } | {
        teacherName: string;
        stats: {
            title: string;
            value: string;
            icon: string;
            bg: string;
        }[];
        schedule: {
            time: string;
            subject: string;
            room: string;
            active: boolean;
        }[];
        notices: {
            title: string;
            content: string;
        }[];
    }>;
    getMyClasses(req: any): Promise<{
        teacher: null;
        classes: never[];
    } | {
        teacher: {
            id: string;
            name: string;
            subjects: string[];
        };
        classes: {
            id: string;
            name: string;
            level: string | null;
            room: string;
            students: number;
            schedule: string | null;
            subjects: import("@prisma/client/runtime/library").JsonValue;
            theme: string;
        }[];
    }>;
    getMyMainClass(req: any): Promise<{
        teacher: null;
        class: null;
        students: never[];
        stats?: undefined;
    } | {
        teacher: {
            id: number;
            firstName: string;
            lastName: string;
            phone: string | null;
            userId: number;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            subjects: import("@prisma/client/runtime/library").JsonValue | null;
            teacher_id: string;
            qualification: string | null;
            classes: import("@prisma/client/runtime/library").JsonValue | null;
        };
        class: null;
        students: never[];
        stats?: undefined;
    } | {
        teacher: {
            id: string;
            name: string;
            email: string | null;
            phone: string | null;
            subjects: import("@prisma/client/runtime/library").JsonValue;
            classes: import("@prisma/client/runtime/library").JsonValue;
        };
        class: {
            id: string;
            name: string;
            level: string | null;
            track: string | null;
            room: string | null;
            schedule: string | null;
            capacity: number | null;
            subjects: import("@prisma/client/runtime/library").JsonValue;
            classTeacher: string | null;
        };
        students: {
            id: string;
            name: string;
            gender: string | null;
            type: string;
            status: string;
        }[];
        stats: {
            total: number;
            boys: number;
            girls: number;
            boarding: number;
            day: number;
        };
    }>;
    getMainClassResults(req: any, term?: string, year?: string): Promise<{
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
    getInTermResults(req: any, classId: string, term?: string, year?: string): Promise<{
        name: string;
        level: string | null;
        term: string;
        subjects: {
            id: string;
            name: string;
            key: string;
        }[];
        gradingConfig: any;
        results: any[];
    }>;
    getSubjectResults(req: any, classId: string, subjectKey: string, term?: string, year?: string): Promise<{
        name: string;
        class: string;
        teacher: string;
        term: string;
        isFinalMode: boolean;
        results: {
            id: string;
            name: string;
            inTermScore: number;
            finalScore: number;
            total: number;
        }[];
    }>;
    migrateClass(req: any, classId: string, body: {
        targetClassId: string;
        promotions: {
            studentId: string;
            action: 'migrate' | 'repeat';
        }[];
    }): Promise<{
        message: string;
        migratedCount: number;
        repeatedCount: number;
    }>;
    unenrollStudent(studentId: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        hashedRefreshToken: string | null;
    }>;
    unenrollStaff(teacherId: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        hashedRefreshToken: string | null;
    }>;
    create(body: any): Promise<{
        id: number;
        firstName: string;
        lastName: string;
        phone: string | null;
        userId: number;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        subjects: import("@prisma/client/runtime/library").JsonValue | null;
        teacher_id: string;
        qualification: string | null;
        classes: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAll(query: PaginationDto): Promise<{
        data: {
            id: number;
            firstName: string;
            lastName: string;
            phone: string | null;
            userId: number;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            subjects: import("@prisma/client/runtime/library").JsonValue | null;
            teacher_id: string;
            qualification: string | null;
            classes: import("@prisma/client/runtime/library").JsonValue | null;
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
        firstName: string;
        lastName: string;
        phone: string | null;
        userId: number;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        subjects: import("@prisma/client/runtime/library").JsonValue | null;
        teacher_id: string;
        qualification: string | null;
        classes: import("@prisma/client/runtime/library").JsonValue | null;
    } | null>;
    update(id: string, body: any): Promise<{
        id: number;
        firstName: string;
        lastName: string;
        phone: string | null;
        userId: number;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        subjects: import("@prisma/client/runtime/library").JsonValue | null;
        teacher_id: string;
        qualification: string | null;
        classes: import("@prisma/client/runtime/library").JsonValue | null;
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
