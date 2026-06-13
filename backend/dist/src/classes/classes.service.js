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
exports.ClassesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const utils_1 = require("../common/utils");
let ClassesService = class ClassesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const className = `${data.formName || ''}${data.stream || ''}`.trim();
        const classId = data.class_id || `CLS-${Date.now()}`;
        const newClass = await this.prisma.class.create({
            data: {
                class_id: classId,
                name: className,
                level: data.level,
                track: data.track,
                room: data.room,
                classTeacher: data.classTeacher,
                schedule: data.schedule,
                capacity: data.capacity ? Number(data.capacity) : null,
                subjects: data.subjects || [],
                timetable: data.timetable,
            },
        });
        await this.syncTeacherClasses();
        return newClass;
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = query.search
            ? {
                OR: [
                    { name: { contains: query.search } },
                    { class_id: { contains: query.search } },
                ],
            }
            : {};
        const [data, total] = await Promise.all([
            this.prisma.class.findMany({
                where,
                skip,
                take: limit,
                include: {
                    _count: {
                        select: { students: true },
                    },
                },
            }),
            this.prisma.class.count({ where }),
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
    async findOne(class_id) {
        const classData = await this.prisma.class.findUnique({
            where: { class_id },
            include: {
                students: {
                    select: {
                        id: true,
                        student_id: true,
                        firstName: true,
                        lastName: true,
                        gender: true,
                        scholarType: true,
                    },
                },
            },
        });
        if (!classData)
            return null;
        const settings = await this.prisma.systemSetting.findMany({
            where: {
                key: { in: ['finalResultsMode', 'academicYear', 'currentTerm'] },
            },
        });
        let isFinalMode = false;
        let academicYear = '2026';
        let currentTerm = 1;
        for (const setting of settings) {
            if (setting.key === 'finalResultsMode')
                isFinalMode = setting.value === 'true';
            if (setting.key === 'academicYear')
                academicYear = setting.value;
            if (setting.key === 'currentTerm')
                currentTerm = parseInt(setting.value) || 1;
        }
        const gradingSetting = await this.prisma.systemSetting.findUnique({
            where: { key: 'gradingSystem' },
        });
        let passMinScore = 40;
        if (gradingSetting) {
            try {
                const parsed = JSON.parse(gradingSetting.value);
                if (typeof parsed.passMinScore === 'number')
                    passMinScore = parsed.passMinScore;
            }
            catch { }
        }
        let classAvg = 'N/A';
        let topStudent = 'N/A';
        let passRate = 'N/A';
        const subjectsCount = Array.isArray(classData.subjects)
            ? classData.subjects.length
            : 0;
        const sCount = classData.students.length;
        if (sCount > 0 && subjectsCount > 0) {
            if (isFinalMode) {
                const results = await this.prisma.result.findMany({
                    where: {
                        student: { classId: classData.id },
                        academicYear,
                        term: currentTerm,
                    },
                    include: { student: true },
                });
                const studentAverages = [];
                let totalClassAverage = 0;
                let passCount = 0;
                const resultsByStudent = new Map();
                results.forEach((res) => {
                    if (!resultsByStudent.has(res.studentId)) {
                        resultsByStudent.set(res.studentId, {
                            student: res.student,
                            total: 0,
                        });
                    }
                    resultsByStudent.get(res.studentId).total += res.score;
                });
                resultsByStudent.forEach((data) => {
                    const avg = data.total / subjectsCount;
                    studentAverages.push({
                        student_id: data.student.student_id,
                        name: `${data.student.firstName} ${data.student.lastName}`,
                        avg,
                    });
                    totalClassAverage += avg;
                    if (avg >= passMinScore)
                        passCount++;
                });
                if (studentAverages.length > 0) {
                    studentAverages.sort((a, b) => b.avg - a.avg);
                    classAvg = Math.round(totalClassAverage / studentAverages.length);
                    passRate = Math.round((passCount / studentAverages.length) * 100);
                    topStudent = studentAverages[0].name;
                }
            }
            else {
                const scores = await this.prisma.termAssessmentScore.findMany({
                    where: {
                        student: { classId: classData.id },
                        academicYear,
                        term: currentTerm,
                    },
                    include: { student: true },
                });
                const studentAverages = [];
                let totalClassAverage = 0;
                let passCount = 0;
                const resultsByStudent = new Map();
                scores.forEach((s) => {
                    if (!resultsByStudent.has(s.studentId)) {
                        resultsByStudent.set(s.studentId, {
                            student: s.student,
                            total: 0,
                            max: 0,
                        });
                    }
                    const st = resultsByStudent.get(s.studentId);
                    st.total += s.score;
                    st.max += s.maxScore || 100;
                });
                resultsByStudent.forEach((data) => {
                    const avg = data.max > 0 ? (data.total / data.max) * 100 : 0;
                    studentAverages.push({
                        student_id: data.student.student_id,
                        name: `${data.student.firstName} ${data.student.lastName}`,
                        avg,
                    });
                    totalClassAverage += avg;
                    if (avg >= passMinScore)
                        passCount++;
                });
                if (studentAverages.length > 0) {
                    studentAverages.sort((a, b) => b.avg - a.avg);
                    classAvg = Math.round(totalClassAverage / studentAverages.length);
                    passRate = Math.round((passCount / studentAverages.length) * 100);
                    topStudent = studentAverages[0].name;
                }
            }
            const studentAvgMap = new Map();
            if (isFinalMode) {
            }
        }
        const studentAvgMap = new Map();
        if (sCount > 0 && subjectsCount > 0) {
            if (isFinalMode) {
                const results = await this.prisma.result.findMany({
                    where: {
                        student: { classId: classData.id },
                        academicYear,
                        term: currentTerm,
                    },
                    include: { student: true },
                });
                const resultsByStudent = new Map();
                results.forEach((res) => {
                    if (!resultsByStudent.has(res.studentId))
                        resultsByStudent.set(res.studentId, {
                            student: res.student,
                            total: 0,
                        });
                    resultsByStudent.get(res.studentId).total += res.score;
                });
                resultsByStudent.forEach((data) => {
                    studentAvgMap.set(data.student.student_id, data.total / subjectsCount);
                });
            }
            else {
                const scores = await this.prisma.termAssessmentScore.findMany({
                    where: {
                        student: { classId: classData.id },
                        academicYear,
                        term: currentTerm,
                    },
                    include: { student: true },
                });
                const resultsByStudent = new Map();
                scores.forEach((s) => {
                    if (!resultsByStudent.has(s.studentId))
                        resultsByStudent.set(s.studentId, {
                            student: s.student,
                            total: 0,
                            max: 0,
                        });
                    resultsByStudent.get(s.studentId).total += s.score;
                    resultsByStudent.get(s.studentId).max += s.maxScore || 100;
                });
                resultsByStudent.forEach((data) => {
                    studentAvgMap.set(data.student.student_id, data.max > 0 ? (data.total / data.max) * 100 : 0);
                });
            }
        }
        const studentsWithAvgs = classData.students.map((s) => ({
            ...s,
            avg: studentAvgMap.has(s.student_id)
                ? Math.round(studentAvgMap.get(s.student_id))
                : 'N/A',
        }));
        return {
            ...classData,
            students: studentsWithAvgs,
            performance: {
                classAvg,
                passRate,
                topStudent,
            },
        };
    }
    async update(class_id, data) {
        const existingClass = await this.prisma.class.findUnique({
            where: { class_id },
            select: { id: true, subjects: true },
        });
        if (!existingClass)
            throw new common_1.NotFoundException('Class not found');
        if (data.subjects !== undefined) {
            const oldSubjects = Array.isArray(existingClass.subjects)
                ? existingClass.subjects
                : [];
            const newSubjects = Array.isArray(data.subjects) ? data.subjects : [];
            const removedSubjects = oldSubjects.filter((oldSub) => !newSubjects.some((newSub) => newSub.name === oldSub.name));
            for (const sub of removedSubjects) {
                const key = (0, utils_1.normalizeSubjectKey)(sub.name);
                const hasGrades = await this.prisma.result.findFirst({
                    where: {
                        subjectKey: key,
                        student: { classId: existingClass.id },
                    },
                });
                if (hasGrades) {
                    throw new common_1.BadRequestException(`Cannot remove subject "${sub.name}" because it has recorded grades for students in this class.`);
                }
                const hasScores = await this.prisma.termAssessmentScore.findFirst({
                    where: {
                        subjectKey: key,
                        student: { classId: existingClass.id },
                    },
                });
                if (hasScores) {
                    throw new common_1.BadRequestException(`Cannot remove subject "${sub.name}" because it has recorded assessment scores for students in this class.`);
                }
            }
        }
        const updatedClass = await this.prisma.class.update({
            where: { class_id },
            data: {
                name: data.name,
                level: data.level,
                track: data.track,
                room: data.room,
                classTeacher: data.classTeacher,
                schedule: data.schedule,
                capacity: data.capacity ? Number(data.capacity) : undefined,
                subjects: data.subjects,
                timetable: data.timetable,
            },
        });
        await this.syncTeacherClasses();
        return updatedClass;
    }
    async remove(class_id) {
        const res = await this.prisma.class.delete({
            where: { class_id },
        });
        await this.syncTeacherClasses();
        return res;
    }
    async getUsedSubjects(class_id) {
        const cls = await this.prisma.class.findUnique({
            where: { class_id },
            select: { id: true, subjects: true },
        });
        if (!cls)
            throw new common_1.NotFoundException('Class not found');
        const subjects = Array.isArray(cls.subjects) ? cls.subjects : [];
        const usedSubjects = [];
        for (const sub of subjects) {
            const key = (0, utils_1.normalizeSubjectKey)(sub.name);
            const hasGrades = await this.prisma.result.findFirst({
                where: { subjectKey: key, student: { classId: cls.id } },
            });
            const hasScores = await this.prisma.termAssessmentScore.findFirst({
                where: { subjectKey: key, student: { classId: cls.id } },
            });
            if (hasGrades || hasScores) {
                usedSubjects.push(sub.name);
            }
        }
        return usedSubjects;
    }
    async getClassResults(classId, term, year) {
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
        const finalModeSetting = await this.prisma.systemSetting.findUnique({
            where: { key: 'finalResultsMode' },
        });
        const isFinalMode = finalModeSetting?.value === 'true';
        const mainClass = await this.prisma.class.findUnique({
            where: { class_id: classId },
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
                key: (0, utils_1.normalizeSubjectKey)(subjName),
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
                    const scores = res.assessmentScores;
                    const hasFinalScore = scores && typeof scores === 'object' && 'finalScore' in scores;
                    const scoreVal = isFinalMode ? (hasFinalScore ? (scores.finalScore ?? 0) : 0) : res.score;
                    studentData[res.subjectKey] = scoreVal;
                    total += scoreVal;
                }
            });
            studentData.total = total;
            studentData.avg =
                subjectsWithKeys.length > 0 ? total / subjectsWithKeys.length : 0;
            const subjectPoints = [];
            student.results.forEach((res) => {
                if (subjectsWithKeys.some((s) => s.key === res.subjectKey)) {
                    const scores = res.assessmentScores;
                    const hasFinalScore = scores && typeof scores === 'object' && 'finalScore' in scores;
                    const scoreVal = isFinalMode ? (hasFinalScore ? (scores.finalScore ?? 0) : 0) : res.score;
                    let pts = 9;
                    if (gradingConfig && gradingConfig.grades) {
                        const rounded = Math.round(scoreVal);
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
    async syncTeacherClasses() {
        try {
            const classes = await this.prisma.class.findMany();
            const teachers = await this.prisma.teacher.findMany();
            const teacherAssignments = new Map();
            teachers.forEach((t) => {
                teacherAssignments.set(`${t.firstName} ${t.lastName}`, new Set());
            });
            classes.forEach((cls) => {
                if (cls.classTeacher) {
                    teacherAssignments.get(cls.classTeacher)?.add(cls.name);
                }
                const subjects = Array.isArray(cls.subjects)
                    ? cls.subjects
                    : [];
                subjects.forEach((s) => {
                    if (s.teacher) {
                        teacherAssignments.get(s.teacher)?.add(cls.name);
                    }
                });
            });
            for (const teacher of teachers) {
                const fullName = `${teacher.firstName} ${teacher.lastName}`;
                const requiredClasses = Array.from(teacherAssignments.get(fullName) || []).sort();
                const currentClasses = [
                    ...(Array.isArray(teacher.classes)
                        ? teacher.classes
                        : []),
                ].sort();
                if (JSON.stringify(requiredClasses) !== JSON.stringify(currentClasses)) {
                    await this.prisma.teacher.update({
                        where: { id: teacher.id },
                        data: { classes: requiredClasses },
                    });
                }
            }
        }
        catch (err) {
            console.error('[ClassesService] Error syncing teacher classes:', err);
        }
    }
};
exports.ClassesService = ClassesService;
exports.ClassesService = ClassesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClassesService);
//# sourceMappingURL=classes.service.js.map