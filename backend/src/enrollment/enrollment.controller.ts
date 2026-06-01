import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post('apply')
  submit(@Body() body: any) {
    return this.enrollmentService.submit(body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Get('applications')
  findAll() {
    return this.enrollmentService.findAll();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('applications/:id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.enrollmentService.updateStatus(Number(id), status);
  }
}
