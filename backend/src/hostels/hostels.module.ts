import { Module } from '@nestjs/common';
import { HostelsController } from './hostels.controller';
import { HostelsService } from './hostels.service';

@Module({
  controllers: [HostelsController],
  providers: [HostelsService],
})
export class HostelsModule {}
