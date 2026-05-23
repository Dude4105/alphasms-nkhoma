import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentService {
  constructor(private prisma: PrismaService) {}

  async submit(data: any) {
    return this.prisma.application.create({
      data: {
        firstName: data.firstName,
        surname: data.surname,
        gender: data.gender,
        targetClass: data.targetClass,
        boardingStatus: data.boardingStatus,
        previousSchool: data.previousSchool,
        dob: data.dob,
        guardianTitle: data.guardianTitle,
        guardianName: data.guardianName,
        guardianRelation: data.guardianRelation,
        guardianAddress: data.guardianAddress,
        whatsapp: data.whatsapp,
        phone: data.phone,
        email: data.email,
        status: 'PENDING',
      },
    });
  }

  async findAll() {
    return this.prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: number, status: string) {
    return this.prisma.application.update({
      where: { id },
      data: { status },
    });
  }
}
