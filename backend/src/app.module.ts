import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { ClassesModule } from './classes/classes.module';
import { HostelsModule } from './hostels/hostels.module';
import { TeachersModule } from './teachers/teachers.module';
import { SubjectsModule } from './subjects/subjects.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { AdminModule } from './admin/admin.module';
import { FinanceModule } from './finance/finance.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { FeedsModule } from './feeds/feeds.module';
import { GalleryModule } from './gallery/gallery.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    StudentsModule,
    ClassesModule,
    HostelsModule,
    TeachersModule,
    SubjectsModule,
    EnrollmentModule,
    AdminModule,
    FinanceModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    FeedsModule,
    GalleryModule,
    AttendanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
