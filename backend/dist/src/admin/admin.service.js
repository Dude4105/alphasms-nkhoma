"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let AdminService = class AdminService {
    static { AdminService_1 = this; }
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats() {
        const [totalStudents, totalTeachers, totalClasses, pendingEnrollment, recentApplications, recentResetRequests,] = await Promise.all([
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
        const trends = {
            students: '+12 this term',
            teachers: '3 new hires',
            classes: 'Form 1-4',
            enrollment: 'Awaiting review',
            passwordResets: `${recentResetRequests.length} pending`,
        };
        const config = await this.getSettings();
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
        const topPerformers = [];
        for (const cls of classData) {
            let topStudent = null;
            let highestAvg = -1;
            for (const student of cls.students) {
                if (!student.results || student.results.length === 0)
                    continue;
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
        const config = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
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
    async updateSettings(data) {
        const [oldTerm, oldYear] = await Promise.all([
            this.prisma.systemSetting.findUnique({ where: { key: 'currentTerm' } }),
            this.prisma.systemSetting.findUnique({ where: { key: 'academicYear' } }),
        ]);
        for (const [key, value] of Object.entries(data)) {
            await this.prisma.systemSetting.upsert({
                where: { key },
                update: { value },
                create: { key, value },
            });
        }
        const termChanged = data.currentTerm && data.currentTerm !== oldTerm?.value;
        const yearChanged = data.academicYear && data.academicYear !== oldYear?.value;
        if (termChanged || yearChanged) {
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
            console.log(`[AdminService] Term transition detected: Term ${oldTerm?.value || '?'} → ${data.currentTerm || oldTerm?.value}, Year ${oldYear?.value || '?'} → ${data.academicYear || oldYear?.value}. Final Results Mode and Published results auto-disabled.`);
        }
        return {
            message: 'Settings updated successfully',
            termTransition: !!(termChanged || yearChanged),
        };
    }
    async advanceAcademicYear(userId) {
        const FINAL_TERM = 3;
        const MIN_SUBJECTS = 6;
        const yearSetting = await this.prisma.systemSetting.findUnique({
            where: { key: 'academicYear' },
        });
        const fromYear = yearSetting?.value;
        if (!fromYear)
            throw new common_1.ConflictException('No academic year is configured.');
        const toYear = (parseInt(fromYear, 10) + 1).toString();
        const existing = await this.prisma.migrationRun.findUnique({
            where: { fromYear_toYear: { fromYear, toYear } },
        });
        if (existing) {
            throw new common_1.ConflictException(`Academic year transition ${fromYear} -> ${toYear} has already been run.`);
        }
        const termSetting = await this.prisma.systemSetting.findUnique({
            where: { key: 'currentTerm' },
        });
        const currentTerm = termSetting ? parseInt(termSetting.value, 10) : 1;
        if (currentTerm !== FINAL_TERM) {
            throw new common_1.BadRequestException(`The academic year can only be advanced at the end of the final term (Term ${FINAL_TERM}), when final-exam results are complete. Current term: ${currentTerm}.`);
        }
        let passMark = 40;
        const gradingSetting = await this.prisma.systemSetting.findUnique({
            where: { key: 'gradingSystem' },
        });
        if (gradingSetting) {
            try {
                const cfg = JSON.parse(gradingSetting.value);
                if (typeof cfg?.passMinScore === 'number')
                    passMark = cfg.passMinScore;
            }
            catch {
            }
        }
        const classes = await this.prisma.class.findMany({
            include: { students: true },
        });
        const classesById = new Map(classes.map((c) => [c.id, c]));
        const finalTermResults = await this.prisma.result.findMany({
            where: { term: FINAL_TERM, academicYear: fromYear },
        });
        const resultsByStudent = new Map();
        for (const r of finalTermResults) {
            const arr = resultsByStudent.get(r.studentId) ?? [];
            arr.push(r);
            resultsByStudent.set(r.studentId, arr);
        }
        const resolveTarget = (source) => {
            const m = source.name.match(/^(.*?)(\d+)(\D*)$/);
            if (!m)
                return null;
            const [, prefix, num, suffix] = m;
            const targetName = `${prefix}${parseInt(num, 10) + 1}${suffix}`;
            return classes.find((c) => c.name === targetName) ?? null;
        };
        const run = await this.prisma.$transaction(async (tx) => {
            const created = await tx.migrationRun.create({
                data: { fromYear, toYear, startedById: userId },
            });
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
                console.log(`[AdminService] Cleared ${staleResults} stale results, ${staleAssessments} assessment scores and ${staleRanks} ranks stored under the incoming year ${toYear}.`);
            }
            let promoted = 0;
            let pending = 0;
            let completed = 0;
            for (const cls of classes) {
                const target = resolveTarget(cls);
                const subjectCount = Array.isArray(cls.subjects)
                    ? cls.subjects.length
                    : 0;
                const required = Math.max(1, Math.min(MIN_SUBJECTS, subjectCount || MIN_SUBJECTS));
                for (const student of cls.students) {
                    const rows = resultsByStudent.get(student.id) ?? [];
                    const subjects = rows.map((r) => {
                        const as = r.assessmentScores;
                        const hasFinal = as && typeof as === 'object' && 'finalScore' in as;
                        const score = hasFinal ? Number(as.finalScore ?? 0) : null;
                        return {
                            key: r.subjectKey,
                            score,
                            passed: score !== null && score >= passMark,
                        };
                    });
                    const passCount = subjects.filter((s) => s.passed).length;
                    const passed = passCount >= required;
                    let status;
                    if (passed && target) {
                        status = 'promoted';
                    }
                    else if (passed && !target) {
                        status = 'completed';
                    }
                    else {
                        status = 'pending_review';
                    }
                    const historyObj = (() => {
                        if (student.classHistory) {
                            try {
                                return JSON.parse(student.classHistory);
                            }
                            catch {
                                return {};
                            }
                        }
                        return {};
                    })();
                    historyObj[fromYear] = cls.name;
                    const nextYearClass = status === 'promoted' && target ? target.name : cls.name;
                    if (status !== 'completed')
                        historyObj[toYear] = nextYearClass;
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
                    if (status === 'promoted')
                        promoted++;
                    else if (status === 'completed')
                        completed++;
                    else
                        pending++;
                }
            }
            const upsert = (key, value) => tx.systemSetting.upsert({
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
        console.log(`[AdminService] Year advance ${fromYear} -> ${toYear}: ${run.promotedCount} promoted, ${run.pendingCount} pending review, ${run.completedCount} completed.`);
        const archived = (run.archivedGrades?.results ?? 0) +
            (run.archivedGrades?.assessments ?? 0);
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
    async getPromotionRun() {
        const run = await this.prisma.migrationRun.findFirst({
            orderBy: { createdAt: 'desc' },
        });
        if (!run)
            return null;
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
    async setFinalResultsMode(enabled) {
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
    async setExamResultsPublished(enabled) {
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
    static DEFAULT_GRADING_CONFIG = {
        grades: [
            { grade: 'A', label: 'Distinction', minScore: 80, maxScore: 100, points: 1 },
            { grade: 'B', label: 'Credit', minScore: 60, maxScore: 79, points: 3 },
            { grade: 'C', label: 'Pass', minScore: 50, maxScore: 59, points: 5 },
            { grade: 'D', label: 'Satisfactory', minScore: 40, maxScore: 49, points: 7 },
            { grade: 'F', label: 'Fail', minScore: 0, maxScore: 39, points: 9 },
        ],
        passMinScore: 40,
    };
    static resolveGrade(score, config = AdminService_1.DEFAULT_GRADING_CONFIG) {
        const rounded = Math.round(score);
        for (const g of config.grades) {
            if (rounded >= g.minScore && rounded <= g.maxScore) {
                return { grade: g.grade, label: g.label, points: g.points };
            }
        }
        const worst = config.grades[config.grades.length - 1];
        return { grade: worst.grade, label: worst.label, points: worst.points };
    }
    async getGradingSystem() {
        const setting = await this.prisma.systemSetting.findUnique({
            where: { key: 'gradingSystem' },
        });
        if (!setting) {
            return AdminService_1.DEFAULT_GRADING_CONFIG;
        }
        try {
            return JSON.parse(setting.value);
        }
        catch {
            return AdminService_1.DEFAULT_GRADING_CONFIG;
        }
    }
    async updateGradingSystem(data) {
        if (!data.grades || !Array.isArray(data.grades) || data.grades.length === 0) {
            throw new common_1.ConflictException('At least one grade level is required');
        }
        if (typeof data.passMinScore !== 'number' || data.passMinScore < 0 || data.passMinScore > 100) {
            throw new common_1.ConflictException('passMinScore must be a number between 0 and 100');
        }
        const value = JSON.stringify(data);
        await this.prisma.systemSetting.upsert({
            where: { key: 'gradingSystem' },
            update: { value },
            create: { key: 'gradingSystem', value },
        });
        return { message: 'Grading system updated successfully', config: data };
    }
    async addAdmin(data) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('A user with this email already exists');
        }
        const passwordHash = await bcrypt.hash('pass1234', 10);
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
    async changePassword(userId, data) {
        console.log(`[AdminService] Attempting to change password for user ID: ${userId}`);
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            console.log(`[AdminService] User with ID ${userId} not found`);
            throw new common_1.UnauthorizedException('User not found');
        }
        console.log(`[AdminService] User found: ${user.email}. Comparing passwords...`);
        const passwordMatches = await bcrypt.compare(data.currentPass, user.passwordHash);
        if (!passwordMatches) {
            console.log(`[AdminService] Password mismatch for user ${user.email}`);
            throw new common_1.UnauthorizedException('Incorrect current password');
        }
        console.log(`[AdminService] Password matched for user ${user.email}. Updating to new password...`);
        const passwordHash = await bcrypt.hash(data.newPass, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
        console.log(`[AdminService] Password updated successfully for user ${user.email}`);
        return { message: 'Password updated successfully' };
    }
    async getAdminMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { adminProfile: true },
        });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
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
    async resolvePasswordReset(requestId) {
        const request = await this.prisma.passwordResetRequest.findUnique({
            where: { id: requestId },
        });
        if (!request) {
            throw new common_1.UnauthorizedException('Request not found');
        }
        if (request.status === 'RESOLVED') {
            return { message: 'Already resolved' };
        }
        const user = await this.prisma.user.findUnique({
            where: { email: request.email },
        });
        if (!user) {
            await this.prisma.passwordResetRequest.update({
                where: { id: requestId },
                data: { status: 'RESOLVED', resolvedAt: new Date() },
            });
            throw new common_1.UnauthorizedException('User no longer exists');
        }
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
    async updateAdminPermissions(userId, permissions) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { adminProfile: true },
        });
        if (!user || !user.adminProfile) {
            throw new common_1.UnauthorizedException('Admin not found');
        }
        await this.prisma.adminProfile.update({
            where: { id: user.adminProfile.id },
            data: { permissions },
        });
        return { message: 'Permissions updated successfully', permissions };
    }
    async getAdminById(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId, role: 'ADMIN' },
            include: { adminProfile: true },
        });
        if (!user || !user.adminProfile) {
            throw new common_1.UnauthorizedException('Admin not found');
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
    async deleteAdmin(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId, role: 'ADMIN' },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Admin not found');
        }
        await this.prisma.user.delete({
            where: { id: userId },
        });
        return { message: 'Admin deleted successfully' };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map