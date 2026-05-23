import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getAttendanceForClass(classId: string, dateStr: string) {
    // 1. Resolve Class
    const classEntity = await this.prisma.class.findUnique({
      where: { class_id: classId },
      include: { students: true },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // 2. Resolve current Term and Academic Year settings
    const termSetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'currentTerm' },
    });
    const yearSetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'academicYear' },
    });

    const activeTerm = termSetting ? parseInt(termSetting.value) : 1;
    const activeYear = yearSetting ? yearSetting.value : new Date().getFullYear().toString();

    // 3. Fetch all attendance records for students in this class on this date
    const studentIds = classEntity.students.map((s) => s.id);
    const attendanceRecords = await this.prisma.attendance.findMany({
      where: {
        studentId: { in: studentIds },
        date: dateStr,
      },
    });

    const recordMap = new Map(attendanceRecords.map((r) => [r.studentId, r.status]));

    // 4. Map students with status
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

  async saveAttendanceForClass(
    classId: string,
    payload: { date: string; records: { studentId: string; status: string }[] },
  ) {
    const { date, records } = payload;

    // 1. Resolve Class
    const classEntity = await this.prisma.class.findUnique({
      where: { class_id: classId },
      include: { students: true },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${classId} not found`);
    }

    // 2. Resolve active settings
    const termSetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'currentTerm' },
    });
    const yearSetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'academicYear' },
    });

    const activeTerm = termSetting ? parseInt(termSetting.value) : 1;
    const activeYear = yearSetting ? yearSetting.value : new Date().getFullYear().toString();

    // Map class student string id (student_id) to their numeric primary key (id)
    const studentMap = new Map(classEntity.students.map((s) => [s.student_id, s.id]));

    // 3. Perform upserts inside a transaction for atomic safety
    const validOperations = records
      .filter((rec) => studentMap.has(rec.studentId))
      .map((rec) => {
        const studentNumericId = studentMap.get(rec.studentId)!;

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
}
