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

@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post('apply')
  submit(@Body() body: any) {
    return this.enrollmentService.submit(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('applications')
  findAll() {
    return this.enrollmentService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('applications/:id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.enrollmentService.updateStatus(Number(id), status);
  }
}
