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

@UseGuards(AuthGuard('jwt'))
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  // Teacher Profile & Security (Prioritized at the top)
  @Patch('me/change-password')
  changePassword(@Req() req: any, @Body() body: any) {
    console.log(
      '[TeachersController] Password change request received for userId:',
      req.user.userId,
    );
    return this.teachersService.changePassword(req.user.userId, body);
  }

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

  @Post('grades/config')
  saveGradeConfig(@Req() req: any, @Body() body: any) {
    return this.teachersService.saveGradeConfig(req.user.userId, body);
  }

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

  @Post('grades/entries/bulk')
  bulkSaveGrades(@Req() req: any, @Body() body: any) {
    return this.teachersService.bulkSaveGrades(req.user.userId, body);
  }

  // Teacher Profile & Dashboard
  @Get('me/profile')
  getProfile(@Req() req: any) {
    return this.teachersService.getProfile(req.user.userId);
  }

  @Get('me/dashboard')
  getDashboard(@Req() req: any) {
    return this.teachersService.getDashboardData(req.user.userId);
  }

  @Get('me/classes')
  getMyClasses(@Req() req: any) {
    return this.teachersService.getMyClasses(req.user.userId);
  }

  @Get('me/main-class')
  getMyMainClass(@Req() req: any) {
    return this.teachersService.getMainClass(req.user.userId);
  }

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

  @Get('classes/:classId/in-term-results')
  async getInTermResults(
    @Req() req: any,
    @Param('classId') classId: string,
    @Query('term') term?: string,
    @Query('academicYear') year?: string,
  ) {
    // If no term/year provided, read from SystemSetting
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

  @Delete('students/:studentId')
  unenrollStudent(@Param('studentId') studentId: string) {
    return this.teachersService.unenrollStudent(studentId);
  }

  @Delete('staff/:teacherId')
  unenrollStaff(@Param('teacherId') teacherId: string) {
    return this.teachersService.unenrollStaff(teacherId);
  }

  // Standard CRUD (Must be BELOW specific routes)
  @Post()
  create(@Body() body: any) {
    return this.teachersService.create(body);
  }

  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.teachersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.teachersService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teachersService.remove(id);
  }
}
