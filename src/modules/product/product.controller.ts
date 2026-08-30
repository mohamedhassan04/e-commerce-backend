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
import { UpdateProductDto } from './dto/update-product.dto';
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
  //@desc Get all products
  //@Path: /all
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Products retrieved successfully.',
  })
  @Get('all')
  findAll(@Query() query: ProductQueryDto) {
    return this.productService.findAllProducts(query);
  }

  //@Method GET
  //@desc Get a product by id
  //@Path: /product/:id
  @ApiOperation({ summary: 'Get a product by id' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  //@Method PATCH
  //@desc Update a product
  //@Path: /product/:id
  @ApiOperation({ summary: 'Update a product' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  //@Method DELETE
  //@desc Delete a product
  //@Path: /product/:id
  @ApiOperation({ summary: 'Delete a product' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
