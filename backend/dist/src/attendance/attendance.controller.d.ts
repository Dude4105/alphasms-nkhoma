import { AttendanceService } from './attendance.service';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    getAttendance(classId: string, date: string): Promise<{
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
    saveAttendance(classId: string, payload: {
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
