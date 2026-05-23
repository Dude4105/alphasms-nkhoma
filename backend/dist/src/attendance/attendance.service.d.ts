import { PrismaService } from '../prisma/prisma.service';
export declare class AttendanceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAttendanceForClass(classId: string, dateStr: string): Promise<{
        className: string;
        term: number;
        academicYear: string;
        date: string;
        students: {
            id: string;
            name: string;
            status: string;
        }[];
    }>;
    saveAttendanceForClass(classId: string, payload: {
        date: string;
        records: {
            studentId: string;
            status: string;
        }[];
    }): Promise<{
        success: boolean;
        count: number;
    }>;
}
