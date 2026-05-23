import { Controller, Post, Body, BadRequestException, Get, Param, Query } from '@nestjs/common';
import { StudentsService } from './students.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('public-results')
export class PublicResultsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('report/:id')
  async getPublicReport(
    @Param('id') id: string,
    @Query('term') term?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    const parsedTerm = term ? parseInt(term) : undefined;
    return this.studentsService.findOne(id, parsedTerm, academicYear);
  }

  @Get('status')
  async getStatus() {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'examResultsPublished' },
    });
    return { published: setting?.value === 'true' };
  }

  @Get('info')
  async getInfo() {
    const keys = ['schoolName', 'schoolCampus', 'schoolAddress', 'schoolPhone', 'schoolEmail'];
    const settings = await this.prisma.systemSetting.findMany({
      where: { key: { in: keys } }
    });
    return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
  }

  @Post('check')
  async checkResults(@Body() body: { firstName: string; lastName: string; dob: string }) {
    const { firstName, lastName, dob } = body;

    if (!firstName || !lastName || !dob) {
      throw new BadRequestException('Missing student details');
    }

    // 1. Check if results are published
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

    // 2. Find student and get results
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
}
