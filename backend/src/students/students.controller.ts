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
import { StudentsService } from './students.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() body: any) {
    return this.studentsService.create(body);
  }

  @Roles(Role.ADMIN, Role.TEACHER)
  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.studentsService.findAll(query);
  }

  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @Get(':id')
  async findOne(
    @Req() req: any,
    @Param('id') id: string,
    @Query('term') term?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    await this.studentsService.authorizeStudentAccess(req.user, id);
    const parsedTerm = term ? parseInt(term) : undefined;
    return this.studentsService.findOne(id, parsedTerm, academicYear);
  }

  @Roles(Role.ADMIN, Role.TEACHER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.studentsService.update(id, body);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
