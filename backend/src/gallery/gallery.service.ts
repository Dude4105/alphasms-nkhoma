import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class GalleryService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: PaginationDto) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.schoolGallery.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.schoolGallery.count(),
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
    const item = await this.prisma.schoolGallery.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Gallery item not found');
    return item;
  }

  async create(data: { title?: string; description?: string; imageUrl: string }) {
    return this.prisma.schoolGallery.create({
      data,
    });
  }

  async update(id: number, data: { title?: string; description?: string; imageUrl?: string }) {
    await this.findOne(id);
    return this.prisma.schoolGallery.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.schoolGallery.delete({
      where: { id },
    });
  }
}
