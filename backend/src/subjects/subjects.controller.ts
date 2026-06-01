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
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() body: any) {
    return this.subjectsService.create(body);
  }

  @Roles(Role.ADMIN)
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

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(+id);
  }
}
