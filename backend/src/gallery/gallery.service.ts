import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GalleryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.schoolGallery.findMany({
      orderBy: { createdAt: 'desc' },
    });
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
