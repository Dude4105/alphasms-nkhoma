"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AttendanceService = class AttendanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAttendanceForClass(classId, dateStr) {
        const classEntity = await this.prisma.class.findUnique({
            where: { class_id: classId },
            include: { students: true },
        });
        if (!classEntity) {
            throw new common_1.NotFoundException(`Class with ID ${classId} not found`);
        }
        const termSetting = await this.prisma.systemSetting.findUnique({
            where: { key: 'currentTerm' },
        });
        const yearSetting = await this.prisma.systemSetting.findUnique({
            where: { key: 'academicYear' },
        });
        const activeTerm = termSetting ? parseInt(termSetting.value) : 1;
        const activeYear = yearSetting ? yearSetting.value : new Date().getFullYear().toString();
        const studentIds = classEntity.students.map((s) => s.id);
        const attendanceRecords = await this.prisma.attendance.findMany({
            where: {
                studentId: { in: studentIds },
                date: dateStr,
            },
        });
        const recordMap = new Map(attendanceRecords.map((r) => [r.studentId, r.status]));
        const studentList = classEntity.students.map((student) => ({
            id: student.student_id,
            name: `${student.firstName} ${student.lastName}`,
            status: recordMap.get(student.id) || 'unmarked',
        }));
        return {
            className: classEntity.name,
            term: activeTerm,
            academicYear: activeYear,
            date: dateStr,
            students: studentList,
        };
    }
    async saveAttendanceForClass(classId, payload) {
        const { date, records } = payload;
        const classEntity = await this.prisma.class.findUnique({
            where: { class_id: classId },
            include: { students: true },
        });
        if (!classEntity) {
            throw new common_1.NotFoundException(`Class with ID ${classId} not found`);
        }
        const termSetting = await this.prisma.systemSetting.findUnique({
            where: { key: 'currentTerm' },
        });
        const yearSetting = await this.prisma.systemSetting.findUnique({
            where: { key: 'academicYear' },
        });
        const activeTerm = termSetting ? parseInt(termSetting.value) : 1;
        const activeYear = yearSetting ? yearSetting.value : new Date().getFullYear().toString();
        const studentMap = new Map(classEntity.students.map((s) => [s.student_id, s.id]));
        const validOperations = records
            .filter((rec) => studentMap.has(rec.studentId))
            .map((rec) => {
            const studentNumericId = studentMap.get(rec.studentId);
            return this.prisma.attendance.upsert({
                where: {
                    studentId_date: {
                        studentId: studentNumericId,
                        date,
                    },
                },
                update: {
                    status: rec.status,
                    term: activeTerm,
                    academicYear: activeYear,
                },
                create: {
                    studentId: studentNumericId,
                    date,
                    status: rec.status,
                    term: activeTerm,
                    academicYear: activeYear,
                },
            });
        });
        if (validOperations.length > 0) {
            await this.prisma.$transaction(validOperations);
        }
        return { success: true, count: records.length };
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map