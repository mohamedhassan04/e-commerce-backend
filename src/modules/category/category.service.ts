import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly _categoryRepo: Repository<Category>,
  ) {}

  async createCategory(createCategoryDto: CreateCategoryDto) {
    try {
      const category = this._categoryRepo.create(createCategoryDto);
      await this._categoryRepo.save(category);

      return {
        message: 'Category created successfully.',
        HttpStatus: HttpStatus.CREATED,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create category.');
    }
  }

  async findAllCategories() {
    const categories = await this._categoryRepo.find({
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'Categories retrieved successfully.',
      HttpStatus: HttpStatus.OK,
      data: categories,
    };
  }

  async findOneCategory(id: string) {
    const category = await this._categoryRepo.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }

    return {
      message: 'Category retrieved successfully.',
      HttpStatus: HttpStatus.OK,
      data: category,
    };
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this._categoryRepo.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }

    Object.assign(category, updateCategoryDto);
    await this._categoryRepo.save(category);

    return {
      message: 'Category updated successfully.',
      HttpStatus: HttpStatus.OK,
    };
  }

  async removeCategory(id: string) {
    const category = await this._categoryRepo.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }

    await this._categoryRepo.remove(category);

    return {
      message: 'Category deleted successfully.',
      HttpStatus: HttpStatus.OK,
    };
  }
}
