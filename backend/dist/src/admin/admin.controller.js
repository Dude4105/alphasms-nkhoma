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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    getDashboardStats() {
        return this.adminService.getDashboardStats();
    }
    getSettings() {
        return this.adminService.getSettings();
    }
    updateSettings(data) {
        return this.adminService.updateSettings(data);
    }
    getFinalResultsMode() {
        return this.adminService.getFinalResultsMode();
    }
    toggleFinalResultsMode(body) {
        return this.adminService.setFinalResultsMode(body.enabled);
    }
    getExamResultsPublished() {
        return this.adminService.getExamResultsPublished();
    }
    toggleExamResultsPublished(body) {
        return this.adminService.setExamResultsPublished(body.enabled);
    }
    getGradingSystem() {
        return this.adminService.getGradingSystem();
    }
    updateGradingSystem(body) {
        return this.adminService.updateGradingSystem(body);
    }
    addAdmin(data) {
        return this.adminService.addAdmin(data);
    }
    getAdmins() {
        return this.adminService.getAllAdmins();
    }
    changePassword(req, data) {
        return this.adminService.changePassword(req.user.userId, data);
    }
    getMe(req) {
        return this.adminService.getAdminMe(req.user.userId);
    }
    getPasswordResets() {
        return this.adminService.getPasswordResets();
    }
    resolvePasswordReset(id) {
        return this.adminService.resolvePasswordReset(parseInt(id, 10));
    }
    getAdmin(id) {
        if (id === 'list' || id === 'me' || id === 'dashboard-stats' || id === 'settings' || id === 'password-resets' || id === 'add-admin' || id === 'change-password') {
            return null;
        }
        return this.adminService.getAdminById(parseInt(id, 10));
    }
    updatePermissions(id, body) {
        return this.adminService.updateAdminPermissions(parseInt(id, 10), body.permissions);
    }
    deleteAdmin(id) {
        if (id === 'list' || id === 'me' || id === 'dashboard-stats' || id === 'settings' || id === 'password-resets' || id === 'add-admin' || id === 'change-password') {
            return null;
        }
        return this.adminService.deleteAdmin(parseInt(id, 10));
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard-stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('settings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Patch)('settings'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Get)('settings/final-results-mode'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getFinalResultsMode", null);
__decorate([
    (0, common_1.Patch)('settings/final-results-mode'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggleFinalResultsMode", null);
__decorate([
    (0, common_1.Get)('settings/exam-results-published'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getExamResultsPublished", null);
__decorate([
    (0, common_1.Patch)('settings/exam-results-published'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "toggleExamResultsPublished", null);
__decorate([
    (0, common_1.Get)('settings/grading-system'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getGradingSystem", null);
__decorate([
    (0, common_1.Patch)('settings/grading-system'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateGradingSystem", null);
__decorate([
    (0, common_1.Post)('add-admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "addAdmin", null);
__decorate([
    (0, common_1.Get)('list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAdmins", null);
__decorate([
    (0, common_1.Patch)('change-password'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getMe", null);
__decorate([
    (0, common_1.Get)('password-resets'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getPasswordResets", null);
__decorate([
    (0, common_1.Post)('password-resets/:id/resolve'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "resolvePasswordReset", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAdmin", null);
__decorate([
    (0, common_1.Patch)(':id/permissions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updatePermissions", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteAdmin", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map