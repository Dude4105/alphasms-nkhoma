import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  Param,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('overview')
  getOverview(
    @Query('term') term?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    return this.financeService.getOverview(
      term ? parseInt(term) : undefined,
      academicYear,
    );
  }

  @Get('test')
  test() {
    return { message: 'Finance controller is working' };
  }

  @Get('reports')
  getReports() {
    return this.financeService.getReports();
  }

  @Get('teachers')
  getTeachers() {
    return this.financeService.getTeachers();
  }

  @Get('fee-structure')
  getFeeStructure() {
    return this.financeService.getFeeStructure();
  }

  @Post('fee-structure')
  updateFeeStructure(@Body() data: any) {
    return this.financeService.updateFeeStructure(data);
  }

  @Get('payments')
  getPayments(@Query() query: PaginationDto) {
    return this.financeService.getPayments(query);
  }

  @Post('payments')
  recordPayment(@Body() data: any) {
    return this.financeService.recordPayment(data);
  }

  @Get('students')
  searchStudents(@Query('q') query: string) {
    return this.financeService.searchStudents(query || '');
  }

  @Get('student-fees')
  getStudentFees() {
    return this.financeService.getStudentFees();
  }

  @Get('student-account/:studentId')
  getStudentAccount(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.financeService.getStudentAccount(studentId);
  }

  // --- Expenses Management ---

  @Get('expenses')
  getExpenses(@Query() query: PaginationDto) {
    return this.financeService.getExpenses(query);
  }

  @Post('expenses')
  @UseInterceptors(
    FileInterceptor('attachment', {
      storage: diskStorage({
        destination: './uploads/finance',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 512000 }, // 500kb
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype.match(
            /\/(jpg|jpeg|png|pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document)$/,
          )
        ) {
          cb(null, true);
        } else {
          cb(new Error('Unsupported file type'), false);
        }
      },
    }),
  )
  recordExpense(@Body() data: any, @UploadedFile() file: Express.Multer.File) {
    return this.financeService.recordExpense(data, file);
  }

  @Patch('expenses/:id')
  @UseInterceptors(
    FileInterceptor('attachment', {
      storage: diskStorage({
        destination: './uploads/finance',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 512000 },
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype.match(
            /\/(jpg|jpeg|png|pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document)$/,
          )
        ) {
          cb(null, true);
        } else {
          cb(new Error('Unsupported file type'), false);
        }
      },
    }),
  )
  updateExpense(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.financeService.updateExpense(id, data, file);
  }
}
