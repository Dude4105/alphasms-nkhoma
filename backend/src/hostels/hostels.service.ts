import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class HostelsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = query.search
      ? {
          OR: [
            { name: { contains: query.search } },
            { hostel_id: { contains: query.search } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.hostel.findMany({
        where,
        skip,
        take: limit,
        include: {
          owner: {
            select: {
              user: {
                select: {
                  email: true,
                  role: true,
                },
              },
            },
          },
          _count: {
            select: { students: true },
          },
        },
      }),
      this.prisma.hostel.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        limit,
      },
    };
  }

  async findOne(id: number) {
    return this.prisma.hostel.findUnique({
      where: { id },
      include: {
        students: {
          select: {
            id: true,
            student_id: true,
            firstName: true,
            lastName: true,
          },
        },
        owner: {
          select: {
            user: {
              select: {
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  async getStats() {
    const totalCapacityResult = await this.prisma.hostel.aggregate({
      _sum: { capacity: true },
    });

    const currentlyBoarding = await this.prisma.student.count({
      where: {
        hostelId: { not: null },
      },
    });

    const totalCapacity = totalCapacityResult._sum.capacity || 0;
    const occupancyRate = totalCapacity
      ? Math.round((currentlyBoarding / totalCapacity) * 100)
      : 0;

    return {
      totalCapacity,
      currentlyBoarding,
      occupancyRate: `${occupancyRate}%`,
      maintenanceRooms: 0, // Placeholder
    };
  }

  async create(data: any) {
    const hostel_id = `HOS-${Math.floor(100 + Math.random() * 900)}`;

    return this.prisma.hostel.create({
      data: {
        hostel_id,
        name: data.name,
        type: data.type,
        capacity: Number(data.capacity),
        warden: data.warden,
        ownerId: 1, // Default owner
      },
    });
  }

  async update(id: number, data: any) {
    const hostel = await this.prisma.hostel.findUnique({ where: { id } });
    if (!hostel) {
      throw new NotFoundException(`Hostel with ID ${id} not found`);
    }

    return this.prisma.hostel.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        capacity: data.capacity !== undefined ? Number(data.capacity) : undefined,
        warden: data.warden,
      },
    });
  }

  async remove(id: number) {
    const hostel = await this.prisma.hostel.findUnique({ where: { id } });
    if (!hostel) {
      throw new NotFoundException(`Hostel with ID ${id} not found`);
    }

    return this.prisma.hostel.delete({
      where: { id },
    });
  }
}
