import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AdminService } from '../admin/admin.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const passwordHash = await bcrypt.hash('password123', 10);
    // Prefer student's own email if provided, otherwise fallback to auto-generated or guardian email
    const email =
      data.email ||
      data.guardianEmail ||
      `${data.student_id.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.sims.com`;

    return this.prisma.$transaction(async (tx) => {
      // Create auth user
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: Role.STUDENT,
        },
      });

      // Find or create class
      let classRecord;
      if (data.className) {
        classRecord = await tx.class.findFirst({
          where: { name: data.className },
        });

        if (!classRecord) {
          classRecord = await tx.class.create({
            data: {
              class_id: `CLS-${Date.now()}`,
              name: data.className,
            },
          });
        }
      }

      // Create student profile
      const student = await tx.student.create({
        data: {
          student_id: data.student_id,
          firstName: data.firstName,
          lastName: data.lastName,
          email,
          gender: data.gender,
          dob: data.dob,
          enrollmentDate: data.enrollmentDate,
          scholarType: data.scholarType,
          guardianName: data.guardianName,
          guardianRelation: data.guardianRelation,
          guardianPhone: data.guardianPhone,
          guardianEmail: data.guardianEmail,
          guardianAddress: data.guardianAddress,
          user: { connect: { id: user.id } },
          ...(classRecord && { class: { connect: { id: classRecord.id } } }),
          ...(data.hostelId && {
            hostel: { connect: { id: Number(data.hostelId) } },
          }),
        },
      });

      return student;
    });
  }

  async findAll(query: PaginationDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = query.search
      ? {
          OR: [
            { firstName: { contains: query.search } },
            { lastName: { contains: query.search } },
            { email: { contains: query.search } },
            { student_id: { contains: query.search } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: {
          class: true,
          hostel: true,
          user: {
            select: {
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        limit,
      },
    };
  }

  async findOne(studentId: string, term?: number, year?: string) {
    const student = await this.prisma.student.findUnique({
      where: { student_id: studentId },
      include: {
        class: true,
        hostel: true,
      },
    });

    if (!student) return null;

    // Fetch system settings including grading and school identity
    const settings = await this.prisma.systemSetting.findMany({
      where: {
        key: { in: ['finalResultsMode', 'academicYear', 'currentTerm', 'gradingSystem', 'schoolName', 'schoolCampus', 'schoolAddress', 'schoolPOBox', 'schoolPhone'] },
      },
    });
    let isFinalMode = false;
    let academicYear = year || '2026';
    let currentTerm = 1;
    let gradingConfig = AdminService.DEFAULT_GRADING_CONFIG;
    const schoolInfo: any = {
      name: 'ALPHABET SMIS',
      campus: 'HEROES ACADEMY',
      address: 'Blantyre, Malawi',
      poBox: 'P.O. Box 2025, Blantyre',
      phone: '+265 888 123 456'
    };

    for (const setting of settings) {
      if (setting.key === 'finalResultsMode') isFinalMode = setting.value === 'true';
      if (!year && setting.key === 'academicYear') academicYear = setting.value;
      if (setting.key === 'currentTerm') currentTerm = parseInt(setting.value) || 1;
      if (setting.key === 'gradingSystem') {
        try { gradingConfig = JSON.parse(setting.value); } catch {}
      }
      if (setting.key === 'schoolName') schoolInfo.name = setting.value;
      if (setting.key === 'schoolCampus') schoolInfo.campus = setting.value;
      if (setting.key === 'schoolAddress') schoolInfo.address = setting.value;
      if (setting.key === 'schoolPOBox') schoolInfo.poBox = setting.value;
      if (setting.key === 'schoolPhone') schoolInfo.phone = setting.value;
    }

    if (term !== undefined && !isNaN(term)) {
      currentTerm = term;
    }

    // Determine what class the student belonged to in this year
    let targetClassName = student.class?.name || 'Unassigned';
    if (student.classHistory) {
      try {
        const hist = JSON.parse(student.classHistory);
        if (hist[academicYear]) {
          targetClassName = hist[academicYear];
        }
      } catch {}
    }

    // Find all students who were in this class during that year
    const studentsInClass = await this.prisma.student.findMany({
      where: {
        OR: [
          { class: { name: targetClassName } },
          { classHistory: { contains: `"${academicYear}":"${targetClassName}"` } }
        ]
      },
      select: { id: true, student_id: true }
    });
    const studentIdsInClass = studentsInClass.map(s => s.id);
    const totalStudents = studentIdsInClass.length;

    let average = 0;
    let rank = 0;
    let grades: any[] = [];
    let topSubjects: string[] = [];

    // Find the class entity for subjects list
    const classEntity = await this.prisma.class.findFirst({
      where: { name: targetClassName }
    });

    if (classEntity && totalStudents > 0) {
      const subjectsCount = Array.isArray(classEntity.subjects)
        ? classEntity.subjects.length
        : 0;

      if (isFinalMode) {
        const results = await this.prisma.result.findMany({
          where: {
            studentId: { in: studentIdsInClass },
            academicYear,
            term: currentTerm,
          },
        });

        const studentAverages: { id: number; avg: number }[] = [];
        const resultsByStudent = new Map<number, { total: number; results: any[] }>();
        const resultsBySubject = new Map<string, { id: number; score: number }[]>();

        results.forEach((res) => {
          if (!resultsByStudent.has(res.studentId))
            resultsByStudent.set(res.studentId, { total: 0, results: [] });
          resultsByStudent.get(res.studentId)!.total += res.score;
          resultsByStudent.get(res.studentId)!.results.push(res);

          if (!resultsBySubject.has(res.subjectKey)) resultsBySubject.set(res.subjectKey, []);
          resultsBySubject.get(res.subjectKey)!.push({ id: res.studentId, score: res.score });
        });

        resultsByStudent.forEach((data, sId) => {
          studentAverages.push({
            id: sId,
            avg: subjectsCount > 0 ? Math.round(data.total / subjectsCount) : 0,
          });
        });

        studentAverages.sort((a, b) => b.avg - a.avg);
        const myRank = studentAverages.findIndex((s) => s.id === student.id) + 1;
        const myData = studentAverages.find((s) => s.id === student.id);

        if (myRank > 0 && myData) {
          rank = myRank;
          average = myData.avg;

          const myResults = resultsByStudent.get(student.id)?.results || [];
          grades = myResults.map((r) => {
            const resolved = AdminService.resolveGrade(r.score, gradingConfig);
            const subjectScores = resultsBySubject.get(r.subjectKey) || [];
            subjectScores.sort((a, b) => b.score - a.score);
            const subjectRank = subjectScores.findIndex(s => s.id === student.id) + 1;
            const highestScore = subjectScores.length > 0 ? subjectScores[0].score : 0;
            
            return {
              subject: r.subjectKey.toUpperCase(),
              score: r.score,
              grade: resolved.grade,
              points: resolved.points,
              rank: subjectRank,
              totalInSubject: subjectScores.length,
              highestScore: highestScore,
              trend: r.score >= 75 ? 'up' : r.score < gradingConfig.passMinScore ? 'down' : 'stable',
            };
          });
        }
      } else {
        const scores = await this.prisma.termAssessmentScore.findMany({
          where: {
            studentId: { in: studentIdsInClass },
            academicYear,
            term: currentTerm,
          },
        });

        const studentAverages: { id: number; avg: number }[] = [];
        const resultsByStudent = new Map<number, { total: number; max: number; subjects: Record<string, { total: number; max: number }> }>();
        const subjectAverages = new Map<string, { id: number; score: number }[]>();

        scores.forEach((s) => {
          if (!resultsByStudent.has(s.studentId)) {
            resultsByStudent.set(s.studentId, { total: 0, max: 0, subjects: {} });
          }
          const st = resultsByStudent.get(s.studentId)!;
          st.total += s.score;
          st.max += s.maxScore || 100;

          if (!st.subjects[s.subjectKey]) st.subjects[s.subjectKey] = { total: 0, max: 0 };
          st.subjects[s.subjectKey].total += s.score;
          st.subjects[s.subjectKey].max += s.maxScore || 100;
        });

        resultsByStudent.forEach((data, sId) => {
          const avg = data.max > 0 ? (data.total / data.max) * 100 : 0;
          studentAverages.push({ id: sId, avg: Math.round(avg) });

          Object.keys(data.subjects).forEach(key => {
            const sub = data.subjects[key];
            const score = sub.max > 0 ? Math.round((sub.total / sub.max) * 100) : 0;
            if (!subjectAverages.has(key)) subjectAverages.set(key, []);
            subjectAverages.get(key)!.push({ id: sId, score });
          });
        });

        studentAverages.sort((a, b) => b.avg - a.avg);
        const myRank = studentAverages.findIndex((s) => s.id === student.id) + 1;
        const myData = studentAverages.find((s) => s.id === student.id);

        if (myRank > 0 && myData) {
          rank = myRank;
          average = myData.avg;

          const mySubjects = resultsByStudent.get(student.id)?.subjects || {};
          grades = Object.keys(mySubjects).map((key) => {
            const sub = mySubjects[key];
            const score = sub.max > 0 ? Math.round((sub.total / sub.max) * 100) : 0;
            const resolved = AdminService.resolveGrade(score, gradingConfig);
            
            const subjectScores = subjectAverages.get(key) || [];
            subjectScores.sort((a, b) => b.score - a.score);
            const subjectRank = subjectScores.findIndex(s => s.id === student.id) + 1;
            const highestScore = subjectScores.length > 0 ? subjectScores[0].score : 0;

            return {
              subject: key.toUpperCase(),
              score: score,
              grade: resolved.grade,
              points: resolved.points,
              rank: subjectRank,
              totalInSubject: subjectScores.length,
              highestScore: highestScore,
              trend: score >= 75 ? 'up' : score < gradingConfig.passMinScore ? 'down' : 'stable',
            };
          });
        }
      }

      topSubjects = grades
        .filter((g) => g.score >= gradingConfig.passMinScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((g) => g.subject);

      // --- Calculate Top 6 Points ---
      const sortedPts = grades.map((g) => g.points).sort((a, b) => a - b);
      let points = 0;
      if (sortedPts.length > 0) {
        const worstPoint = gradingConfig && gradingConfig.grades && gradingConfig.grades.length > 0
          ? gradingConfig.grades[gradingConfig.grades.length - 1].points
          : 9;
        const paddedPts = [...sortedPts];
        while (paddedPts.length < 6) {
          paddedPts.push(worstPoint);
        }
        points = paddedPts.slice(0, 6).reduce((acc, p) => acc + p, 0);
      }

      return {
        ...student,
        schoolInfo,
        class: {
          name: targetClassName,
        },
        academic: {
          term: currentTerm,
          year: academicYear,
          average,
          points,
          rank,
          totalStudents,
          attendance: 100, // placeholder
          topSubjects,
          grades,
        },
      };
    }

    return {
      ...student,
      schoolInfo,
      class: {
        name: targetClassName,
      },
      academic: {
        term: currentTerm,
        year: academicYear,
        average: 0,
        points: 0,
        rank: 0,
        totalStudents: 0,
        attendance: 100,
        topSubjects: [],
        grades: [],
      },
    };
  }

  async update(studentId: string, data: any) {
    const student = await this.prisma.student.findUnique({
      where: { student_id: studentId },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    return this.prisma.$transaction(async (tx) => {
      let classId = student.classId;
      if (data.className) {
        let classRecord = await tx.class.findFirst({
          where: { name: data.className },
        });

        if (!classRecord) {
          classRecord = await tx.class.create({
            data: {
              class_id: `CLS-${Date.now()}`,
              name: data.className,
            },
          });
        }
        classId = classRecord.id;
      }

      const updatedStudent = await tx.student.update({
        where: { student_id: studentId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          gender: data.gender,
          dob: data.dob,
          enrollmentDate: data.enrollmentDate,
          scholarType: data.scholarType,
          guardianName: data.guardianName,
          guardianRelation: data.guardianRelation,
          guardianPhone: data.guardianPhone,
          guardianEmail: data.guardianEmail,
          guardianAddress: data.guardianAddress,
          classId: classId,
          ...(data.scholarType === 'Day' && { hostelId: null }),
          ...(data.hostelId !== undefined && {
            hostelId: data.hostelId === null ? null : Number(data.hostelId),
          }),
          // Support changing student_id if provided
          ...(data.student_id && { student_id: data.student_id }),
        },
      });

      if (data.email) {
        await tx.user.update({
          where: { id: student.userId },
          data: { email: data.email },
        });
      }

      return updatedStudent;
    });
  }

  async remove(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { student_id: studentId },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    // Deleting the User will cascade delete the Student record
    return this.prisma.user.delete({
      where: { id: student.userId },
    });
  }

  async findByDetails(firstName: string, lastName: string, dob: string) {
    const student = await this.prisma.student.findFirst({
      where: {
        firstName: { equals: firstName },
        lastName: { equals: lastName },
        dob: { equals: dob },
      },
    });

    if (!student) return null;

    return this.findOne(student.student_id);
  }
}
