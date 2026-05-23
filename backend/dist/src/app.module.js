"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const students_module_1 = require("./students/students.module");
const classes_module_1 = require("./classes/classes.module");
const hostels_module_1 = require("./hostels/hostels.module");
const teachers_module_1 = require("./teachers/teachers.module");
const subjects_module_1 = require("./subjects/subjects.module");
const enrollment_module_1 = require("./enrollment/enrollment.module");
const admin_module_1 = require("./admin/admin.module");
const finance_module_1 = require("./finance/finance.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const feeds_module_1 = require("./feeds/feeds.module");
const gallery_module_1 = require("./gallery/gallery.module");
const attendance_module_1 = require("./attendance/attendance.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            students_module_1.StudentsModule,
            classes_module_1.ClassesModule,
            hostels_module_1.HostelsModule,
            teachers_module_1.TeachersModule,
            subjects_module_1.SubjectsModule,
            enrollment_module_1.EnrollmentModule,
            admin_module_1.AdminModule,
            finance_module_1.FinanceModule,
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'uploads'),
                serveRoot: '/uploads',
            }),
            feeds_module_1.FeedsModule,
            gallery_module_1.GalleryModule,
            attendance_module_1.AttendanceModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map