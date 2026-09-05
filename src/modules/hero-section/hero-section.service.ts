import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { HeroSlide } from './entities/hero-slide.entity';
import { CreateHeroSlideDto } from './dto/create-hero-slide.dto';
import { UpdateHeroSlideDto } from './dto/update-hero-slide.dto';
import { formatImageUrl } from 'src/shared/utils/utils';

@Injectable()
export class HeroSectionService {
  constructor(
    @InjectRepository(HeroSlide)
    private readonly _heroSlideRepo: Repository<HeroSlide>,
    private readonly _dataSource: DataSource,
  ) {}

  async getActiveSlides() {
    const slides = await this._heroSlideRepo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });

    const formatted = slides.map((s) => ({
      ...s,
      imageUrl: s.imageUrl ? formatImageUrl(s.imageUrl) : null,
    }));

    return {
      message: 'Hero slides retrieved successfully.',
      HttpStatus: HttpStatus.OK,
      data: formatted,
    };
  }

  async getAllSlides() {
    const slides = await this._heroSlideRepo.find({
      order: { displayOrder: 'ASC' },
    });

    const formatted = slides.map((s) => ({
      ...s,
      imageUrl: s.imageUrl ? formatImageUrl(s.imageUrl) : null,
    }));

    return {
      message: 'Hero slides retrieved successfully.',
      HttpStatus: HttpStatus.OK,
      data: formatted,
    };
  }

  async createSlide(
    createHeroSlideDto: CreateHeroSlideDto,
    file?: Express.Multer.File,
  ) {
    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const count = await queryRunner.manager.count(HeroSlide);
      const imageUrl = file ? `/uploads/${file.filename}` : null;

      const slide = queryRunner.manager.create(HeroSlide, {
        ...createHeroSlideDto,
        imageUrl,
        displayOrder: count,
        isActive: true,
      });

      await queryRunner.manager.save(slide);
      await queryRunner.commitTransaction();

      return {
        message: 'Hero slide created successfully.',
        HttpStatus: HttpStatus.CREATED,
        data: {
          ...slide,
          imageUrl: slide.imageUrl ? formatImageUrl(slide.imageUrl) : null,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to create hero slide.');
    } finally {
      await queryRunner.release();
    }
  }

  async updateSlide(
    id: string,
    updateHeroSlideDto: UpdateHeroSlideDto,
    file?: Express.Multer.File,
  ) {
    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const slide = await queryRunner.manager.findOne(HeroSlide, {
        where: { id },
      });

      if (!slide) {
        throw new NotFoundException(`Hero slide with ID "${id}" not found.`);
      }

      if (file) {
        if (slide.imageUrl) {
          const oldPath = join(__dirname, '..', '..', slide.imageUrl);
          if (existsSync(oldPath)) {
            unlinkSync(oldPath);
          }
        }
        slide.imageUrl = `/uploads/${file.filename}`;
      }

      Object.assign(slide, updateHeroSlideDto);
      await queryRunner.manager.save(slide);
      await queryRunner.commitTransaction();

      return {
        message: 'Hero slide updated successfully.',
        HttpStatus: HttpStatus.OK,
        data: {
          ...slide,
          imageUrl: slide.imageUrl ? formatImageUrl(slide.imageUrl) : null,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update hero slide.');
    } finally {
      await queryRunner.release();
    }
  }

  async deleteSlide(id: string) {
    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const slide = await queryRunner.manager.findOne(HeroSlide, {
        where: { id },
      });

      if (!slide) {
        throw new NotFoundException(`Hero slide with ID "${id}" not found.`);
      }

      if (slide.imageUrl) {
        const filePath = join(__dirname, '..', '..', slide.imageUrl);
        if (existsSync(filePath)) {
          unlinkSync(filePath);
        }
      }

      await queryRunner.manager.remove(slide);

      const remaining = await queryRunner.manager.find(HeroSlide, {
        order: { displayOrder: 'ASC' },
      });

      for (let i = 0; i < remaining.length; i++) {
        remaining[i].displayOrder = i;
        await queryRunner.manager.save(remaining[i]);
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Hero slide deleted successfully.',
        HttpStatus: HttpStatus.OK,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete hero slide.');
    } finally {
      await queryRunner.release();
    }
  }

  async updateSlideOrder(id: string, displayOrder: number) {
    const slide = await this._heroSlideRepo.findOne({ where: { id } });

    if (!slide) {
      throw new NotFoundException(`Hero slide with ID "${id}" not found.`);
    }

    slide.displayOrder = displayOrder;
    await this._heroSlideRepo.save(slide);

    return {
      message: 'Hero slide order updated successfully.',
      HttpStatus: HttpStatus.OK,
    };
  }

  async updateSlideActive(id: string, isActive: boolean) {
    const slide = await this._heroSlideRepo.findOne({ where: { id } });

    if (!slide) {
      throw new NotFoundException(`Hero slide with ID "${id}" not found.`);
    }

    slide.isActive = isActive;
    await this._heroSlideRepo.save(slide);

    return {
      message: 'Hero slide active status updated successfully.',
      HttpStatus: HttpStatus.OK,
    };
  }
}
