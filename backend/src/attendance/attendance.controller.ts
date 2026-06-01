import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AttendanceService } from './attendance.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN, Role.TEACHER)
@Controller('teachers/classes')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get(':classId/attendance')
  getAttendance(
    @Param('classId') classId: string,
    @Query('date') date: string,
  ) {
    // If no date provided, default to current local date in YYYY-MM-DD format
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.attendanceService.getAttendanceForClass(classId, targetDate);
  }

  @Post(':classId/attendance')
  saveAttendance(
    @Param('classId') classId: string,
    @Body() payload: { date: string; records: { studentId: string; status: string }[] },
  ) {
    return this.attendanceService.saveAttendanceForClass(classId, payload);
  }
}
