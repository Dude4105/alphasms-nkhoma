import { TeachersService } from './teachers.service';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class TeachersController {
    private readonly teachersService;
    constructor(teachersService: TeachersService);
    getSystemSettings(): Promise<{
        academicYear: string;
        currentTerm: string;
        finalResultsMode: boolean;
        gradingPassMin: number;
        schoolName: string;
        schoolCampus: string;
        schoolAddress: string;
        schoolPOBox: string;
        schoolPhone: string;
        schoolEmail: string;
    }>;
    changePassword(req: any, body: any): Promise<{
        id: number;
        updatedAt: Date;
        email: string;
        createdAt: Date;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        hashedRefreshToken: string | null;
    }>;
    getGradeConfig(classId: string, subjectKey: string, term: string, academicYear: string): Promise<{
        id: number;
        updatedAt: Date;
        academicYear: string;
        createdAt: Date;
        classId: number;
        term: number;
        subjectKey: string;
        config: import("@prisma/client/runtime/library").JsonValue;
    } | null>;
    saveGradeConfig(req: any, body: any): Promise<{
        id: number;
        updatedAt: Date;
        academicYear: string;
        createdAt: Date;
        classId: number;
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
            updatedAt: Date;
            teacher_id: string;
            firstName: string;
            lastName: string;
            email: string | null;
            phone: string | null;
            qualification: string | null;
            subjects: import("@prisma/client/runtime/library").JsonValue | null;
            classes: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            userId: number;
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
    getMigrationStatus(req: any, classId: string): Promise<{
        run: null;
        currentYear: string | null;
        class: {
            id: string;
            name: string;
        };
        students: never[];
    } | {
        run: {
            fromYear: string;
            toYear: string;
            promoted: number;
            pending: number;
            completed: number;
            createdAt: Date;
        };
        currentYear: string | null;
        class: {
            id: string;
            name: string;
        };
        students: {
            id: string;
            name: string;
            gender: string | null;
            status: string;
            sourceClassName: string;
            targetClassName: string | null;
            reasons: import("@prisma/client/runtime/library").JsonValue;
            decidedAt: Date | null;
        }[];
    }>;
    decidePromotion(req: any, classId: string, body: {
        studentId: string;
        action: 'promote' | 'repeat';
    }): Promise<{
        message: string;
        status: string;
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
        updatedAt: Date;
        email: string;
        createdAt: Date;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        hashedRefreshToken: string | null;
    }>;
    unenrollStaff(teacherId: string): Promise<{
        id: number;
        updatedAt: Date;
        email: string;
        createdAt: Date;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        hashedRefreshToken: string | null;
    }>;
    create(body: any): Promise<{
        id: number;
        updatedAt: Date;
        teacher_id: string;
        firstName: string;
        lastName: string;
        email: string | null;
        phone: string | null;
        qualification: string | null;
        subjects: import("@prisma/client/runtime/library").JsonValue | null;
        classes: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        userId: number;
    }>;
    findAll(query: PaginationDto): Promise<{
        data: {
            id: number;
            updatedAt: Date;
            teacher_id: string;
            firstName: string;
            lastName: string;
            email: string | null;
            phone: string | null;
            qualification: string | null;
            subjects: import("@prisma/client/runtime/library").JsonValue | null;
            classes: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            userId: number;
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
        updatedAt: Date;
        teacher_id: string;
        firstName: string;
        lastName: string;
        email: string | null;
        phone: string | null;
        qualification: string | null;
        subjects: import("@prisma/client/runtime/library").JsonValue | null;
        classes: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        userId: number;
    } | null>;
    update(id: string, body: any): Promise<{
        id: number;
        updatedAt: Date;
        teacher_id: string;
        firstName: string;
        lastName: string;
        email: string | null;
        phone: string | null;
        qualification: string | null;
        subjects: import("@prisma/client/runtime/library").JsonValue | null;
        classes: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        userId: number;
    }>;
    remove(id: string): Promise<{
        id: number;
        updatedAt: Date;
        email: string;
        createdAt: Date;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        hashedRefreshToken: string | null;
    }>;
}
