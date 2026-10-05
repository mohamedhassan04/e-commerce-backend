import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
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
import { CreatePromoSectionDto } from './dto/create-promo-section.dto';
import { UpdatePromoSectionDto } from './dto/update-promo-section.dto';
import { PromoSectionService } from './promo-section.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { multerConfig } from 'src/shared/multer/multer.config';

@ApiTags('Promo Section')
@Controller('promo-section')
export class PromoSectionController {
  constructor(private readonly promoSectionService: PromoSectionService) {}

  //@Method GET
  //@desc Get the active home promo section (public)
  //@Path: /promo-section
  @ApiOperation({ summary: 'Get the active promo section' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Promo section retrieved successfully.',
  })
  @Get()
  getActiveSection() {
    return this.promoSectionService.getActiveSection();
  }

  //@Method GET
  //@desc Get the promo section for admin
  //@Path: /promo-section/admin
  @ApiOperation({ summary: 'Get the promo section for admin' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Promo section retrieved successfully.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin')
  getAdminSection() {
    return this.promoSectionService.getAdminSection();
  }

  //@Method POST
  //@desc Create (or replace) the promo section
  //@Path: /promo-section
  @ApiOperation({ summary: 'Create the promo section' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image'],
      properties: {
        image: { type: 'string', format: 'binary' },
        title: { type: 'string', example: 'Harvest drop — limited batch' },
        text: { type: 'string', example: 'Cold-pressed oils, back for 72 hours only.' },
        buttonText: { type: 'string', example: 'Shop the drop' },
        linkUrl: { type: 'string', example: '/shop' },
        endAt: { type: 'string', example: '2026-12-31T18:00:00.000Z' },
        isActive: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Promo section created successfully.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @Post()
  createSection(
    @Body() createPromoSectionDto: CreatePromoSectionDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.promoSectionService.createSection(createPromoSectionDto, file);
  }

  //@Method PATCH
  //@desc Update the promo section
  //@Path: /promo-section
  @ApiOperation({ summary: 'Update the promo section' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        text: { type: 'string' },
        buttonText: { type: 'string' },
        linkUrl: { type: 'string' },
        endAt: { type: 'string' },
        isActive: { type: 'boolean' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Promo section not found' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Promo section updated successfully.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @Patch()
  updateSection(
    @Body() updatePromoSectionDto: UpdatePromoSectionDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.promoSectionService.updateSection(updatePromoSectionDto, file);
  }

  //@Method DELETE
  //@desc Delete the promo section
  //@Path: /promo-section
  @ApiOperation({ summary: 'Delete the promo section' })
  @ApiNotFoundResponse({ description: 'Promo section not found' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Promo section deleted successfully.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete()
  deleteSection() {
    return this.promoSectionService.deleteSection();
  }
}
