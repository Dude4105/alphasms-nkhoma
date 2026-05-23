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
exports.SubjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SubjectsService = class SubjectsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const code = data.subject_code || `SUB-${Math.floor(100 + Math.random() * 900)}`;
        return this.prisma.subject.create({
            data: {
                subject_code: code,
                name: data.name,
                department: data.department,
                description: data.description,
            },
        });
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = query.search
            ? {
                OR: [
                    { name: { contains: query.search } },
                    { subject_code: { contains: query.search } },
                    { department: { contains: query.search } },
                ],
            }
            : {};
        const [data, total] = await Promise.all([
            this.prisma.subject.findMany({
                where,
                skip,
                take: limit,
            }),
            this.prisma.subject.count({ where }),
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
    async findOne(id) {
        return this.prisma.subject.findUnique({
            where: { id },
        });
    }
    async remove(id) {
        const subject = await this.prisma.subject.findUnique({
            where: { id },
        });
        if (!subject) {
            throw new common_1.NotFoundException(`Subject with ID ${id} not found`);
        }
        const classes = await this.prisma.class.findMany({
            select: { name: true, subjects: true },
        });
        const assignedClass = classes.find((c) => {
            const subjects = Array.isArray(c.subjects) ? c.subjects : [];
            return subjects.some((s) => s.name === subject.name);
        });
        if (assignedClass) {
            throw new common_1.ConflictException(`Subject "${subject.name}" cannot be deleted because it is assigned to class "${assignedClass.name}"`);
        }
        return this.prisma.subject.delete({
            where: { id },
        });
    }
    async bulkCreate(subjects) {
        const getDept = (name) => {
            const sci = [
                'Biology',
                'Physics',
                'Chemistry',
                'Mathematics',
                'Physical Science',
                'Agriculture',
                'Computer Studies',
            ];
            const lang = ['English', 'Chichewa', 'French'];
            const hum = [
                'Geography',
                'History',
                'Social Studies',
                'Life Skills',
                'Bible Knowledge',
                'Religious Studies',
            ];
            const comm = ['Business Studies', 'Accounting'];
            const tech = ['Home Economics', 'Technical Education'];
            if (sci.some((s) => name.includes(s)))
                return 'Sciences';
            if (lang.some((s) => name.includes(s)))
                return 'Languages';
            if (hum.some((s) => name.includes(s)))
                return 'Humanities';
            if (comm.some((s) => name.includes(s)))
                return 'Commercial';
            if (tech.some((s) => name.includes(s)))
                return 'Technical';
            return 'General';
        };
        const data = subjects.map((s) => ({
            name: s.name,
            subject_code: s.subject_code ||
                `SUB-${s.name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
            department: s.department || getDept(s.name),
            description: s.description || `Academic course for ${s.name}`,
        }));
        return this.prisma.subject.createMany({
            data,
            skipDuplicates: true,
        });
    }
};
exports.SubjectsService = SubjectsService;
exports.SubjectsService = SubjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubjectsService);
//# sourceMappingURL=subjects.service.js.map