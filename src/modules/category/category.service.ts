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
import { ContentTranslationService } from 'src/shared/node/content-translation.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly _categoryRepo: Repository<Category>,
    private readonly _translationService: ContentTranslationService,
  ) {}

  async createCategory(createCategoryDto: CreateCategoryDto) {
    try {
      const { translations, ...fields } = createCategoryDto;
      const category = this._categoryRepo.create(fields);
      const saved = await this._categoryRepo.save(category);
      await this._translationService.save('category', saved.id, translations);

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
    const translated = await this._translationService.attach('category', categories);

    return {
      message: 'Categories retrieved successfully.',
      HttpStatus: HttpStatus.OK,
      data: translated,
    };
  }

  async findOneCategory(id: string) {
    const category = await this._categoryRepo.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }

    const [translated] = await this._translationService.attach('category', [category]);

    return {
      message: 'Category retrieved successfully.',
      HttpStatus: HttpStatus.OK,
      data: translated,
    };
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this._categoryRepo.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }

    const { translations, ...fields } = updateCategoryDto;
    Object.assign(category, fields);
    await this._categoryRepo.save(category);
    await this._translationService.save('category', category.id, translations);

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
    await this._translationService.remove('category', id);

    return {
      message: 'Category deleted successfully.',
      HttpStatus: HttpStatus.OK,
    };
  }
}
