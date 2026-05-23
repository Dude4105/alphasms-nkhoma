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
import { StudentsService } from './students.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body() body: any) {
    return this.studentsService.create(body);
  }

  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.studentsService.findAll(query);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('term') term?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    const parsedTerm = term ? parseInt(term) : undefined;
    return this.studentsService.findOne(id, parsedTerm, academicYear);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.studentsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
