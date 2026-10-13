import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class TeachersService {
    private prisma;
    constructor(prisma: PrismaService);
    private normalizeSubjectKey;
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
    create(data: any): Promise<{
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
    findOne(teacherId: string): Promise<{
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
    findByUserId(userId: number): Promise<{
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
    getMainClass(userId: number): Promise<{
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
    getDashboardData(userId: number): Promise<{
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
    getMyClasses(userId: number): Promise<{
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
    update(teacherId: string, data: any): Promise<{
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
    remove(teacherId: string): Promise<{
        id: number;
        updatedAt: Date;
        email: string;
        createdAt: Date;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        hashedRefreshToken: string | null;
    }>;
    getMainClassResults(userId: number, term?: number, year?: string): Promise<{
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
    getProfile(userId: number): Promise<{
        name: string;
        email: string | null;
        lastName: string;
        subjects: import("@prisma/client/runtime/library").JsonValue;
        classes: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getGradeConfig(classId: string, subjectKey: string, term: number, academicYear: string): Promise<{
        id: number;
        updatedAt: Date;
        academicYear: string;
        createdAt: Date;
        classId: number;
        term: number;
        subjectKey: string;
        config: import("@prisma/client/runtime/library").JsonValue;
    } | null>;
    saveGradeConfig(userId: number, data: any): Promise<{
        id: number;
        updatedAt: Date;
        academicYear: string;
        createdAt: Date;
        classId: number;
        term: number;
        subjectKey: string;
        config: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getInTermResults(userId: number, classId: string, term?: number, academicYear?: string): Promise<{
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
    getInTermResultsWithActiveContext(userId: number, classId: string, term?: number, academicYear?: string): Promise<{
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
    getGradeEntries(classId: string, subjectKey: string, term: number, academicYear: string): Promise<any[]>;
    bulkSaveGrades(userId: number, data: any): Promise<any[]>;
    getSubjectResults(userId: number, classId: string, subjectKey: string, term?: number, academicYear?: string): Promise<{
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
    changePassword(userId: number, data: any): Promise<{
        id: number;
        updatedAt: Date;
        email: string;
        createdAt: Date;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        hashedRefreshToken: string | null;
    }>;
    migrateClass(userId: number, classId: string, targetClassId: string, promotions: {
        studentId: string;
        action: 'migrate' | 'repeat';
    }[]): Promise<{
        message: string;
        migratedCount: number;
        repeatedCount: number;
    }>;
    private assertOwnsClass;
    getMigrationStatus(userId: number, role: string, classId: string): Promise<{
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
    decidePromotion(userId: number, role: string, classId: string, studentIdStr: string, action: 'promote' | 'repeat'): Promise<{
        message: string;
        status: string;
    }>;
    recalculateClassRanks(className: string, academicYear: string, term: number): Promise<void>;
}
