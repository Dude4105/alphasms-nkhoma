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

@UseGuards(AuthGuard('jwt'))
@Controller('hostels')
export class HostelsController {
  constructor(private readonly hostelsService: HostelsService) {}

  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.hostelsService.findAll(query);
  }

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.hostelsService.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hostelsService.remove(+id);
  }
}
