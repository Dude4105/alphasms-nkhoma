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

@UseGuards(AuthGuard('jwt'))
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

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


  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.classesService.update(id, body);
  }

  @Get(':id/used-subjects')
  getUsedSubjects(@Param('id') id: string) {
    return this.classesService.getUsedSubjects(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.classesService.remove(id);
  }
}
