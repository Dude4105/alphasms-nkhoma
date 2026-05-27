import { StudentsService } from './students.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class PublicResultsController {
    private readonly studentsService;
    private readonly prisma;
    constructor(studentsService: StudentsService, prisma: PrismaService);
    getPublicReport(id: string, term?: string, academicYear?: string): Promise<{
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
        student_id: string;
        gender: string | null;
        dob: string | null;
        enrollmentDate: string | null;
        scholarType: string | null;
        guardianName: string | null;
        guardianRelation: string | null;
        guardianPhone: string | null;
        guardianEmail: string | null;
        guardianAddress: string | null;
        classHistory: string | null;
        classId: number | null;
        hostelId: number | null;
    } | null>;
    getPublicHistory(studentId: string, academicYear?: string): Promise<{
        student: {
            student_id: string;
            firstName: string;
            lastName: string;
            className: string | null;
            classHistory: string | null;
        };
        history: {
            term1: {
                term: number;
                year: string;
                average: number;
                points: number;
                rank: number;
                totalStudents: number;
                attendance: number;
                topSubjects: string[];
                grades: any[];
            } | null;
            term2: {
                term: number;
                year: string;
                average: number;
                points: number;
                rank: number;
                totalStudents: number;
                attendance: number;
                topSubjects: string[];
                grades: any[];
            } | null;
            term3: {
                term: number;
                year: string;
                average: number;
                points: number;
                rank: number;
                totalStudents: number;
                attendance: number;
                topSubjects: string[];
                grades: any[];
            } | null;
        };
        activeYear: string;
    } | null>;
    getStatus(): Promise<{
        published: boolean;
    }>;
    getInfo(): Promise<{}>;
    checkResults(body: {
        firstName: string;
        lastName: string;
        dob: string;
    }): Promise<{
        published: boolean;
        message: string;
        found?: undefined;
        student?: undefined;
    } | {
        published: boolean;
        found: boolean;
        message: string;
        student?: undefined;
    } | {
        published: boolean;
        found: boolean;
        student: {
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
            student_id: string;
            gender: string | null;
            dob: string | null;
            enrollmentDate: string | null;
            scholarType: string | null;
            guardianName: string | null;
            guardianRelation: string | null;
            guardianPhone: string | null;
            guardianEmail: string | null;
            guardianAddress: string | null;
            classHistory: string | null;
            classId: number | null;
            hostelId: number | null;
        };
        message?: undefined;
    }>;
}
