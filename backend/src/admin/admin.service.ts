import {
  Injectable,
  ConflictException,
  UnauthorizedException,
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
