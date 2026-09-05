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
import { HeroSection } from './entities/hero-section.entity';
import { HeroImage } from './entities/hero-image.entity';
import { UpdateHeroSectionDto } from './dto/update-hero-section.dto';
import { UpdateImageOrderDto } from './dto/update-image-order.dto';
import { UpdateImageActiveDto } from './dto/update-image-active.dto';
import { formatImageUrl } from 'src/shared/utils/utils';

@Injectable()
export class HeroSectionService {
  constructor(
    @InjectRepository(HeroSection)
    private readonly _heroSectionRepo: Repository<HeroSection>,
    @InjectRepository(HeroImage)
    private readonly _heroImageRepo: Repository<HeroImage>,
    private readonly _dataSource: DataSource,
  ) {}

  async getActiveHeroSection() {
    let heroSection = await this._heroSectionRepo.findOne({
      where: { isActive: true },
      relations: ['images'],
    });

    if (!heroSection) {
      heroSection = this._heroSectionRepo.create({
        slogan: 'Welcome to Our Store',
        subSlogan: 'Discover the best products at great prices',
        isActive: true,
        images: [],
      });
      await this._heroSectionRepo.save(heroSection);
    }

    const formattedImages = heroSection.images
      .filter((img) => img.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((img) => ({
        ...img,
        url: formatImageUrl(img.url),
      }));

    return {
      message: 'Hero section retrieved successfully.',
      HttpStatus: HttpStatus.OK,
      data: {
        ...heroSection,
        images: formattedImages,
      },
    };
  }

  async getHeroSectionForAdmin() {
    let heroSection = await this._heroSectionRepo.findOne({
      where: { isActive: true },
      relations: ['images'],
    });

    if (!heroSection) {
      heroSection = this._heroSectionRepo.create({
        slogan: 'Welcome to Our Store',
        subSlogan: 'Discover the best products at great prices',
        isActive: true,
        images: [],
      });
      await this._heroSectionRepo.save(heroSection);
    }

    const formattedImages = heroSection.images.sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );

    return {
      message: 'Hero section retrieved successfully.',
      HttpStatus: HttpStatus.OK,
      data: {
        ...heroSection,
        images: formattedImages,
      },
    };
  }

  async updateHeroSection(updateHeroSectionDto: UpdateHeroSectionDto) {
    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let heroSection = await queryRunner.manager.findOne(HeroSection, {
        where: { isActive: true },
      });

      if (!heroSection) {
        heroSection = queryRunner.manager.create(HeroSection, {
          slogan: updateHeroSectionDto.slogan || 'Welcome to Our Store',
          subSlogan:
            updateHeroSectionDto.subSlogan ||
            'Discover the best products at great prices',
          isActive: true,
        });
      } else {
        Object.assign(heroSection, updateHeroSectionDto);
      }

      await queryRunner.manager.save(heroSection);
      await queryRunner.commitTransaction();

      return {
        message: 'Hero section updated successfully.',
        HttpStatus: HttpStatus.OK,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to update hero section.');
    } finally {
      await queryRunner.release();
    }
  }

  async addImage(file: Express.Multer.File) {
    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let heroSection = await queryRunner.manager.findOne(HeroSection, {
        where: { isActive: true },
        relations: ['images'],
      });

      if (!heroSection) {
        heroSection = queryRunner.manager.create(HeroSection, {
          slogan: 'Welcome to Our Store',
          subSlogan: 'Discover the best products at great prices',
          isActive: true,
          images: [],
        });
        await queryRunner.manager.save(heroSection);
      }

      const maxOrder = heroSection.images.length;
      const imageUrl = `/uploads/${file.filename}`;

      const heroImage = queryRunner.manager.create(HeroImage, {
        url: imageUrl,
        alt: file.originalname,
        displayOrder: maxOrder,
        isActive: true,
        heroSection,
      });

      await queryRunner.manager.save(heroImage);
      await queryRunner.commitTransaction();

      return {
        message: 'Image added to hero section successfully.',
        HttpStatus: HttpStatus.CREATED,
        data: {
          ...heroImage,
          url: formatImageUrl(heroImage.url),
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to add image.');
    } finally {
      await queryRunner.release();
    }
  }

  async removeImage(id: string) {
    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const heroImage = await queryRunner.manager.findOne(HeroImage, {
        where: { id },
        relations: ['heroSection'],
      });

      if (!heroImage) {
        throw new NotFoundException(`Hero image with ID "${id}" not found.`);
      }

      const filePath = join(__dirname, '..', '..', heroImage.url);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }

      await queryRunner.manager.remove(heroImage);

      const remainingImages = await queryRunner.manager.find(HeroImage, {
        where: { heroSection: { id: heroImage.heroSection.id } },
        order: { displayOrder: 'ASC' },
      });

      for (let i = 0; i < remainingImages.length; i++) {
        remainingImages[i].displayOrder = i;
        await queryRunner.manager.save(remainingImages[i]);
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Image removed from hero section successfully.',
        HttpStatus: HttpStatus.OK,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove image.');
    } finally {
      await queryRunner.release();
    }
  }

  async updateImageOrder(id: string, updateImageOrderDto: UpdateImageOrderDto) {
    const heroImage = await this._heroImageRepo.findOne({
      where: { id },
      relations: ['heroSection'],
    });

    if (!heroImage) {
      throw new NotFoundException(`Hero image with ID "${id}" not found.`);
    }

    heroImage.displayOrder = updateImageOrderDto.displayOrder;
    await this._heroImageRepo.save(heroImage);

    return {
      message: 'Image order updated successfully.',
      HttpStatus: HttpStatus.OK,
    };
  }

  async updateImageActive(
    id: string,
    updateImageActiveDto: UpdateImageActiveDto,
  ) {
    const heroImage = await this._heroImageRepo.findOne({
      where: { id },
    });

    if (!heroImage) {
      throw new NotFoundException(`Hero image with ID "${id}" not found.`);
    }

    heroImage.isActive = updateImageActiveDto.isActive;
    await this._heroImageRepo.save(heroImage);

    return {
      message: 'Image active status updated successfully.',
      HttpStatus: HttpStatus.OK,
    };
  }
}
