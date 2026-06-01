import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';
import { GalleryService } from './gallery.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.galleryService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.galleryService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        cb(null, `gallery-${uniqueSuffix}${ext}`);
      }
    })
  }))
  create(
    @Body() data: { title?: string; description?: string },
    @UploadedFile() file: Express.Multer.File
  ) {
    const imageUrl = file ? `/uploads/${file.filename}` : '';
    return this.galleryService.create({ ...data, imageUrl });
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        cb(null, `gallery-${uniqueSuffix}${ext}`);
      }
    })
  }))
  update(
    @Param('id') id: string,
    @Body() data: { title?: string; description?: string },
    @UploadedFile() file: Express.Multer.File
  ) {
    const updateData: any = { ...data };
    if (file) {
      updateData.imageUrl = `/uploads/${file.filename}`;
    }
    return this.galleryService.update(+id, updateData);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.galleryService.remove(+id);
  }
}
