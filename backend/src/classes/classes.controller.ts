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
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() body: any) {
    return this.classesService.create(body);
  }

  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.classesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.TEACHER)
  @Get(':id/results')
  getClassResults(
    @Param('id') id: string,
    @Query('term') term?: string,
    @Query('academicYear') year?: string,
  ) {
    return this.classesService.getClassResults(
      id,
      term ? parseInt(term) : undefined,
      year,
    );
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.classesService.update(id, body);
  }

  @Get(':id/used-subjects')
  getUsedSubjects(@Param('id') id: string) {
    return this.classesService.getUsedSubjects(id);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.classesService.remove(id);
  }
}
