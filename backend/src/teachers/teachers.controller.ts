import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Patch,
  Delete,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  // Teacher Profile & Security (Prioritized at the top)
  @Roles(Role.TEACHER, Role.ADMIN)
  @Patch('me/change-password')
  changePassword(@Req() req: any, @Body() body: any) {
    console.log(
      '[TeachersController] Password change request received for userId:',
      req.user.userId,
    );
    return this.teachersService.changePassword(req.user.userId, body);
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Get('grades/config')
  getGradeConfig(
    @Query('classId') classId: string,
    @Query('subjectKey') subjectKey: string,
    @Query('term') term: string,
    @Query('academicYear') academicYear: string,
  ) {
    const termNum = parseInt(term.replace('term', '')) || 1;
    return this.teachersService.getGradeConfig(
      classId,
      subjectKey,
      termNum,
      academicYear,
    );
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Post('grades/config')
  saveGradeConfig(@Req() req: any, @Body() body: any) {
    return this.teachersService.saveGradeConfig(req.user.userId, body);
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Get('grades/entries')
  getGradeEntries(
    @Query('classId') classId: string,
    @Query('subjectKey') subjectKey: string,
    @Query('term') term: string,
    @Query('academicYear') academicYear: string,
  ) {
    const termNum = parseInt(term.replace('term', '')) || 1;
    return this.teachersService.getGradeEntries(
      classId,
      subjectKey,
      termNum,
      academicYear,
    );
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Post('grades/entries/bulk')
  bulkSaveGrades(@Req() req: any, @Body() body: any) {
    return this.teachersService.bulkSaveGrades(req.user.userId, body);
  }

  // Teacher Profile & Dashboard
  @Roles(Role.TEACHER, Role.ADMIN)
  @Get('me/profile')
  getProfile(@Req() req: any) {
    return this.teachersService.getProfile(req.user.userId);
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Get('me/dashboard')
  getDashboard(@Req() req: any) {
    return this.teachersService.getDashboardData(req.user.userId);
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Get('me/classes')
  getMyClasses(@Req() req: any) {
    return this.teachersService.getMyClasses(req.user.userId);
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Get('me/main-class')
  getMyMainClass(@Req() req: any) {
    return this.teachersService.getMainClass(req.user.userId);
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Get('me/main-class/results')
  getMainClassResults(
    @Req() req: any,
    @Query('term') term?: string,
    @Query('academicYear') year?: string,
  ) {
    return this.teachersService.getMainClassResults(
      req.user.userId,
      term ? parseInt(term) : undefined,
      year,
    );
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Get('classes/:classId/in-term-results')
  async getInTermResults(
    @Req() req: any,
    @Param('classId') classId: string,
    @Query('term') term?: string,
    @Query('academicYear') year?: string,
  ) {
    if (!term || !year) {
      return this.teachersService.getInTermResultsWithActiveContext(
        req.user.userId,
        classId,
        term ? parseInt(term) : undefined,
        year,
      );
    }
    const termNum = parseInt(term);
    return this.teachersService.getInTermResults(
      req.user.userId,
      classId,
      termNum,
      year,
    );
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Get('classes/:classId/subjects/:subjectKey/results')
  getSubjectResults(
    @Req() req: any,
    @Param('classId') classId: string,
    @Param('subjectKey') subjectKey: string,
    @Query('term') term?: string,
    @Query('academicYear') year?: string,
  ) {
    const termNum = term ? parseInt(term) : 1;
    return this.teachersService.getSubjectResults(
      req.user.userId,
      classId,
      subjectKey,
      termNum,
      year,
    );
  }

  @Roles(Role.ADMIN)
  @Post('classes/:classId/migrate')
  migrateClass(
    @Req() req: any,
    @Param('classId') classId: string,
    @Body() body: { targetClassId: string; promotions: { studentId: string; action: 'migrate' | 'repeat' }[] },
  ) {
    return this.teachersService.migrateClass(
      req.user.userId,
      classId,
      body.targetClassId,
      body.promotions,
    );
  }

  @Roles(Role.ADMIN)
  @Delete('students/:studentId')
  unenrollStudent(@Param('studentId') studentId: string) {
    return this.teachersService.unenrollStudent(studentId);
  }

  @Roles(Role.ADMIN)
  @Delete('staff/:teacherId')
  unenrollStaff(@Param('teacherId') teacherId: string) {
    return this.teachersService.unenrollStaff(teacherId);
  }

  // Standard CRUD (Must be BELOW specific routes)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() body: any) {
    return this.teachersService.create(body);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.teachersService.findAll(query);
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.teachersService.update(id, body);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teachersService.remove(id);
  }
}
