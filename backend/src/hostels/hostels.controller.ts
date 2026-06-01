import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HostelsService } from './hostels.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('hostels')
export class HostelsController {
  constructor(private readonly hostelsService: HostelsService) {}

  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.hostelsService.findAll(query);
  }

  @Roles(Role.ADMIN, Role.HOSTEL_OWNER)
  @Post()
  create(@Body() body: any) {
    return this.hostelsService.create(body);
  }

  @Get('stats')
  getStats() {
    return this.hostelsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hostelsService.findOne(+id);
  }

  @Roles(Role.ADMIN, Role.HOSTEL_OWNER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.hostelsService.update(+id, body);
  }

  @Roles(Role.ADMIN, Role.HOSTEL_OWNER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hostelsService.remove(+id);
  }
}
