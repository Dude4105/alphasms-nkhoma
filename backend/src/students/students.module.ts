import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { PublicResultsController } from './public-results.controller';
import { StudentsService } from './students.service';

@Module({
  controllers: [StudentsController, PublicResultsController],
  providers: [StudentsService],
})
export class StudentsModule {}
