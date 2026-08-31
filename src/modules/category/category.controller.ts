import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryService } from './category.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  //@Method POST
  //@desc Create a new category
  //@Path: /category
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Category created successfully.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to create category.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.createCategory(createCategoryDto);
  }

  //@Method GET
  //@desc Get all categories
  //@Path: /category/all
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categories retrieved successfully.',
  })
  @Get('all')
  findAll() {
    return this.categoryService.findAllCategories();
  }

  //@Method GET
  //@desc Get a category by id
  //@Path: /category/:id
  @ApiOperation({ summary: 'Get a category by id' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOneCategory(id);
  }

  //@Method PATCH
  //@desc Update a category
  //@Path: /category/:id
  @ApiOperation({ summary: 'Update a category' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(id, updateCategoryDto);
  }

  //@Method DELETE
  //@desc Delete a category
  //@Path: /category/:id
  @ApiOperation({ summary: 'Delete a category' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.removeCategory(id);
  }
}
