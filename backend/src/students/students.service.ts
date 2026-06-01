import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
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
    
    // Normalized ClassHistory search (extremely fast, indexed lookup)
    const historicalClass = await this.prisma.classHistory.findUnique({
      where: {
        studentId_academicYear: {
          studentId: student.id,
          academicYear,
        },
      },
    });
    if (historicalClass) {
      targetClassName = historicalClass.className;
    }

    // Find all students who were in this class during that year using relation index
    const studentsInClass = await this.prisma.student.findMany({
      where: {
        OR: [
          { class: { name: targetClassName } },
          { classHistoryRelations: { some: { className: targetClassName, academicYear } } }
        ]
      },
      select: { id: true, student_id: true }
    });
    const studentIdsInClass = studentsInClass.map(s => s.id);
    const totalStudents = studentIdsInClass.length;

    let average = 0;
    let rank = 0;
    let points = 0;
    let grades: any[] = [];
    let topSubjects: string[] = [];

    // Load pre-calculated rank and stats (extremely fast O(1) database query)
    const rankRecord = await this.prisma.studentRank.findUnique({
      where: {
        studentId_term_academicYear: {
          studentId: student.id,
          term: currentTerm,
          academicYear,
        },
      },
    });
    if (rankRecord) {
      average = rankRecord.average;
      points = rankRecord.points;
      rank = rankRecord.rank;
    }

    // Find the class entity for subjects list
    const classEntity = await this.prisma.class.findFirst({
      where: { name: targetClassName }
    });

    if (classEntity && totalStudents > 0) {
      if (isFinalMode) {
        const results = await this.prisma.result.findMany({
          where: {
            studentId: student.id,
            academicYear,
            term: currentTerm,
          },
        });
        
        const classResults = await this.prisma.result.findMany({
          where: {
            studentId: { in: studentIdsInClass },
            academicYear,
            term: currentTerm,
          },
        });
        
        const highestBySubject = new Map<string, number>();
        const countBySubject = new Map<string, number>();
        const studentScoresBySubject = new Map<string, { id: number; score: number }[]>();
        
        classResults.forEach(r => {
          if (!highestBySubject.has(r.subjectKey) || r.score > highestBySubject.get(r.subjectKey)!) {
            highestBySubject.set(r.subjectKey, r.score);
          }
          if (!countBySubject.has(r.subjectKey)) {
            countBySubject.set(r.subjectKey, 0);
          }
          countBySubject.set(r.subjectKey, countBySubject.get(r.subjectKey)! + 1);

          if (!studentScoresBySubject.has(r.subjectKey)) {
            studentScoresBySubject.set(r.subjectKey, []);
          }
          studentScoresBySubject.get(r.subjectKey)!.push({ id: r.studentId, score: r.score });
        });

        grades = results.map((r) => {
          const resolved = AdminService.resolveGrade(r.score, gradingConfig);
          const subjectScores = studentScoresBySubject.get(r.subjectKey) || [];
          subjectScores.sort((a, b) => b.score - a.score);
          const subjectRank = subjectScores.findIndex(s => s.id === student.id) + 1;

          return {
            subject: r.subjectKey.toUpperCase(),
            score: r.score,
            grade: resolved.grade,
            points: resolved.points,
            rank: subjectRank,
            totalInSubject: countBySubject.get(r.subjectKey) || 1,
            highestScore: highestBySubject.get(r.subjectKey) || 0,
            trend: r.score >= 75 ? 'up' : r.score < gradingConfig.passMinScore ? 'down' : 'stable',
          };
        });
      } else {
        const scores = await this.prisma.termAssessmentScore.findMany({
          where: {
            studentId: student.id,
            academicYear,
            term: currentTerm,
          },
        });

        const studentSubjects: Record<string, { total: number; max: number }> = {};
        scores.forEach(s => {
          if (!studentSubjects[s.subjectKey]) {
            studentSubjects[s.subjectKey] = { total: 0, max: 0 };
          }
          studentSubjects[s.subjectKey].total += s.score;
          studentSubjects[s.subjectKey].max += s.maxScore || 100;
        });

        const classScores = await this.prisma.termAssessmentScore.findMany({
          where: {
            studentId: { in: studentIdsInClass },
            academicYear,
            term: currentTerm,
          },
        });
        
        const classSubjectsGrouped: Record<string, Record<number, { total: number; max: number }>> = {};
        classScores.forEach(s => {
          if (!classSubjectsGrouped[s.subjectKey]) {
            classSubjectsGrouped[s.subjectKey] = {};
          }
          if (!classSubjectsGrouped[s.subjectKey][s.studentId]) {
            classSubjectsGrouped[s.subjectKey][s.studentId] = { total: 0, max: 0 };
          }
          classSubjectsGrouped[s.subjectKey][s.studentId].total += s.score;
          classSubjectsGrouped[s.subjectKey][s.studentId].max += s.maxScore || 100;
        });

        grades = Object.keys(studentSubjects).map((key) => {
          const sub = studentSubjects[key];
          const score = sub.max > 0 ? Math.round((sub.total / sub.max) * 100) : 0;
          const resolved = AdminService.resolveGrade(score, gradingConfig);

          const classScoresForSubject: { id: number; score: number }[] = [];
          let highestScore = 0;
          Object.entries(classSubjectsGrouped[key] || {}).forEach(([sIdStr, data]) => {
            const sId = Number(sIdStr);
            const subjScore = data.max > 0 ? Math.round((data.total / data.max) * 100) : 0;
            classScoresForSubject.push({ id: sId, score: subjScore });
            if (subjScore > highestScore) highestScore = subjScore;
          });
          
          classScoresForSubject.sort((a, b) => b.score - a.score);
          const subjectRank = classScoresForSubject.findIndex(s => s.id === student.id) + 1;

          return {
            subject: key.toUpperCase(),
            score: score,
            grade: resolved.grade,
            points: resolved.points,
            rank: subjectRank,
            totalInSubject: classScoresForSubject.length,
            highestScore: highestScore,
            trend: score >= 75 ? 'up' : score < gradingConfig.passMinScore ? 'down' : 'stable',
          };
        });
      }

      topSubjects = grades
        .filter((g) => g.score >= gradingConfig.passMinScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((g) => g.subject);

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

  async findByUserId(userId: number) {
    return this.prisma.student.findUnique({
      where: { userId },
      include: {
        class: true,
        hostel: true,
      },
    });
  }

  async authorizeStudentAccess(requester: any, requestedStudentId: string) {
    if (requester.role === 'ADMIN') return true;

    if (requester.role === 'STUDENT') {
      const student = await this.prisma.student.findUnique({
        where: { userId: requester.userId },
      });
      if (!student || student.student_id !== requestedStudentId) {
        throw new ForbiddenException('Access denied');
      }
      return true;
    }

    if (requester.role === 'TEACHER') {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId: requester.userId },
      });
      if (!teacher) throw new ForbiddenException('Access denied');

      const student = await this.prisma.student.findUnique({
        where: { student_id: requestedStudentId },
        include: { class: true },
      });
      if (!student) throw new BadRequestException('Student not found');
      if (!student.class) {
        // Unassigned students can be viewed by all teachers
        return true;
      }

      const fullName = `${teacher.firstName} ${teacher.lastName}`;
      const isClassTeacher = student.class.classTeacher === fullName;

      const teacherClasses = Array.isArray(teacher.classes)
        ? (teacher.classes as string[])
        : [];
      const teachesClass = teacherClasses.includes(student.class.name);

      if (!isClassTeacher && !teachesClass) {
        throw new ForbiddenException('Access denied');
      }
      return true;
    }

    throw new ForbiddenException('Access denied');
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
