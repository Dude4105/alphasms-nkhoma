import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  create(@Body() body: any) {
    return this.subjectsService.create(body);
  }

  @Post('bulk')
  bulkCreate(@Body() body: { subjects: any[] }) {
    return this.subjectsService.bulkCreate(body.subjects);
  }

  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.subjectsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(+id);
  }
}
