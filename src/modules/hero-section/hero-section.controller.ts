import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateHeroSlideDto } from './dto/create-hero-slide.dto';
import { UpdateHeroSlideDto } from './dto/update-hero-slide.dto';
import { HeroSectionService } from './hero-section.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { multerConfig } from 'src/shared/multer/multer.config';

@ApiTags('Hero Section')
@Controller('hero-section')
export class HeroSectionController {
  constructor(private readonly heroSectionService: HeroSectionService) {}

  //@Method GET
  //@desc Get active hero slides (public)
  //@Path: /hero-section
  @ApiOperation({ summary: 'Get active hero slides' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hero slides retrieved successfully.',
  })
  @Get()
  getActiveSlides() {
    return this.heroSectionService.getActiveSlides();
  }

  //@Method GET
  //@desc Get all hero slides for admin
  //@Path: /hero-section/admin
  @ApiOperation({ summary: 'Get all hero slides for admin' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hero slides retrieved successfully.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin')
  getAllSlides() {
    return this.heroSectionService.getAllSlides();
  }

  //@Method POST
  //@desc Create a new hero slide
  //@Path: /hero-section
  @ApiOperation({ summary: 'Create a new hero slide' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['tag', 'headline1', 'headline2', 'body'],
      properties: {
        image: { type: 'string', format: 'binary' },
        tag: { type: 'string', example: 'Summer harvest · Fresh-pressed' },
        headline1: { type: 'string', example: 'Good things,' },
        headline2: { type: 'string', example: 'made slowly.' },
        body: {
          type: 'string',
          example: 'Early-harvest olive oil, pantry staples...',
        },
        chip1: { type: 'string', example: 'Free shipping over $60' },
        chip2: { type: 'string', example: 'Grower-direct' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Hero slide created successfully.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to create hero slide.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @Post()
  createSlide(
    @Body() createHeroSlideDto: CreateHeroSlideDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.heroSectionService.createSlide(createHeroSlideDto, file);
  }

  //@Method PATCH
  //@desc Update a hero slide
  //@Path: /hero-section/:id
  @ApiOperation({ summary: 'Update a hero slide' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
        tag: { type: 'string' },
        headline1: { type: 'string' },
        headline2: { type: 'string' },
        body: { type: 'string' },
        chip1: { type: 'string' },
        chip2: { type: 'string' },
        displayOrder: { type: 'integer' },
        isActive: { type: 'boolean' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Hero slide not found' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hero slide updated successfully.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @Patch(':id')
  updateSlide(
    @Param('id') id: string,
    @Body() updateHeroSlideDto: UpdateHeroSlideDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.heroSectionService.updateSlide(id, updateHeroSlideDto, file);
  }

  //@Method DELETE
  //@desc Delete a hero slide
  //@Path: /hero-section/:id
  @ApiOperation({ summary: 'Delete a hero slide' })
  @ApiNotFoundResponse({ description: 'Hero slide not found' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hero slide deleted successfully.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  deleteSlide(@Param('id') id: string) {
    return this.heroSectionService.deleteSlide(id);
  }

  //@Method PATCH
  //@desc Update slide display order
  //@Path: /hero-section/:id/order
  @ApiOperation({ summary: 'Update hero slide display order' })
  @ApiNotFoundResponse({ description: 'Hero slide not found' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hero slide order updated successfully.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/order')
  updateSlideOrder(
    @Param('id') id: string,
    @Body('displayOrder') displayOrder: number,
  ) {
    return this.heroSectionService.updateSlideOrder(id, displayOrder);
  }

  //@Method PATCH
  //@desc Update slide active status
  //@Path: /hero-section/:id/active
  @ApiOperation({ summary: 'Update hero slide active status' })
  @ApiNotFoundResponse({ description: 'Hero slide not found' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hero slide active status updated successfully.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/active')
  updateSlideActive(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.heroSectionService.updateSlideActive(id, isActive);
  }
}
