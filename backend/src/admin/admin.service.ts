import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      pendingEnrollment,
      recentApplications,
      recentResetRequests,
    ] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.teacher.count(),
      this.prisma.class.count(),
      this.prisma.application.count({ where: { status: 'PENDING' } }),
      this.prisma.application.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.passwordResetRequest.findMany({
        take: 5,
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Mock trend info (could be calculated if history exists)
    const trends = {
      students: '+12 this term',
      teachers: '3 new hires',
      classes: 'Form 1-4',
      enrollment: 'Awaiting review',
      passwordResets: `${recentResetRequests.length} pending`,
    };

    const config = await this.getSettings() as any;
    const academicYear = config.academicYear || '2024';
    const term = parseInt(config.currentTerm || '1', 10);

    const classData = await this.prisma.class.findMany({
      include: {
        students: {
          include: {
            results: {
              where: { academicYear, term }
            }
          }
        }
      }
    });

    const topPerformers: any[] = [];

    for (const cls of classData) {
      let topStudent: any = null;
      let highestAvg = -1;

      for (const student of cls.students) {
        if (!student.results || student.results.length === 0) continue;
        
        const totalScore = student.results.reduce((sum, r) => sum + r.score, 0);
        const avg = totalScore / student.results.length;

        if (avg > highestAvg) {
          highestAvg = avg;
          topStudent = student;
        }
      }

      if (topStudent) {
        topPerformers.push({
          name: `${topStudent.firstName} ${topStudent.lastName}`,
          class: cls.name,
          subject: 'Best Overall',
          avg: Math.round(highestAvg * 10) / 10 + '%',
        });
      }
    }

    // Sort by class name
    topPerformers.sort((a, b) => a.class.localeCompare(b.class));

    return {
      stats: [
        {
          title: 'Total Students',
          value: totalStudents.toString(),
          change: trends.students,
          icon: 'Users',
          color: '#3b82f6',
          path: '/admin/students/',
        },
        {
          title: 'Total Teachers',
          value: totalTeachers.toString(),
          change: trends.teachers,
          icon: 'GraduationCap',
          color: '#10b981',
          path: '/admin/teachers',
        },
        {
          title: 'Total Classes',
          value: totalClasses.toString(),
          change: trends.classes,
          icon: 'BookOpen',
          color: '#8b5cf6',
          path: '/admin/classes/',
        },
        {
          title: 'Pending Enrollment',
          value: pendingEnrollment.toString(),
          change: trends.enrollment,
          icon: 'ClipboardList',
          color: '#f59e0b',
          path: '/admin/enrollment/',
        },
        {
          title: 'Pass. Resets',
          value: recentResetRequests.length.toString(),
          change: trends.passwordResets,
          icon: 'Key',
          color: '#ec4899',
          path: '/admin/password-resets/',
        },
      ],
      recentApplications: recentApplications.map((app) => ({
        name: `${app.firstName} ${app.surname}`,
        class: app.targetClass,
        type: app.boardingStatus,
        date: new Date(app.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        status: app.status,
      })),
      recentResetRequests,
      topPerformers,
    };
  }

  async getSettings() {
    const settings = await this.prisma.systemSetting.findMany();
    // Convert to object
    const config = settings.reduce(
      (acc, s) => ({ ...acc, [s.key]: s.value }),
      {},
    );

    // Default values if empty
    if (Object.keys(config).length === 0) {
      const defaults = [
        { key: 'schoolName', value: 'ALPHABET SMIS' },
        { key: 'schoolCampus', value: 'HEROES ACADEMY' },
        { key: 'academicYear', value: '2024' },
        { key: 'currentTerm', value: '1' },
        { key: 'schoolAddress', value: 'Blantyre, Malawi' },
        { key: 'schoolEmail', value: 'admissions@heroesacademy.mw' },
      ];
      await this.prisma.systemSetting.createMany({ data: defaults });
      return defaults.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    }

    return config;
  }

  async updateSettings(data: Record<string, string>) {
    // 1. Fetch current term/year BEFORE updating to detect changes
    const [oldTerm, oldYear] = await Promise.all([
      this.prisma.systemSetting.findUnique({ where: { key: 'currentTerm' } }),
      this.prisma.systemSetting.findUnique({ where: { key: 'academicYear' } }),
    ]);

    // 2. Apply all setting updates
    for (const [key, value] of Object.entries(data)) {
      await this.prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    // 3. Detect if a term transition occurred
    const termChanged = data.currentTerm && data.currentTerm !== oldTerm?.value;
    const yearChanged =
      data.academicYear && data.academicYear !== oldYear?.value;

    if (termChanged || yearChanged) {
      // Auto-disable Final Results Mode & Published Status at the start of a new term
      await this.prisma.systemSetting.upsert({
        where: { key: 'finalResultsMode' },
        update: { value: 'false' },
        create: { key: 'finalResultsMode', value: 'false' },
      });
      await this.prisma.systemSetting.upsert({
        where: { key: 'examResultsPublished' },
        update: { value: 'false' },
        create: { key: 'examResultsPublished', value: 'false' },
      });
      console.log(
        `[AdminService] Term transition detected: Term ${oldTerm?.value || '?'} → ${data.currentTerm || oldTerm?.value}, Year ${oldYear?.value || '?'} → ${data.academicYear || oldYear?.value}. Final Results Mode and Published results auto-disabled.`,
      );
    }

    return {
      message: 'Settings updated successfully',
      termTransition: !!(termChanged || yearChanged),
    };
  }

  /**
   * POST /admin/academic-year/advance
   *
   * One atomic operation that:
   *  1. Evaluates every student against the promotion rule using the closing
   *     year's FINAL TERM final-exam scores (term 3: finalScore >= passMark).
   *     Rule: at least `min(6, subjects in class)` subjects passed.
   *  2. Moves passers to their next class (name rule: "Form 1A" -> "Form 2A"),
   *     top-form passers get status "completed".
   *  3. Leaves non-passers in place with status "pending_review" + reasons,
   *     so their class teacher decides (promote anyway / repeat).
   *  4. Advances academicYear (+1), resets term to 1 and disables exam mode
   *     and published results — all inside ONE transaction, so rosters and the
   *     year setting can never disagree.
   */
  async advanceAcademicYear(userId: number) {
    const FINAL_TERM = 3;
    const MIN_SUBJECTS = 6;

    const yearSetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'academicYear' },
    });
    const fromYear = yearSetting?.value;
    if (!fromYear) throw new ConflictException('No academic year is configured.');
    const toYear = (parseInt(fromYear, 10) + 1).toString();

    // Idempotency guard: this transition can only ever run once.
    const existing = await this.prisma.migrationRun.findUnique({
      where: { fromYear_toYear: { fromYear, toYear } },
    });
    if (existing) {
      throw new ConflictException(
        `Academic year transition ${fromYear} -> ${toYear} has already been run.`,
      );
    }

    // Year-end gate: promotion + advance may only happen at the end of the
    // final term, once final-exam results are in. A run resets the term to 1,
    // so this also blocks accidental double-runs from chaining years
    // (2024 -> 2025 -> 2026 ...).
    const termSetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'currentTerm' },
    });
    const currentTerm = termSetting ? parseInt(termSetting.value, 10) : 1;
    if (currentTerm !== FINAL_TERM) {
      throw new BadRequestException(
        `The academic year can only be advanced at the end of the final term (Term ${FINAL_TERM}), when final-exam results are complete. Current term: ${currentTerm}.`,
      );
    }

    // Pass mark from the grading configuration (passMinScore, default 40).
    let passMark = 40;
    const gradingSetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'gradingSystem' },
    });
    if (gradingSetting) {
      try {
        const cfg = JSON.parse(gradingSetting.value);
        if (typeof cfg?.passMinScore === 'number') passMark = cfg.passMinScore;
      } catch {
        /* keep default */
      }
    }

    // Everything we need to evaluate, fetched before the write transaction.
    const classes = await this.prisma.class.findMany({
      include: { students: true },
    });
    const classesById = new Map(classes.map((c) => [c.id, c]));
    const finalTermResults = await this.prisma.result.findMany({
      where: { term: FINAL_TERM, academicYear: fromYear },
    });
    const resultsByStudent = new Map<number, typeof finalTermResults>();
    for (const r of finalTermResults) {
      const arr = resultsByStudent.get(r.studentId) ?? [];
      arr.push(r);
      resultsByStudent.set(r.studentId, arr);
    }

    // Name rule: "Form 1A" -> "Form 2A" (increment form number, keep stream).
    const resolveTarget = (source: { name: string }) => {
      const m = source.name.match(/^(.*?)(\d+)(\D*)$/);
      if (!m) return null;
      const [, prefix, num, suffix] = m;
      const targetName = `${prefix}${parseInt(num, 10) + 1}${suffix}`;
      return classes.find((c) => c.name === targetName) ?? null;
    };

    const run = await this.prisma.$transaction(async (tx) => {
      const created = await tx.migrationRun.create({
        data: { fromYear, toYear, startedById: userId },
      });

      // Fresh start for the incoming year: grade rows that already exist under
      // the new year are stale leftovers (grade entry saved under the wrong
      // academic year) — they must not leak into the new term's gradebook.
      // Archive their counts on the run for auditability, then remove them.
      const staleResults = await tx.result.count({ where: { academicYear: toYear } });
      const staleAssessments = await tx.termAssessmentScore.count({ where: { academicYear: toYear } });
      const staleRanks = await tx.studentRank.count({ where: { academicYear: toYear } });
      if (staleResults || staleAssessments || staleRanks) {
        await tx.result.deleteMany({ where: { academicYear: toYear } });
        await tx.termAssessmentScore.deleteMany({ where: { academicYear: toYear } });
        await tx.studentRank.deleteMany({ where: { academicYear: toYear } });
        await tx.migrationRun.update({
          where: { id: created.id },
          data: {
            archivedGrades: {
              results: staleResults,
              assessments: staleAssessments,
              ranks: staleRanks,
            },
          },
        });
        console.log(
          `[AdminService] Cleared ${staleResults} stale results, ${staleAssessments} assessment scores and ${staleRanks} ranks stored under the incoming year ${toYear}.`,
        );
      }

      let promoted = 0;
      let pending = 0;
      let completed = 0;

      for (const cls of classes) {
        const target = resolveTarget(cls);
        const subjectCount = Array.isArray(cls.subjects)
          ? (cls.subjects as any[]).length
          : 0;
        // Clamp so classes with fewer than 6 subjects remain promotable.
        const required = Math.max(
          1,
          Math.min(MIN_SUBJECTS, subjectCount || MIN_SUBJECTS),
        );

        for (const student of cls.students) {
          const rows = resultsByStudent.get(student.id) ?? [];
          const subjects = rows.map((r) => {
            const as: any = r.assessmentScores;
            const hasFinal =
              as && typeof as === 'object' && 'finalScore' in as;
            const score = hasFinal ? Number(as.finalScore ?? 0) : null;
            return {
              key: r.subjectKey,
              score,
              passed: score !== null && score >= passMark,
            };
          });
          const passCount = subjects.filter((s) => s.passed).length;
          const passed = passCount >= required;

          // Status + class move
          let status: string;
          if (passed && target) {
            status = 'promoted';
          } else if (passed && !target) {
            status = 'completed'; // top form: nothing to promote into
          } else {
            status = 'pending_review';
          }

          const historyObj: Record<string, string> = (() => {
            if (student.classHistory) {
              try {
                return JSON.parse(student.classHistory);
              } catch {
                return {};
              }
            }
            return {};
          })();
          historyObj[fromYear] = cls.name;

          // Where they belong next year
          const nextYearClass =
            status === 'promoted' && target ? target.name : cls.name;
          // Completed students leave the system's flow: no next-year claim.
          if (status !== 'completed') historyObj[toYear] = nextYearClass;

          await tx.student.update({
            where: { id: student.id },
            data: {
              ...(status === 'promoted' && target ? { classId: target.id } : {}),
              classHistory: JSON.stringify(historyObj),
            },
          });

          await tx.classHistory.upsert({
            where: {
              studentId_academicYear: {
                studentId: student.id,
                academicYear: fromYear,
              },
            },
            update: { className: cls.name },
            create: {
              studentId: student.id,
              academicYear: fromYear,
              className: cls.name,
            },
          });
          if (status !== 'completed') {
            await tx.classHistory.upsert({
              where: {
                studentId_academicYear: {
                  studentId: student.id,
                  academicYear: toYear,
                },
              },
              update: { className: nextYearClass },
              create: {
                studentId: student.id,
                academicYear: toYear,
                className: nextYearClass,
              },
            });
          }

          await tx.studentPromotion.create({
            data: {
              runId: created.id,
              studentId: student.id,
              sourceClassId: cls.id,
              sourceClassName: cls.name,
              targetClassId: target ? target.id : null,
              targetClassName: target ? target.name : null,
              status,
              reasons: { passCount, required, passMark, subjects },
            },
          });

          if (status === 'promoted') promoted++;
          else if (status === 'completed') completed++;
          else pending++;
        }
      }

      // Settings flip, same transaction: year, term, exam/published flags.
      const upsert = (key: string, value: string) =>
        tx.systemSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      await upsert('academicYear', toYear);
      await upsert('currentTerm', '1');
      await upsert('finalResultsMode', 'false');
      await upsert('examResultsPublished', 'false');

      return tx.migrationRun.update({
        where: { id: created.id },
        data: { promotedCount: promoted, pendingCount: pending, completedCount: completed },
      });
    });

    console.log(
      `[AdminService] Year advance ${fromYear} -> ${toYear}: ${run.promotedCount} promoted, ${run.pendingCount} pending review, ${run.completedCount} completed.`,
    );

    const archived =
      ((run.archivedGrades as any)?.results ?? 0) +
      ((run.archivedGrades as any)?.assessments ?? 0);

    return {
      message: `Academic year advanced to ${toYear} — students promoted automatically, others await teacher review.`,
      fromYear,
      toYear,
      promoted: run.promotedCount,
      pending: run.pendingCount,
      completed: run.completedCount,
      passMark,
      archived,
    };
  }

  /** Latest promotion run, for the admin Settings page display. */
  async getPromotionRun() {
    const run = await this.prisma.migrationRun.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    if (!run) return null;
    return {
      fromYear: run.fromYear,
      toYear: run.toYear,
      promoted: run.promotedCount,
      pending: run.pendingCount,
      completed: run.completedCount,
      createdAt: run.createdAt,
    };
  }

  async getFinalResultsMode() {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'finalResultsMode' },
    });
    return { enabled: setting?.value === 'true' };
  }

  async setFinalResultsMode(enabled: boolean) {
    await this.prisma.systemSetting.upsert({
      where: { key: 'finalResultsMode' },
      update: { value: String(enabled) },
      create: { key: 'finalResultsMode', value: String(enabled) },
    });
    return {
      enabled,
      message: `Final Results Mode ${enabled ? 'activated' : 'deactivated'}`,
    };
  }

  async getExamResultsPublished() {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'examResultsPublished' },
    });
    return { enabled: setting?.value === 'true' };
  }

  async setExamResultsPublished(enabled: boolean) {
    await this.prisma.systemSetting.upsert({
      where: { key: 'examResultsPublished' },
      update: { value: String(enabled) },
      create: { key: 'examResultsPublished', value: String(enabled) },
    });
    return {
      enabled,
      message: `Examination results ${enabled ? 'published' : 'unpublished'} successfully`,
    };
  }

  // ── Grading System Configuration ──────────────────────────────────

  static readonly DEFAULT_GRADING_CONFIG = {
    grades: [
      { grade: 'A', label: 'Distinction', minScore: 80, maxScore: 100, points: 1 },
      { grade: 'B', label: 'Credit',      minScore: 60, maxScore: 79,  points: 3 },
      { grade: 'C', label: 'Pass',        minScore: 50, maxScore: 59,  points: 5 },
      { grade: 'D', label: 'Satisfactory',minScore: 40, maxScore: 49,  points: 7 },
      { grade: 'F', label: 'Fail',        minScore: 0,  maxScore: 39,  points: 9 },
    ],
    passMinScore: 40,
  };

  /**
   * Resolve the grade letter and points for a given numeric score.
   * Uses the provided grading config (array of grade boundary objects).
   */
  static resolveGrade(
    score: number,
    config: typeof AdminService.DEFAULT_GRADING_CONFIG = AdminService.DEFAULT_GRADING_CONFIG,
  ) {
    const rounded = Math.round(score);
    for (const g of config.grades) {
      if (rounded >= g.minScore && rounded <= g.maxScore) {
        return { grade: g.grade, label: g.label, points: g.points };
      }
    }
    // Fallback to worst grade
    const worst = config.grades[config.grades.length - 1];
    return { grade: worst.grade, label: worst.label, points: worst.points };
  }

  async getGradingSystem() {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'gradingSystem' },
    });
    if (!setting) {
      return AdminService.DEFAULT_GRADING_CONFIG;
    }
    try {
      return JSON.parse(setting.value);
    } catch {
      return AdminService.DEFAULT_GRADING_CONFIG;
    }
  }

  async updateGradingSystem(data: any) {
    // Basic validation
    if (!data.grades || !Array.isArray(data.grades) || data.grades.length === 0) {
      throw new ConflictException('At least one grade level is required');
    }
    if (typeof data.passMinScore !== 'number' || data.passMinScore < 0 || data.passMinScore > 100) {
      throw new ConflictException('passMinScore must be a number between 0 and 100');
    }

    const value = JSON.stringify(data);
    await this.prisma.systemSetting.upsert({
      where: { key: 'gradingSystem' },
      update: { value },
      create: { key: 'gradingSystem', value },
    });

    return { message: 'Grading system updated successfully', config: data };
  }

  async addAdmin(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    permissions?: string[];
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash('pass1234', 10);

    // Create User and AdminProfile in a transaction
    return await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          role: 'ADMIN',
          adminProfile: {
            create: {
              firstName: data.firstName,
              lastName: data.lastName,
              phone: data.phone,
              permissions: data.permissions || [],
            },
          },
        },
        include: { adminProfile: true },
      });

      return {
        message: 'Administrator added successfully',
        admin: {
          email: user.email,
          name: `${user.adminProfile?.firstName} ${user.adminProfile?.lastName}`,
          id: user.id,
        },
      };
    });
  }

  async getAllAdmins() {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      include: { adminProfile: true },
      orderBy: { createdAt: 'desc' },
    });

    return admins.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.adminProfile?.firstName || 'N/A',
      lastName: u.adminProfile?.lastName || '',
      phone: u.adminProfile?.phone || 'N/A',
      joinedDate: u.createdAt.toLocaleDateString(),
      permissions: u.adminProfile?.permissions || [],
    }));
  }

  async changePassword(
    userId: number,
    data: { currentPass: string; newPass: string },
  ) {
    console.log(
      `[AdminService] Attempting to change password for user ID: ${userId}`,
    );
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.log(`[AdminService] User with ID ${userId} not found`);
      throw new UnauthorizedException('User not found');
    }

    console.log(
      `[AdminService] User found: ${user.email}. Comparing passwords...`,
    );
    const passwordMatches = await bcrypt.compare(
      data.currentPass,
      user.passwordHash,
    );

    if (!passwordMatches) {
      console.log(`[AdminService] Password mismatch for user ${user.email}`);
      throw new UnauthorizedException('Incorrect current password');
    }

    console.log(
      `[AdminService] Password matched for user ${user.email}. Updating to new password...`,
    );
    const passwordHash = await bcrypt.hash(data.newPass, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    console.log(
      `[AdminService] Password updated successfully for user ${user.email}`,
    );
    return { message: 'Password updated successfully' };
  }

  async getAdminMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { adminProfile: true },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return {
      email: user.email,
      firstName: user.adminProfile?.firstName || 'Admin',
      lastName: user.adminProfile?.lastName || 'User',
      permissions: user.adminProfile?.permissions || [],
    };
  }

  async getPasswordResets() {
    return this.prisma.passwordResetRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolvePasswordReset(requestId: number) {
    const request = await this.prisma.passwordResetRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new UnauthorizedException('Request not found');
    }

    if (request.status === 'RESOLVED') {
      return { message: 'Already resolved' };
    }

    const user = await this.prisma.user.findUnique({
      where: { email: request.email },
    });

    if (!user) {
      // Mark as resolved even if user not found to clear queue
      await this.prisma.passwordResetRequest.update({
        where: { id: requestId },
        data: { status: 'RESOLVED', resolvedAt: new Date() },
      });
      throw new UnauthorizedException('User no longer exists');
    }

    // Reset password to default 'pass1234'
    const newPasswordHash = await bcrypt.hash('pass1234', 10);
    await this.prisma.user.update({
      where: { email: request.email },
      data: { passwordHash: newPasswordHash },
    });

    await this.prisma.passwordResetRequest.update({
      where: { id: requestId },
      data: { status: 'RESOLVED', resolvedAt: new Date() },
    });

    return { message: 'Password reset successfully to pass1234' };
  }

  async updateAdminPermissions(userId: number, permissions: string[]) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { adminProfile: true },
    });
    if (!user || !user.adminProfile) {
      throw new UnauthorizedException('Admin not found');
    }

    await this.prisma.adminProfile.update({
      where: { id: user.adminProfile.id },
      data: { permissions },
    });

    return { message: 'Permissions updated successfully', permissions };
  }

  async getAdminById(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, role: 'ADMIN' },
      include: { adminProfile: true },
    });

    if (!user || !user.adminProfile) {
      throw new UnauthorizedException('Admin not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.adminProfile.firstName,
      lastName: user.adminProfile.lastName,
      phone: user.adminProfile.phone,
      joinedDate: user.createdAt.toISOString().split('T')[0],
      permissions: user.adminProfile.permissions,
    };
  }

  async deleteAdmin(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, role: 'ADMIN' },
    });
    
    if (!user) {
      throw new UnauthorizedException('Admin not found');
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Admin deleted successfully' };
  }
}
