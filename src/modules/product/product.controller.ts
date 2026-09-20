import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProductSwaggerDto } from './dto/create-product.dto';
import { RateProductDto } from './dto/rate-product.dto';
import { UpdateProductSwaggerDto } from './dto/update-product.dto';
import { ProductService } from './product.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { multerConfig } from 'src/shared/multer/multer.config';
import { ProductQueryDto } from 'src/shared/dto/pagination-query.dto';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  //@Method POST
  //@desc Create a new product with variants and images
  //@Path: /product
  @ApiOperation({ summary: 'Create a new product' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateProductSwaggerDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product created successfully.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to create product.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  @Post()
  createProduct(
    @Body() createProductDto: CreateProductSwaggerDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productService.createProduct(createProductDto, files);
  }

  //@Method GET
  //@desc Get active products (public)
  //@Path: /all
  @ApiOperation({ summary: 'Get active products' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Products retrieved successfully.',
  })
  @Get('all')
  findAll(@Query() query: ProductQueryDto) {
    return this.productService.findAllProducts(query);
  }

  //@Method GET
  //@desc Get all products including inactive (admin only)
  //@Path: /admin/all
  @ApiOperation({ summary: 'Get all products (admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Products retrieved successfully.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/all')
  findAllAdmin(@Query() query: ProductQueryDto) {
    return this.productService.findAllProductsAdmin(query);
  }

  //@Method GET
  //@desc Get popular products (rating 4.0 - 5.0)
  //@Path: /product/popular
  @ApiOperation({ summary: 'Get popular products (rating 4.0 - 5.0)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Popular products retrieved successfully.',
  })
  @Get('popular')
  findPopularProducts() {
    return this.productService.findPopularProducts();
  }

  //@Method PATCH
  //@desc Rate a product
  //@Path: /product/:id/rating
  @ApiOperation({ summary: 'Rate a product' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product rated successfully.',
  })
  // @UseGuards(JwtAuthGuard)
  @Patch(':id/rating')
  rateProduct(@Param('id') id: string, @Body() rateProductDto: RateProductDto) {
    return this.productService.rateProduct(id, rateProductDto);
  }

  //@Method PATCH
  //@desc Update a product (admin only)
  //@Path: /product/:id
  @ApiOperation({ summary: 'Update a product' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateProductSwaggerDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product updated successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to update product.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  @Patch(':id')
  updateProduct(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const removeImages = body.removeImages
      ? JSON.parse(body.removeImages)
      : undefined;
    const primaryImageId = body.primaryImageId || undefined;
    const primaryNewImage = body.primaryNewImage === 'true';

    const updateDto = {
      name: body.name,
      description: body.description || undefined,
      isActive:
        body.isActive === 'true' || body.isActive === true ? true : body.isActive === 'false' || body.isActive === false ? false : undefined,
      categoryId: body.categoryId || undefined,
      variants: body.variants ? JSON.parse(body.variants) : undefined,
    };

    return this.productService.updateProduct(
      id,
      updateDto,
      files,
      removeImages,
      primaryImageId,
      primaryNewImage,
    );
  }

  //@Method DELETE
  //@desc Delete a product
  //@Path: /product/:id
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product deleted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.removeProduct(id);
  }
}
