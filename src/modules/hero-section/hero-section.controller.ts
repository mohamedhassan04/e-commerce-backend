import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Put,
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
import { UpdateHeroSectionDto } from './dto/update-hero-section.dto';
import { UpdateImageOrderDto } from './dto/update-image-order.dto';
import { UpdateImageActiveDto } from './dto/update-image-active.dto';
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
  //@desc Get active hero section (public)
  //@Path: /hero-section
  @ApiOperation({ summary: 'Get active hero section' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hero section retrieved successfully.',
  })
  @Get()
  getActiveHeroSection() {
    return this.heroSectionService.getActiveHeroSection();
  }

  //@Method GET
  //@desc Get hero section for admin (includes all images)
  //@Path: /hero-section/admin
  @ApiOperation({ summary: 'Get hero section for admin' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hero section retrieved successfully.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin')
  getHeroSectionForAdmin() {
    return this.heroSectionService.getHeroSectionForAdmin();
  }

  //@Method PUT
  //@desc Update hero section slogan and sub slogan
  //@Path: /hero-section
  @ApiOperation({ summary: 'Update hero section' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hero section updated successfully.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to update hero section.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put()
  updateHeroSection(@Body() updateHeroSectionDto: UpdateHeroSectionDto) {
    return this.heroSectionService.updateHeroSection(updateHeroSectionDto);
  }

  //@Method POST
  //@desc Add image to hero section carousel
  //@Path: /hero-section/image
  @ApiOperation({ summary: 'Add image to hero section carousel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Image added to hero section successfully.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to add image.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @Post('image')
  addImage(@UploadedFile() file: Express.Multer.File) {
    return this.heroSectionService.addImage(file);
  }

  //@Method DELETE
  //@desc Remove image from hero section
  //@Path: /hero-section/image/:id
  @ApiOperation({ summary: 'Remove image from hero section' })
  @ApiNotFoundResponse({ description: 'Hero image not found' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Image removed from hero section successfully.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('image/:id')
  removeImage(@Param('id') id: string) {
    return this.heroSectionService.removeImage(id);
  }

  //@Method PATCH
  //@desc Update image display order
  //@Path: /hero-section/image/:id/order
  @ApiOperation({ summary: 'Update image display order' })
  @ApiNotFoundResponse({ description: 'Hero image not found' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Image order updated successfully.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('image/:id/order')
  updateImageOrder(
    @Param('id') id: string,
    @Body() updateImageOrderDto: UpdateImageOrderDto,
  ) {
    return this.heroSectionService.updateImageOrder(id, updateImageOrderDto);
  }

  //@Method PATCH
  //@desc Update image active status
  //@Path: /hero-section/image/:id/active
  @ApiOperation({ summary: 'Update image active status' })
  @ApiNotFoundResponse({ description: 'Hero image not found' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Image active status updated successfully.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('image/:id/active')
  updateImageActive(
    @Param('id') id: string,
    @Body() updateImageActiveDto: UpdateImageActiveDto,
  ) {
    return this.heroSectionService.updateImageActive(id, updateImageActiveDto);
  }
}
