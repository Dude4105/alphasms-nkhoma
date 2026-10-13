import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  Delete,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard-stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('settings')
  getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  updateSettings(@Body() data: Record<string, string>) {
    return this.adminService.updateSettings(data);
  }

  // Year transition: promote passers + advance the year, atomically.
  @Post('academic-year/advance')
  advanceAcademicYear(@Req() req: any) {
    return this.adminService.advanceAcademicYear(req.user.userId);
  }

  @Get('promotion-run')
  getPromotionRun() {
    return this.adminService.getPromotionRun();
  }

  @Get('settings/final-results-mode')
  getFinalResultsMode() {
    return this.adminService.getFinalResultsMode();
  }

  @Patch('settings/final-results-mode')
  toggleFinalResultsMode(@Body() body: { enabled: boolean }) {
    return this.adminService.setFinalResultsMode(body.enabled);
  }

  @Get('settings/exam-results-published')
  getExamResultsPublished() {
    return this.adminService.getExamResultsPublished();
  }

  @Patch('settings/exam-results-published')
  toggleExamResultsPublished(@Body() body: { enabled: boolean }) {
    return this.adminService.setExamResultsPublished(body.enabled);
  }

  @Get('settings/grading-system')
  getGradingSystem() {
    return this.adminService.getGradingSystem();
  }

  @Patch('settings/grading-system')
  updateGradingSystem(@Body() body: any) {
    return this.adminService.updateGradingSystem(body);
  }

  @Post('add-admin')
  addAdmin(
    @Body()
    data: {
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
      permissions?: string[];
    },
  ) {
    return this.adminService.addAdmin(data);
  }

  @Get('list')
  getAdmins() {
    return this.adminService.getAllAdmins();
  }

  @Patch('change-password')
  changePassword(
    @Req() req: any,
    @Body() data: { currentPass: string; newPass: string },
  ) {
    return this.adminService.changePassword(req.user.userId, data);
  }

  @Get('me')
  getMe(@Req() req: any) {
    return this.adminService.getAdminMe(req.user.userId);
  }

  @Get('password-resets')
  getPasswordResets() {
    return this.adminService.getPasswordResets();
  }

  @Post('password-resets/:id/resolve')
  resolvePasswordReset(@Param('id') id: string) {
    return this.adminService.resolvePasswordReset(parseInt(id, 10));
  }

  @Get(':id')
  getAdmin(@Param('id') id: string) {
    if (id === 'list' || id === 'me' || id === 'dashboard-stats' || id === 'settings' || id === 'password-resets' || id === 'add-admin' || id === 'change-password') {
       return null; // Ignore non-numeric ids if they match other routes, though NestJS routing handles this if ordered correctly. But wait, `list` might conflict if not ordered. 
    }
    return this.adminService.getAdminById(parseInt(id, 10));
  }

  @Patch(':id/permissions')
  updatePermissions(
    @Param('id') id: string,
    @Body() body: { permissions: string[] },
  ) {
    return this.adminService.updateAdminPermissions(parseInt(id, 10), body.permissions);
  }

  @Delete(':id')
  deleteAdmin(@Param('id') id: string) {
    if (id === 'list' || id === 'me' || id === 'dashboard-stats' || id === 'settings' || id === 'password-resets' || id === 'add-admin' || id === 'change-password') {
       return null;
    }
    return this.adminService.deleteAdmin(parseInt(id, 10));
  }
}
