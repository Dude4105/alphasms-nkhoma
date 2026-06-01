import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class FeedsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: PaginationDto) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.schoolFeed.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.schoolFeed.count(),
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
    const feed = await this.prisma.schoolFeed.findUnique({ where: { id } });
    if (!feed) throw new NotFoundException('Feed not found');
    return feed;
  }

  async create(data: { title: string; content: string; images?: string[] }) {
    return this.prisma.schoolFeed.create({
      data,
    });
  }

  async update(id: number, data: { title?: string; content?: string; images?: string[] }) {
    const feed = await this.prisma.schoolFeed.findUnique({ where: { id } });
    if (!feed) throw new NotFoundException('Feed not found');
    return this.prisma.schoolFeed.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    const feed = await this.prisma.schoolFeed.findUnique({ where: { id } });
    if (!feed) throw new NotFoundException('Feed not found');
    return this.prisma.schoolFeed.delete({
      where: { id },
    });
  }
}
