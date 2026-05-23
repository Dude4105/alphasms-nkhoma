import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('feeds')
export class FeedsController {
  constructor(private readonly feedsService: FeedsService) {}

  @Get('public')
  findAllPublic() {
    return this.feedsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAllAdmin() {
    return this.feedsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feedsService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(FilesInterceptor('images', 10, {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        cb(null, `feed-${uniqueSuffix}${ext}`);
      }
    })
  }))
  create(
    @Body() data: { title: string; content: string },
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    const images = files ? files.map(file => `/uploads/${file.filename}`) : [];
    return this.feedsService.create({ ...data, images });
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10, {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        cb(null, `feed-${uniqueSuffix}${ext}`);
      }
    })
  }))
  update(
    @Param('id') id: string,
    @Body() data: { title?: string; content?: string; existingImages?: string | string[] },
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    let images: string[] = [];
    if (data.existingImages) {
      images = Array.isArray(data.existingImages) ? data.existingImages : [data.existingImages];
    }
    if (files && files.length > 0) {
      images = [...images, ...files.map(file => `/uploads/${file.filename}`)];
    }
    return this.feedsService.update(+id, {
      title: data.title,
      content: data.content,
      images: images.length > 0 ? images : undefined
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feedsService.remove(+id);
  }
}
