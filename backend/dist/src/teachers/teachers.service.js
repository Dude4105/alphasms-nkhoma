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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeachersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const utils_1 = require("../common/utils");
const admin_service_1 = require("../admin/admin.service");
const bcrypt = __importStar(require("bcrypt"));
let TeachersService = class TeachersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    normalizeSubjectKey(name) {
        return (0, utils_1.normalizeSubjectKey)(name);
    }
    async create(data) {
        const defaultPassword = 'pass1234';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        const teacherId = data.employeeId || `TCH-${Math.floor(100 + Math.random() * 900)}`;
        return this.prisma.$transaction(async (prisma) => {
            const user = await prisma.user.create({
                data: {
                    email: data.email,
                    passwordHash: hashedPassword,
                    role: 'TEACHER',
                },
            });
            const teacher = await prisma.teacher.create({
                data: {
                    teacher_id: teacherId,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phone: data.phone,
                    qualification: data.qualification,
                    subjects: data.subjects || [],
                    classes: data.classes || [],
                    userId: user.id,
                },
            });
            return teacher;
        });
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = query.search
            ? {
                OR: [
                    { firstName: { contains: query.search } },
                    { lastName: { contains: query.search } },
                    { email: { contains: query.search } },
                    { teacher_id: { contains: query.search } },
                ],
            }
            : {};
        const [data, total] = await Promise.all([
            this.prisma.teacher.findMany({
                where,
                skip,
                take: limit,
            }),
            this.prisma.teacher.count({ where }),
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
    async findOne(teacherId) {
        return this.prisma.teacher.findUnique({
            where: { teacher_id: teacherId },
        });
    }
    async findByUserId(userId) {
        return this.prisma.teacher.findUnique({
            where: { userId },
        });
    }
    async getMainClass(userId) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { userId },
        });
        if (!teacher) {
            return { teacher: null, class: null, students: [] };
        }
        const teacherClasses = Array.isArray(teacher.classes)
            ? teacher.classes
            : [];
        if (teacherClasses.length === 0) {
            return { teacher, class: null, students: [] };
        }
        const fullName = `${teacher.firstName} ${teacher.lastName}`;
        const mainClass = await this.prisma.class.findFirst({
            where: { classTeacher: fullName },
            include: {
                students: {
                    include: {
                        hostel: { select: { name: true } },
                    },
                },
            },
        });
        if (!mainClass) {
            return { teacher, class: null, students: [] };
        }
        return {
            teacher: {
                id: teacher.teacher_id,
                name: `${teacher.firstName} ${teacher.lastName}`,
                email: teacher.email,
                phone: teacher.phone,
                subjects: teacher.subjects,
                classes: teacher.classes,
            },
            class: {
                id: mainClass.class_id,
                name: mainClass.name,
                level: mainClass.level,
                track: mainClass.track,
                room: mainClass.room,
                schedule: mainClass.schedule,
                capacity: mainClass.capacity,
                subjects: mainClass.subjects,
                classTeacher: mainClass.classTeacher,
            },
            students: mainClass.students.map((s) => ({
                id: s.student_id,
                name: `${s.firstName} ${s.lastName}`,
                gender: s.gender,
                type: s.scholarType || 'Day',
                status: 'Active',
            })),
            stats: {
                total: mainClass.students.length,
                boys: mainClass.students.filter((s) => s.gender === 'Male').length,
                girls: mainClass.students.filter((s) => s.gender === 'Female').length,
                boarding: mainClass.students.filter((s) => s.scholarType === 'Boarding')
                    .length,
                day: mainClass.students.filter((s) => s.scholarType !== 'Boarding')
                    .length,
            },
        };
    }
    async getDashboardData(userId) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { userId },
        });
        if (!teacher) {
            return { stats: [], schedule: [], notices: [] };
        }
        const teacherClasses = Array.isArray(teacher.classes)
            ? teacher.classes
            : [];
        const classes = await this.prisma.class.findMany({
            where: { name: { in: teacherClasses } },
            include: {
                _count: { select: { students: true } },
            },
        });
        const totalStudents = classes.reduce((acc, cls) => acc + cls._count.students, 0);
        const days = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
        ];
        const todayIndex = new Date().getDay();
        const todayName = days[todayIndex];
        const todaySchedule = classes
            .filter((cls) => {
            if (!cls.schedule)
                return false;
            const cleanStr = cls.schedule.toLowerCase();
            const isWeekday = todayIndex >= 1 && todayIndex <= 5;
            if ((cleanStr.includes('mon-fri') || cleanStr.includes('mon–fri') || cleanStr.includes('mon to fri') || cleanStr.includes('weekday')) && isWeekday) {
                return true;
            }
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const shortDayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
            const todayLower = todayName.toLowerCase();
            const shortLower = shortDayNames[todayIndex];
            if (cleanStr.includes(todayLower) || cleanStr.includes(shortLower)) {
                return true;
            }
            const hasAnyDay = dayNames.some(d => cleanStr.includes(d)) || shortDayNames.some(d => cleanStr.includes(d)) || cleanStr.includes('mon-fri') || cleanStr.includes('mon–fri');
            if (!hasAnyDay && isWeekday) {
                return true;
            }
            return false;
        })
            .map((cls) => {
            const parts = cls.schedule?.split(',');
            const timePart = parts && parts.length > 1 ? parts[1].trim() : (cls.schedule || '08:00 AM - 09:30 AM');
            let isActive = false;
            try {
                const cleanTime = timePart.replace(/–/g, '-').replace(/\s+/g, ' ').trim();
                const timeRanges = cleanTime.split('-');
                if (timeRanges.length >= 2) {
                    const startStr = timeRanges[0].trim();
                    const endStr = timeRanges[1].trim();
                    const parseToMinutes = (str) => {
                        const match = str.match(/(\d+):(\d+)\s*(AM|PM)?/i);
                        if (!match)
                            return null;
                        let hours = parseInt(match[1]);
                        const minutes = parseInt(match[2]);
                        const ampm = match[3] ? match[3].toUpperCase() : null;
                        if (ampm === 'PM' && hours < 12)
                            hours += 12;
                        if (ampm === 'AM' && hours === 12)
                            hours = 0;
                        return hours * 60 + minutes;
                    };
                    const startMin = parseToMinutes(startStr);
                    const endMin = parseToMinutes(endStr);
                    if (startMin !== null && endMin !== null) {
                        const now = new Date();
                        const currentMin = now.getHours() * 60 + now.getMinutes();
                        isActive = currentMin >= startMin && currentMin <= endMin;
                    }
                }
            }
            catch (e) {
                console.error('Error parsing class time:', e);
            }
            return {
                time: timePart,
                subject: `${teacher.subjects?.[0] || 'Subject'} (${cls.name})`,
                room: cls.room || 'TBD',
                active: isActive,
            };
        });
        return {
            teacherName: `${teacher.firstName} ${teacher.lastName}`,
            stats: [
                {
                    title: 'Total Students',
                    value: totalStudents.toString(),
                    icon: 'Users',
                    bg: 'var(--primary-gold-dim)',
                },
                {
                    title: 'Classes Today',
                    value: todaySchedule.length.toString(),
                    icon: 'Clock',
                    bg: 'rgba(255, 255, 255, 0.05)',
                },
                {
                    title: 'Pending Grades',
                    value: '0',
                    icon: 'GraduationCap',
                    bg: 'rgba(255, 255, 255, 0.05)',
                },
                {
                    title: 'Next Term',
                    value: 'Sept 12',
                    icon: 'CalendarDays',
                    bg: 'rgba(255, 255, 255, 0.05)',
                },
            ],
            schedule: todaySchedule,
            notices: [
                {
                    title: 'Welcome to the Live Dashboard',
                    content: 'Your portal is now connected to the live database.',
                },
                {
                    title: 'End of Term',
                    content: 'Please ensure all reports are finalized by the end of the week.',
                },
            ],
        };
    }
    async getMyClasses(userId) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { userId },
        });
        if (!teacher) {
            return { teacher: null, classes: [] };
        }
        const teacherClasses = Array.isArray(teacher.classes)
            ? teacher.classes
            : [];
        const teacherSubjects = Array.isArray(teacher.subjects)
            ? teacher.subjects
            : [];
        if (teacherClasses.length === 0) {
            return {
                teacher: {
                    id: teacher.teacher_id,
                    name: `${teacher.firstName} ${teacher.lastName}`,
                    subjects: teacherSubjects,
                },
                classes: [],
            };
        }
        const classes = await this.prisma.class.findMany({
            where: { name: { in: teacherClasses } },
            include: {
                _count: { select: { students: true } },
            },
        });
        const themeColors = [
            'var(--primary-gold)',
            '#3b82f6',
            '#10b981',
            '#8b5cf6',
            '#ef4444',
            '#06b6d4',
            '#ec4899',
        ];
        return {
            teacher: {
                id: teacher.teacher_id,
                name: `${teacher.firstName} ${teacher.lastName}`,
                subjects: teacherSubjects,
            },
            classes: classes.map((cls, i) => ({
                id: cls.class_id,
                name: cls.name,
                level: cls.level,
                room: cls.room || 'Not Assigned',
                students: cls._count.students,
                schedule: cls.schedule,
                subjects: cls.subjects,
                theme: themeColors[i % themeColors.length],
            })),
        };
    }
    async update(teacherId, data) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { teacher_id: teacherId },
        });
        if (!teacher) {
            throw new Error('Teacher not found');
        }
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.teacher.update({
                where: { teacher_id: teacherId },
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phone: data.phone,
                    qualification: data.qualification,
                    subjects: data.subjects,
                    classes: data.classes,
                    ...(data.teacher_id && { teacher_id: data.teacher_id }),
                },
            });
            if (data.email) {
                await tx.user.update({
                    where: { id: teacher.userId },
                    data: { email: data.email },
                });
            }
            return updated;
        });
    }
    async remove(teacherId) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { teacher_id: teacherId },
        });
        if (!teacher) {
            throw new Error('Teacher not found');
        }
        return this.prisma.user.delete({
            where: { id: teacher.userId },
        });
    }
    async getMainClassResults(userId, term, year) {
        const teacher = await this.prisma.teacher.findUnique({ where: { userId } });
        if (!teacher)
            throw new common_1.UnauthorizedException('Teacher not found');
        const teacherClasses = teacher.classes || [];
        if (teacherClasses.length === 0)
            return { class: null, results: [] };
        const termSetting = await this.prisma.systemSetting.findUnique({
            where: { key: 'currentTerm' },
        });
        const yearSetting = await this.prisma.systemSetting.findUnique({
            where: { key: 'academicYear' },
        });
        const gradingSetting = await this.prisma.systemSetting.findUnique({
            where: { key: 'gradingSystem' },
        });
        const currentTerm = term !== undefined ? term : (termSetting ? parseInt(termSetting.value) : 1);
        const currentYear = year !== undefined ? year : (yearSetting ? yearSetting.value : '2025');
        let gradingConfig = null;
        if (gradingSetting) {
            try {
                gradingConfig = JSON.parse(gradingSetting.value);
            }
            catch { }
        }
        const fullName = `${teacher.firstName} ${teacher.lastName}`;
        const mainClass = await this.prisma.class.findFirst({
            where: { classTeacher: fullName },
            include: {
                students: {
                    include: {
                        results: {
                            where: { term: currentTerm, academicYear: currentYear },
                        },
                    },
                },
            },
        });
        if (!mainClass)
            return { class: null, results: [] };
        const classSubjects = Array.isArray(mainClass.subjects)
            ? mainClass.subjects
            : [];
        const subjectsWithKeys = classSubjects.map((s, i) => {
            const colors = [
                '#10b981',
                '#3b82f6',
                '#8b5cf6',
                '#f59e0b',
                '#ef4444',
                '#06b6d4',
                '#84cc16',
                '#ec4899',
            ];
            const subjName = typeof s === 'string' ? s : s.name || 'Unknown';
            return {
                id: typeof s === 'object' && s.id ? s.id : `subj-${i}`,
                name: subjName,
                key: this.normalizeSubjectKey(subjName),
                color: colors[i % colors.length],
            };
        });
        const formattedResults = mainClass.students
            .map((student) => {
            const studentData = {
                id: student.student_id,
                name: `${student.firstName} ${student.lastName}`,
            };
            subjectsWithKeys.forEach((s) => {
                studentData[s.key] = 0;
            });
            let total = 0;
            student.results.forEach((res) => {
                if (studentData.hasOwnProperty(res.subjectKey)) {
                    studentData[res.subjectKey] = res.score;
                    total += res.score;
                }
            });
            studentData.total = total;
            studentData.avg =
                subjectsWithKeys.length > 0 ? total / subjectsWithKeys.length : 0;
            const subjectPoints = [];
            student.results.forEach((res) => {
                if (subjectsWithKeys.some((s) => s.key === res.subjectKey)) {
                    let pts = 9;
                    if (gradingConfig && gradingConfig.grades) {
                        const rounded = Math.round(res.score);
                        for (const g of gradingConfig.grades) {
                            if (rounded >= g.minScore && rounded <= g.maxScore) {
                                pts = g.points;
                                break;
                            }
                        }
                    }
                    subjectPoints.push(pts);
                }
            });
            const worstPoint = gradingConfig && gradingConfig.grades && gradingConfig.grades.length > 0
                ? gradingConfig.grades[gradingConfig.grades.length - 1].points
                : 9;
            const sortedPoints = [...subjectPoints].sort((a, b) => a - b);
            let top6Points = 0;
            if (sortedPoints.length > 0) {
                const paddedPoints = [...sortedPoints];
                while (paddedPoints.length < 6) {
                    paddedPoints.push(worstPoint);
                }
                top6Points = paddedPoints.slice(0, 6).reduce((acc, p) => acc + p, 0);
            }
            studentData.points = top6Points;
            return studentData;
        })
            .filter((s) => s.total > 0 || mainClass.students.length < 50)
            .sort((a, b) => {
            if (a.points === 0 && b.points === 0)
                return b.avg - a.avg;
            if (a.points === 0)
                return 1;
            if (b.points === 0)
                return -1;
            if (a.points !== b.points)
                return a.points - b.points;
            return b.avg - a.avg;
        });
        return {
            class: {
                id: mainClass.class_id,
                name: mainClass.name,
                level: mainClass.level,
                term: currentTerm,
                year: currentYear,
                subjects: subjectsWithKeys,
            },
            gradingConfig,
            results: formattedResults,
        };
    }
    async getProfile(userId) {
        console.log(`[TeachersService] Fetching profile for userId: ${userId}`);
        const teacher = await this.prisma.teacher.findUnique({
            where: { userId },
        });
        if (!teacher) {
            console.log(`[TeachersService] Profile NOT FOUND for userId: ${userId}`);
            throw new common_1.UnauthorizedException('Teacher profile not found');
        }
        console.log(`[TeachersService] Profile found: ${teacher.firstName} ${teacher.lastName}`);
        return {
            name: `${teacher.firstName} ${teacher.lastName}`,
            email: teacher.email,
            lastName: teacher.lastName,
            subjects: teacher.subjects,
            classes: teacher.classes,
        };
    }
    async getGradeConfig(classId, subjectKey, term, academicYear) {
        const classEntity = await this.prisma.class.findUnique({
            where: { class_id: classId },
        });
        if (!classEntity)
            throw new common_1.UnauthorizedException('Class not found');
        return this.prisma.gradeConfig.findUnique({
            where: {
                classId_subjectKey_term_academicYear: {
                    classId: classEntity.id,
                    subjectKey,
                    term,
                    academicYear,
                },
            },
        });
    }
    async saveGradeConfig(userId, data) {
        console.log(`[TeachersService] saveGradeConfig payload:`, JSON.stringify(data, null, 2));
        try {
            const classEntity = await this.prisma.class.findUnique({
                where: { class_id: data.classId },
            });
            if (!classEntity) {
                console.error(`[TeachersService] Class not found for ID: ${data.classId}`);
                throw new common_1.UnauthorizedException('Class not found');
            }
            const res = await this.prisma.gradeConfig.upsert({
                where: {
                    classId_subjectKey_term_academicYear: {
                        classId: classEntity.id,
                        subjectKey: data.subjectKey,
                        term: parseInt(data.term),
                        academicYear: data.academicYear.toString(),
                    },
                },
                update: { config: data.config },
                create: {
                    classId: classEntity.id,
                    subjectKey: data.subjectKey,
                    term: parseInt(data.term),
                    academicYear: data.academicYear.toString(),
                    config: data.config,
                },
            });
            console.log(`[TeachersService] saveGradeConfig success:`, res.id);
            return res;
        }
        catch (err) {
            console.error(`[TeachersService] saveGradeConfig ERROR:`, err);
            throw err;
        }
    }
    async getInTermResults(userId, classId, term = 1, academicYear = '2025') {
        const classEntity = await this.prisma.class.findUnique({
            where: { class_id: classId },
            include: { students: true },
        });
        if (!classEntity)
            throw new common_1.UnauthorizedException('Class not found');
        const studentResults = await this.prisma.result.findMany({
            where: {
                term,
                academicYear,
                student: { classId: classEntity.id },
            },
            include: { student: true },
        });
        const classSubjectsRaw = Array.isArray(classEntity.subjects)
            ? classEntity.subjects
            : [];
        const subjects = [];
        classSubjectsRaw.forEach((s, i) => {
            const name = typeof s === 'string' ? s : s.name || 'Unknown';
            const key = this.normalizeSubjectKey(name);
            if (!subjects.some(existing => existing.key === key)) {
                subjects.push({
                    id: (typeof s === 'object' && s && s.id) ? s.id : `subj-${i}-${Date.now()}`,
                    name: name,
                    key: key,
                });
            }
        });
        const validSubjectKeys = new Set(subjects.map((s) => s.key));
        const studentMap = new Map();
        for (const student of classEntity.students) {
            studentMap.set(student.id, {
                id: student.student_id,
                name: `${student.firstName} ${student.lastName}`,
                totalMarks: 0,
                ...Object.fromEntries(subjects.map((subj) => [subj.key, 'N/A'])),
            });
        }
        for (const res of studentResults) {
            if (!studentMap.has(res.studentId))
                continue;
            const st = studentMap.get(res.studentId);
            if (validSubjectKeys.has(res.subjectKey)) {
                const score = res.score;
                st[res.subjectKey] = Math.round(score);
                st.totalMarks += score;
            }
        }
        const gradingSetting = await this.prisma.systemSetting.findUnique({
            where: { key: 'gradingSystem' },
        });
        let gradingConfig = null;
        if (gradingSetting) {
            try {
                gradingConfig = JSON.parse(gradingSetting.value);
            }
            catch { }
        }
        const results = Array.from(studentMap.values()).map((s) => {
            const overallPercentage = subjects.length > 0 ? s.totalMarks / subjects.length : 0;
            const subjectPoints = [];
            subjects.forEach((subj) => {
                const score = s[subj.key];
                if (typeof score === 'number') {
                    let pts = 9;
                    if (gradingConfig && gradingConfig.grades) {
                        const rounded = Math.round(score);
                        for (const g of gradingConfig.grades) {
                            if (rounded >= g.minScore && rounded <= g.maxScore) {
                                pts = g.points;
                                break;
                            }
                        }
                    }
                    subjectPoints.push(pts);
                }
            });
            const worstPoint = gradingConfig && gradingConfig.grades && gradingConfig.grades.length > 0
                ? gradingConfig.grades[gradingConfig.grades.length - 1].points
                : 9;
            const sortedPoints = [...subjectPoints].sort((a, b) => a - b);
            let top6Points = 0;
            if (sortedPoints.length > 0) {
                const paddedPoints = [...sortedPoints];
                while (paddedPoints.length < 6) {
                    paddedPoints.push(worstPoint);
                }
                top6Points = paddedPoints.slice(0, 6).reduce((acc, p) => acc + p, 0);
            }
            return {
                ...s,
                total: Math.round(overallPercentage),
                totalMarks: Math.round(s.totalMarks),
                maxPotential: subjects.length * 100,
                points: top6Points,
            };
        });
        return {
            name: classEntity.name,
            level: classEntity.level,
            term: `Term ${term} (${academicYear})`,
            subjects,
            gradingConfig,
            results: results.sort((a, b) => {
                if (a.points === 0 && b.points === 0)
                    return b.total - a.total;
                if (a.points === 0)
                    return 1;
                if (b.points === 0)
                    return -1;
                if (a.points !== b.points)
                    return a.points - b.points;
                return b.total - a.total;
            }),
        };
    }
    async getInTermResultsWithActiveContext(userId, classId, term, academicYear) {
        const [termSetting, yearSetting] = await Promise.all([
            term
                ? null
                : this.prisma.systemSetting.findUnique({
                    where: { key: 'currentTerm' },
                }),
            academicYear
                ? null
                : this.prisma.systemSetting.findUnique({
                    where: { key: 'academicYear' },
                }),
        ]);
        const resolvedTerm = term ?? (termSetting ? parseInt(termSetting.value) : 1);
        const resolvedYear = academicYear ?? yearSetting?.value ?? new Date().getFullYear().toString();
        return this.getInTermResults(userId, classId, resolvedTerm, resolvedYear);
    }
    async unenrollStudent(studentId) {
        const student = await this.prisma.student.findUnique({
            where: { student_id: studentId },
            select: { userId: true },
        });
        if (!student) {
            throw new common_1.UnauthorizedException('Student record not found');
        }
        return this.prisma.user.delete({
            where: { id: student.userId },
        });
    }
    async unenrollStaff(teacherId) {
        const teacher = await this.prisma.teacher.findUnique({
            where: { teacher_id: teacherId },
            select: { userId: true },
        });
        if (!teacher) {
            throw new common_1.UnauthorizedException('Teacher record not found');
        }
        return this.prisma.user.delete({
            where: { id: teacher.userId },
        });
    }
    async getGradeEntries(classId, subjectKey, term, academicYear) {
        const classEntity = await this.prisma.class.findUnique({
            where: { class_id: classId },
        });
        if (!classEntity)
            throw new common_1.UnauthorizedException('Class not found');
        const finalModeSetting = await this.prisma.systemSetting.findUnique({
            where: { key: 'finalResultsMode' },
        });
        const isFinalMode = finalModeSetting?.value === 'true';
        if (isFinalMode) {
            const results = await this.prisma.result.findMany({
                where: {
                    subjectKey,
                    term,
                    academicYear,
                    student: { classId: classEntity.id },
                },
            });
            return results.map((r) => ({
                studentId: r.studentId,
                assessmentScores: { finalScore: r.score },
            }));
        }
        const scores = await this.prisma.termAssessmentScore.findMany({
            where: {
                subjectKey,
                term,
                academicYear,
                student: { classId: classEntity.id },
            },
        });
        const map = new Map();
        for (const score of scores) {
            if (!map.has(score.studentId)) {
                map.set(score.studentId, {
                    studentId: score.studentId,
                    assessmentScores: {},
                });
            }
            map.get(score.studentId).assessmentScores[score.assessmentId] =
                score.score;
        }
        return Array.from(map.values());
    }
    async bulkSaveGrades(userId, data) {
        const { classId, subjectKey, term, academicYear, entries } = data;
        const classEntity = await this.prisma.class.findUnique({
            where: { class_id: classId },
        });
        if (!classEntity)
            throw new common_1.UnauthorizedException('Class not found');
        const isFinalMode = entries.length > 0 &&
            entries[0].scores &&
            'finalScore' in entries[0].scores;
        if (isFinalMode) {
            const results = [];
            for (const entry of entries) {
                const student = await this.prisma.student.findUnique({
                    where: { student_id: entry.student_id },
                });
                if (!student)
                    continue;
                const finalScore = typeof entry.scores.finalScore === 'number'
                    ? entry.scores.finalScore
                    : parseFloat(entry.scores.finalScore) || 0;
                const res = await this.prisma.result.upsert({
                    where: {
                        studentId_subjectKey_term_academicYear: {
                            studentId: student.id,
                            subjectKey,
                            term,
                            academicYear,
                        },
                    },
                    update: {
                        score: finalScore,
                        assessmentScores: { finalScore },
                    },
                    create: {
                        studentId: student.id,
                        subjectKey,
                        term,
                        academicYear,
                        score: finalScore,
                        assessmentScores: { finalScore },
                    },
                });
                results.push(res);
            }
            setImmediate(() => {
                this.recalculateClassRanks(classEntity.name, academicYear, term);
            });
            return results;
        }
        const txResults = await this.prisma.$transaction(async (tx) => {
            const config = await tx.gradeConfig.findUnique({
                where: {
                    classId_subjectKey_term_academicYear: {
                        classId: classEntity.id,
                        subjectKey,
                        term,
                        academicYear,
                    },
                },
            });
            const assessmentsMetadata = config
                ? config.config?.assessments || []
                : [];
            const metaMap = new Map();
            for (const ass of assessmentsMetadata) {
                metaMap.set(ass.id, ass);
            }
            const results = [];
            for (const entry of entries) {
                const student = await tx.student.findUnique({
                    where: { student_id: entry.student_id },
                });
                if (!student)
                    continue;
                for (const [assId, scoreVal] of Object.entries(entry.scores)) {
                    const meta = metaMap.get(assId);
                    const name = meta ? meta.name : assId;
                    const maxScore = meta ? parseInt(meta.maxScore) : 100;
                    const numericScore = typeof scoreVal === 'number'
                        ? scoreVal
                        : parseFloat(scoreVal) || 0;
                    const res = await tx.termAssessmentScore.upsert({
                        where: {
                            studentId_subjectKey_assessmentId_term_academicYear: {
                                studentId: student.id,
                                subjectKey,
                                assessmentId: assId,
                                term,
                                academicYear,
                            },
                        },
                        update: {
                            score: numericScore,
                            maxScore: maxScore,
                            assessmentName: name,
                        },
                        create: {
                            studentId: student.id,
                            subjectKey,
                            assessmentId: assId,
                            assessmentName: name,
                            score: numericScore,
                            maxScore: maxScore,
                            term,
                            academicYear,
                        },
                    });
                    results.push(res);
                }
                let sumTotal = 0;
                let sumMax = 0;
                Object.entries(entry.scores).forEach(([assId, scoreVal]) => {
                    const meta = metaMap.get(assId);
                    const maxScore = meta ? parseInt(meta.maxScore) : 100;
                    const numericScore = typeof scoreVal === 'number'
                        ? scoreVal
                        : parseFloat(scoreVal) || 0;
                    sumTotal += numericScore;
                    sumMax += maxScore;
                });
                if (sumMax > 0) {
                    const avgPercentage = (sumTotal / sumMax) * 100;
                    await tx.result.upsert({
                        where: {
                            studentId_subjectKey_term_academicYear: {
                                studentId: student.id,
                                subjectKey,
                                term,
                                academicYear,
                            },
                        },
                        update: {
                            score: avgPercentage,
                            assessmentScores: entry.scores,
                        },
                        create: {
                            studentId: student.id,
                            subjectKey,
                            term,
                            academicYear,
                            score: avgPercentage,
                            assessmentScores: entry.scores,
                        },
                    });
                }
            }
            return results;
        });
        setImmediate(() => {
            this.recalculateClassRanks(classEntity.name, academicYear, term);
        });
        return txResults;
    }
    async getSubjectResults(userId, classId, subjectKey, term, academicYear) {
        let resolvedTerm = term;
        let resolvedYear = academicYear;
        if (!resolvedTerm || !resolvedYear) {
            const [termSetting, yearSetting] = await Promise.all([
                this.prisma.systemSetting.findUnique({ where: { key: 'currentTerm' } }),
                this.prisma.systemSetting.findUnique({ where: { key: 'academicYear' } }),
            ]);
            if (!resolvedTerm)
                resolvedTerm = termSetting ? parseInt(termSetting.value) : 1;
            if (!resolvedYear)
                resolvedYear = yearSetting ? yearSetting.value : '2025';
        }
        const classEntity = await this.prisma.class.findUnique({
            where: { class_id: classId },
            include: { students: true },
        });
        if (!classEntity)
            throw new common_1.UnauthorizedException('Class not found');
        const results = await this.prisma.result.findMany({
            where: {
                subjectKey,
                term: resolvedTerm,
                academicYear: resolvedYear,
                student: { classId: classEntity.id },
            },
            include: { student: true },
        });
        const assessmentScores = await this.prisma.termAssessmentScore.findMany({
            where: {
                subjectKey,
                term: resolvedTerm,
                academicYear: resolvedYear,
                student: { classId: classEntity.id },
            },
        });
        const stAssessmentMap = new Map();
        for (const score of assessmentScores) {
            if (!stAssessmentMap.has(score.studentId)) {
                stAssessmentMap.set(score.studentId, { sumScore: 0, sumMax: 0 });
            }
            const data = stAssessmentMap.get(score.studentId);
            data.sumScore += score.score;
            data.sumMax += score.maxScore;
        }
        const students = classEntity.students.map((student) => {
            const r = results.find((res) => res.studentId === student.id);
            let finalScore = 0;
            if (r) {
                if (r.assessmentScores && typeof r.assessmentScores === 'object' && 'finalScore' in r.assessmentScores) {
                    finalScore = r.assessmentScores.finalScore;
                }
                else {
                    finalScore = r.score;
                }
            }
            let inTermScore = 0;
            const assData = stAssessmentMap.get(student.id);
            if (assData && assData.sumMax > 0) {
                inTermScore = (assData.sumScore / assData.sumMax) * 100;
            }
            else if (r) {
                inTermScore = r.score;
            }
            return {
                id: student.student_id,
                name: `${student.firstName} ${student.lastName}`,
                inTermScore: Math.round(inTermScore * 10) / 10,
                finalScore: Math.round(finalScore * 10) / 10,
                total: Math.round((r ? r.score : inTermScore) * 10) / 10,
            };
        });
        const teacher = await this.prisma.teacher.findUnique({
            where: { userId: userId },
        });
        const subjectNamesMap = {
            bio: 'Biology',
            math: 'Mathematics',
            eng: 'English',
            chi: 'Chichewa',
            phys: 'Physical Science',
            chem: 'Chemistry',
            physics: 'Physics',
            hist: 'History',
            geog: 'Geography',
            agri: 'Agriculture',
            social: 'Social Studies',
            biz: 'Business Studies',
            comp: 'Computer Studies',
            home: 'Home Economics',
        };
        const displayName = subjectNamesMap[subjectKey] || subjectKey.toUpperCase();
        let resultTeacher = teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Assigned Teacher';
        if (Array.isArray(classEntity.subjects)) {
            const subjectConfig = classEntity.subjects.find(s => {
                const sName = typeof s === 'string' ? s : (s && typeof s === 'object' ? s.name : '');
                return sName && sName.toLowerCase() === displayName.toLowerCase();
            });
            if (subjectConfig && typeof subjectConfig === 'object' && subjectConfig.teacher) {
                resultTeacher = subjectConfig.teacher;
            }
        }
        const finalModeSetting = await this.prisma.systemSetting.findUnique({
            where: { key: 'finalResultsMode' },
        });
        const isFinalMode = finalModeSetting?.value === 'true';
        return {
            name: displayName,
            class: classEntity.name,
            teacher: resultTeacher,
            term: `Term ${resolvedTerm} (${resolvedYear})`,
            isFinalMode,
            results: students.sort((a, b) => b.total - a.total),
        };
    }
    async changePassword(userId, data) {
        if (!data.newPassword || !data.currentPassword) {
            throw new common_1.UnauthorizedException('Current and new passwords are required');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isMatch = await bcrypt.compare(data.currentPassword, user.passwordHash);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const hashedPassword = await bcrypt.hash(data.newPassword, 10);
        return this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: hashedPassword },
        });
    }
    async migrateClass(userId, classId, targetClassId, promotions) {
        const classEntity = await this.prisma.class.findUnique({
            where: { class_id: classId },
            include: { students: true },
        });
        if (!classEntity)
            throw new common_1.BadRequestException('Source class not found');
        const targetClass = await this.prisma.class.findUnique({
            where: { class_id: targetClassId },
        });
        if (!targetClass)
            throw new common_1.BadRequestException('Target class not found');
        const yearSetting = await this.prisma.systemSetting.findFirst({
            where: { key: 'academicYear' },
        });
        const currentYear = yearSetting ? yearSetting.value : '2025';
        const nextYear = (parseInt(currentYear) + 1).toString();
        let migratedCount = 0;
        let repeatedCount = 0;
        for (const promo of promotions) {
            const student = classEntity.students.find(s => s.student_id === promo.studentId);
            if (!student)
                continue;
            let historyObj = {};
            if (student.classHistory) {
                try {
                    historyObj = JSON.parse(student.classHistory);
                }
                catch { }
            }
            historyObj[currentYear] = classEntity.name;
            await this.prisma.classHistory.upsert({
                where: {
                    studentId_academicYear: {
                        studentId: student.id,
                        academicYear: currentYear,
                    },
                },
                update: { className: classEntity.name },
                create: {
                    studentId: student.id,
                    academicYear: currentYear,
                    className: classEntity.name,
                },
            });
            if (promo.action === 'migrate') {
                historyObj[nextYear] = targetClass.name;
                await this.prisma.student.update({
                    where: { id: student.id },
                    data: {
                        classId: targetClass.id,
                        classHistory: JSON.stringify(historyObj),
                    },
                });
                await this.prisma.classHistory.upsert({
                    where: {
                        studentId_academicYear: {
                            studentId: student.id,
                            academicYear: nextYear,
                        },
                    },
                    update: { className: targetClass.name },
                    create: {
                        studentId: student.id,
                        academicYear: nextYear,
                        className: targetClass.name,
                    },
                });
                migratedCount++;
            }
            else {
                historyObj[nextYear] = classEntity.name;
                await this.prisma.student.update({
                    where: { id: student.id },
                    data: {
                        classHistory: JSON.stringify(historyObj),
                    },
                });
                await this.prisma.classHistory.upsert({
                    where: {
                        studentId_academicYear: {
                            studentId: student.id,
                            academicYear: nextYear,
                        },
                    },
                    update: { className: classEntity.name },
                    create: {
                        studentId: student.id,
                        academicYear: nextYear,
                        className: classEntity.name,
                    },
                });
                repeatedCount++;
            }
        }
        return {
            message: 'Class migration completed successfully',
            migratedCount,
            repeatedCount,
        };
    }
    async recalculateClassRanks(className, academicYear, term) {
        try {
            const students = await this.prisma.student.findMany({
                where: {
                    OR: [
                        { class: { name: className } },
                        { classHistoryRelations: { some: { className, academicYear } } }
                    ]
                },
                select: { id: true, student_id: true }
            });
            const studentIds = students.map(s => s.id);
            if (studentIds.length === 0)
                return;
            const finalModeSetting = await this.prisma.systemSetting.findUnique({
                where: { key: 'finalResultsMode' },
            });
            const isFinalMode = finalModeSetting?.value === 'true';
            const gradingSetting = await this.prisma.systemSetting.findUnique({
                where: { key: 'gradingSystem' },
            });
            let gradingConfig = admin_service_1.AdminService.DEFAULT_GRADING_CONFIG || { grades: [], passMinScore: 40 };
            if (gradingSetting) {
                try {
                    gradingConfig = JSON.parse(gradingSetting.value);
                }
                catch { }
            }
            const classEntity = await this.prisma.class.findFirst({
                where: { name: className }
            });
            const subjectsCount = classEntity && Array.isArray(classEntity.subjects)
                ? classEntity.subjects.length
                : 0;
            const studentAverages = [];
            if (isFinalMode) {
                const results = await this.prisma.result.findMany({
                    where: {
                        studentId: { in: studentIds },
                        academicYear,
                        term,
                    },
                });
                const resultsByStudent = new Map();
                results.forEach((res) => {
                    if (!resultsByStudent.has(res.studentId)) {
                        resultsByStudent.set(res.studentId, { total: 0, scores: [] });
                    }
                    const data = resultsByStudent.get(res.studentId);
                    data.total += res.score;
                    let pts = 9;
                    if (gradingConfig && gradingConfig.grades) {
                        const rounded = Math.round(res.score);
                        for (const g of gradingConfig.grades) {
                            if (rounded >= g.minScore && rounded <= g.maxScore) {
                                pts = g.points;
                                break;
                            }
                        }
                    }
                    data.scores.push(pts);
                });
                studentIds.forEach((sId) => {
                    const data = resultsByStudent.get(sId) || { total: 0, scores: [] };
                    const avg = subjectsCount > 0 ? Math.round(data.total / subjectsCount) : 0;
                    const worstPoint = gradingConfig && gradingConfig.grades && gradingConfig.grades.length > 0
                        ? gradingConfig.grades[gradingConfig.grades.length - 1].points
                        : 9;
                    const sortedPts = [...data.scores].sort((a, b) => a - b);
                    while (sortedPts.length < 6)
                        sortedPts.push(worstPoint);
                    const points = sortedPts.slice(0, 6).reduce((acc, p) => acc + p, 0);
                    studentAverages.push({ id: sId, avg, points });
                });
            }
            else {
                const scores = await this.prisma.termAssessmentScore.findMany({
                    where: {
                        studentId: { in: studentIds },
                        academicYear,
                        term,
                    },
                });
                const resultsByStudent = new Map();
                scores.forEach((s) => {
                    if (!resultsByStudent.has(s.studentId)) {
                        resultsByStudent.set(s.studentId, { total: 0, max: 0, subjects: {} });
                    }
                    const st = resultsByStudent.get(s.studentId);
                    st.total += s.score;
                    st.max += s.maxScore || 100;
                    if (!st.subjects[s.subjectKey])
                        st.subjects[s.subjectKey] = { total: 0, max: 0 };
                    st.subjects[s.subjectKey].total += s.score;
                    st.subjects[s.subjectKey].max += s.maxScore || 100;
                });
                studentIds.forEach((sId) => {
                    const data = resultsByStudent.get(sId) || { total: 0, max: 0, subjects: {} };
                    const avg = data.max > 0 ? (data.total / data.max) * 100 : 0;
                    const subjectPoints = [];
                    Object.keys(data.subjects).forEach(key => {
                        const sub = data.subjects[key];
                        const score = sub.max > 0 ? Math.round((sub.total / sub.max) * 100) : 0;
                        let pts = 9;
                        if (gradingConfig && gradingConfig.grades) {
                            const rounded = Math.round(score);
                            for (const g of gradingConfig.grades) {
                                if (rounded >= g.minScore && rounded <= g.maxScore) {
                                    pts = g.points;
                                    break;
                                }
                            }
                        }
                        subjectPoints.push(pts);
                    });
                    const worstPoint = gradingConfig && gradingConfig.grades && gradingConfig.grades.length > 0
                        ? gradingConfig.grades[gradingConfig.grades.length - 1].points
                        : 9;
                    const sortedPts = [...subjectPoints].sort((a, b) => a - b);
                    while (sortedPts.length < 6)
                        sortedPts.push(worstPoint);
                    const points = sortedPts.slice(0, 6).reduce((acc, p) => acc + p, 0);
                    studentAverages.push({ id: sId, avg: Math.round(avg), points });
                });
            }
            studentAverages.sort((a, b) => {
                if (a.points === 0 && b.points === 0)
                    return b.avg - a.avg;
                if (a.points === 0)
                    return 1;
                if (b.points === 0)
                    return -1;
                if (a.points !== b.points)
                    return a.points - b.points;
                return b.avg - a.avg;
            });
            const totalStudents = studentIds.length;
            for (let i = 0; i < studentAverages.length; i++) {
                const item = studentAverages[i];
                await this.prisma.studentRank.upsert({
                    where: {
                        studentId_term_academicYear: {
                            studentId: item.id,
                            term,
                            academicYear,
                        },
                    },
                    update: {
                        average: item.avg,
                        points: item.points,
                        rank: i + 1,
                        totalStudents,
                    },
                    create: {
                        studentId: item.id,
                        term,
                        academicYear,
                        average: item.avg,
                        points: item.points,
                        rank: i + 1,
                        totalStudents,
                    },
                });
            }
            console.log(`[TeachersService] Recalculated ranks for class ${className}, year ${academicYear}, term ${term}`);
        }
        catch (err) {
            console.error('[TeachersService] Error recalculating ranks:', err);
        }
    }
};
exports.TeachersService = TeachersService;
exports.TeachersService = TeachersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeachersService);
//# sourceMappingURL=teachers.service.js.map