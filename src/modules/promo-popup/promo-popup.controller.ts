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
import { CreatePromoPopupDto } from './dto/create-promo-popup.dto';
import { UpdatePromoPopupDto } from './dto/update-promo-popup.dto';
import { PromoPopupService } from './promo-popup.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { multerConfig } from 'src/shared/multer/multer.config';

@ApiTags('Promo Popup')
@Controller('promo-popup')
export class PromoPopupController {
  constructor(private readonly promoPopupService: PromoPopupService) {}

  //@Method GET
  //@desc Get the active promo popup (public)
  //@Path: /promo-popup
  @ApiOperation({ summary: 'Get the active promo popup' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Promo popup retrieved successfully.',
  })
  @Get()
  getActivePromo() {
    return this.promoPopupService.getActivePromo();
  }

  //@Method GET
  //@desc Get the promo popup for admin
  //@Path: /promo-popup/admin
  @ApiOperation({ summary: 'Get the promo popup for admin' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Promo popup retrieved successfully.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin')
  getAdminPromo() {
    return this.promoPopupService.getAdminPromo();
  }

  //@Method POST
  //@desc Create (or replace) the promo popup
  //@Path: /promo-popup
  @ApiOperation({ summary: 'Create the promo popup' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image'],
      properties: {
        image: { type: 'string', format: 'binary' },
        title: { type: 'string', example: 'Harvest sale — 20% off' },
        description: {
          type: 'string',
          example: 'Enjoy 20% off all olive oils this week.',
        },
        linkUrl: { type: 'string', example: '/shop' },
        isActive: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Promo popup created successfully.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @Post()
  createPromo(
    @Body() createPromoPopupDto: CreatePromoPopupDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.promoPopupService.createPromo(createPromoPopupDto, file);
  }

  //@Method PATCH
  //@desc Update the promo popup
  //@Path: /promo-popup
  @ApiOperation({ summary: 'Update the promo popup' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        description: { type: 'string' },
        linkUrl: { type: 'string' },
        isActive: { type: 'boolean' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Promo popup not found' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Promo popup updated successfully.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @Patch()
  updatePromo(
    @Body() updatePromoPopupDto: UpdatePromoPopupDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.promoPopupService.updatePromo(updatePromoPopupDto, file);
  }

  //@Method DELETE
  //@desc Delete the promo popup
  //@Path: /promo-popup
  @ApiOperation({ summary: 'Delete the promo popup' })
  @ApiNotFoundResponse({ description: 'Promo popup not found' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Promo popup deleted successfully.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete()
  deletePromo() {
    return this.promoPopupService.deletePromo();
  }
}
