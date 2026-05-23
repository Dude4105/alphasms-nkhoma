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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicResultsController = void 0;
const common_1 = require("@nestjs/common");
const students_service_1 = require("./students.service");
const prisma_service_1 = require("../prisma/prisma.service");
let PublicResultsController = class PublicResultsController {
    studentsService;
    prisma;
    constructor(studentsService, prisma) {
        this.studentsService = studentsService;
        this.prisma = prisma;
    }
    async getPublicReport(id, term, academicYear) {
        const parsedTerm = term ? parseInt(term) : undefined;
        return this.studentsService.findOne(id, parsedTerm, academicYear);
    }
    async getStatus() {
        const setting = await this.prisma.systemSetting.findUnique({
            where: { key: 'examResultsPublished' },
        });
        return { published: setting?.value === 'true' };
    }
    async getInfo() {
        const keys = ['schoolName', 'schoolCampus', 'schoolAddress', 'schoolPhone', 'schoolEmail'];
        const settings = await this.prisma.systemSetting.findMany({
            where: { key: { in: keys } }
        });
        return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    }
    async checkResults(body) {
        const { firstName, lastName, dob } = body;
        if (!firstName || !lastName || !dob) {
            throw new common_1.BadRequestException('Missing student details');
        }
        const setting = await this.prisma.systemSetting.findUnique({
            where: { key: 'examResultsPublished' },
        });
        const isPublished = setting?.value === 'true';
        if (!isPublished) {
            return {
                published: false,
                message: 'Examination results are not yet published for this term.'
            };
        }
        const result = await this.studentsService.findByDetails(firstName, lastName, dob);
        if (!result) {
            return {
                published: true,
                found: false,
                message: 'No student found with the provided details. Please check and try again.'
            };
        }
        return {
            published: true,
            found: true,
            student: result,
        };
    }
};
exports.PublicResultsController = PublicResultsController;
__decorate([
    (0, common_1.Get)('report/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('term')),
    __param(2, (0, common_1.Query)('academicYear')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PublicResultsController.prototype, "getPublicReport", null);
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicResultsController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('info'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicResultsController.prototype, "getInfo", null);
__decorate([
    (0, common_1.Post)('check'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PublicResultsController.prototype, "checkResults", null);
exports.PublicResultsController = PublicResultsController = __decorate([
    (0, common_1.Controller)('public-results'),
    __metadata("design:paramtypes", [students_service_1.StudentsService,
        prisma_service_1.PrismaService])
], PublicResultsController);
//# sourceMappingURL=public-results.controller.js.map