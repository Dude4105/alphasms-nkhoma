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
exports.TeachersController = void 0;
const common_1 = require("@nestjs/common");
const teachers_service_1 = require("./teachers.service");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let TeachersController = class TeachersController {
    teachersService;
    constructor(teachersService) {
        this.teachersService = teachersService;
    }
    changePassword(req, body) {
        console.log('[TeachersController] Password change request received for userId:', req.user.userId);
        return this.teachersService.changePassword(req.user.userId, body);
    }
    getGradeConfig(classId, subjectKey, term, academicYear) {
        const termNum = parseInt(term.replace('term', '')) || 1;
        return this.teachersService.getGradeConfig(classId, subjectKey, termNum, academicYear);
    }
    saveGradeConfig(req, body) {
        return this.teachersService.saveGradeConfig(req.user.userId, body);
    }
    getGradeEntries(classId, subjectKey, term, academicYear) {
        const termNum = parseInt(term.replace('term', '')) || 1;
        return this.teachersService.getGradeEntries(classId, subjectKey, termNum, academicYear);
    }
    bulkSaveGrades(req, body) {
        return this.teachersService.bulkSaveGrades(req.user.userId, body);
    }
    getProfile(req) {
        return this.teachersService.getProfile(req.user.userId);
    }
    getDashboard(req) {
        return this.teachersService.getDashboardData(req.user.userId);
    }
    getMyClasses(req) {
        return this.teachersService.getMyClasses(req.user.userId);
    }
    getMyMainClass(req) {
        return this.teachersService.getMainClass(req.user.userId);
    }
    getMainClassResults(req, term, year) {
        return this.teachersService.getMainClassResults(req.user.userId, term ? parseInt(term) : undefined, year);
    }
    async getInTermResults(req, classId, term, year) {
        if (!term || !year) {
            return this.teachersService.getInTermResultsWithActiveContext(req.user.userId, classId, term ? parseInt(term) : undefined, year);
        }
        const termNum = parseInt(term);
        return this.teachersService.getInTermResults(req.user.userId, classId, termNum, year);
    }
    getSubjectResults(req, classId, subjectKey, term, year) {
        const termNum = term ? parseInt(term) : 1;
        return this.teachersService.getSubjectResults(req.user.userId, classId, subjectKey, termNum, year);
    }
    migrateClass(req, classId, body) {
        return this.teachersService.migrateClass(req.user.userId, classId, body.targetClassId, body.promotions);
    }
    unenrollStudent(studentId) {
        return this.teachersService.unenrollStudent(studentId);
    }
    unenrollStaff(teacherId) {
        return this.teachersService.unenrollStaff(teacherId);
    }
    create(body) {
        return this.teachersService.create(body);
    }
    findAll(query) {
        return this.teachersService.findAll(query);
    }
    findOne(id) {
        return this.teachersService.findOne(id);
    }
    update(id, body) {
        return this.teachersService.update(id, body);
    }
    remove(id) {
        return this.teachersService.remove(id);
    }
};
exports.TeachersController = TeachersController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    (0, common_1.Patch)('me/change-password'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TeachersController.prototype, "changePassword", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    (0, common_1.Get)('grades/config'),
    __param(0, (0, common_1.Query)('classId')),
    __param(1, (0, common_1.Query)('subjectKey')),
    __param(2, (0, common_1.Query)('term')),
    __param(3, (0, common_1.Query)('academicYear')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], TeachersController.prototype, "getGradeConfig", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    (0, common_1.Post)('grades/config'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TeachersController.prototype, "saveGradeConfig", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    (0, common_1.Get)('grades/entries'),
    __param(0, (0, common_1.Query)('classId')),
    __param(1, (0, common_1.Query)('subjectKey')),
    __param(2, (0, common_1.Query)('term')),
    __param(3, (0, common_1.Query)('academicYear')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], TeachersController.prototype, "getGradeEntries", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    (0, common_1.Post)('grades/entries/bulk'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TeachersController.prototype, "bulkSaveGrades", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    (0, common_1.Get)('me/profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TeachersController.prototype, "getProfile", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    (0, common_1.Get)('me/dashboard'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TeachersController.prototype, "getDashboard", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    (0, common_1.Get)('me/classes'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TeachersController.prototype, "getMyClasses", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    (0, common_1.Get)('me/main-class'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TeachersController.prototype, "getMyMainClass", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    (0, common_1.Get)('me/main-class/results'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('term')),
    __param(2, (0, common_1.Query)('academicYear')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], TeachersController.prototype, "getMainClassResults", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    (0, common_1.Get)('classes/:classId/in-term-results'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('classId')),
    __param(2, (0, common_1.Query)('term')),
    __param(3, (0, common_1.Query)('academicYear')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "getInTermResults", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    (0, common_1.Get)('classes/:classId/subjects/:subjectKey/results'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('classId')),
    __param(2, (0, common_1.Param)('subjectKey')),
    __param(3, (0, common_1.Query)('term')),
    __param(4, (0, common_1.Query)('academicYear')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], TeachersController.prototype, "getSubjectResults", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Post)('classes/:classId/migrate'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('classId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], TeachersController.prototype, "migrateClass", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Delete)('students/:studentId'),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TeachersController.prototype, "unenrollStudent", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Delete)('staff/:teacherId'),
    __param(0, (0, common_1.Param)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TeachersController.prototype, "unenrollStaff", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TeachersController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], TeachersController.prototype, "findAll", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TeachersController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TeachersController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TeachersController.prototype, "remove", null);
exports.TeachersController = TeachersController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, common_1.Controller)('teachers'),
    __metadata("design:paramtypes", [teachers_service_1.TeachersService])
], TeachersController);
//# sourceMappingURL=teachers.controller.js.map