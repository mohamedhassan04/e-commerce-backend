import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { PromoSection } from './entities/promo-section.entity';
import { CreatePromoSectionDto } from './dto/create-promo-section.dto';
import { UpdatePromoSectionDto } from './dto/update-promo-section.dto';
import { formatImageUrl } from 'src/shared/utils/utils';
import { processHeroImage } from 'src/shared/sharp/image-processing';

@Injectable()
export class PromoSectionService {
  constructor(
    @InjectRepository(PromoSection)
    private readonly _promoRepo: Repository<PromoSection>,
    private readonly _dataSource: DataSource,
  ) {}

  private format(section: PromoSection | null) {
    return section
      ? {
          ...section,
          endAt: section.endAt ? section.endAt.toISOString() : null,
          imageUrl: section.imageUrl ? formatImageUrl(section.imageUrl) : null,
        }
      : null;
  }

  private parseEndAt(value?: string): Date | null | undefined {
    if (value === undefined) return undefined;
    if (value === '') return null;
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
      throw new BadRequestException('Invalid endAt date.');
    }
    return parsed;
  }

  async getActiveSection() {
    const [section] = await this._promoRepo.find({
      where: { isActive: true },
      order: { createdAt: 'ASC' },
      take: 1,
    });

    return {
      message: 'Promo section retrieved successfully.',
      HttpStatus: HttpStatus.OK,
      data: this.format(section ?? null),
    };
  }

  async getAdminSection() {
    const [section] = await this._promoRepo.find({
      order: { createdAt: 'ASC' },
      take: 1,
    });

    return {
      message: 'Promo section retrieved successfully.',
      HttpStatus: HttpStatus.OK,
      data: this.format(section ?? null),
    };
  }

  async createSection(
    createPromoSectionDto: CreatePromoSectionDto,
    file?: Express.Multer.File,
  ) {
    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const rows = await queryRunner.manager.find(PromoSection, {
        order: { createdAt: 'ASC' },
        take: 1,
      });
      const existing = rows[0] ?? null;

      let imageUrl = existing?.imageUrl ?? null;

      if (file) {
        if (existing?.imageUrl) {
          const oldPath = join(process.cwd(), existing.imageUrl);
          if (existsSync(oldPath)) {
            unlinkSync(oldPath);
          }
        }
        await processHeroImage(file.path);
        imageUrl = `/uploads/${file.filename}`;
      }

      let section: PromoSection;

      if (existing) {
        section = existing;
        section.title = createPromoSectionDto.title ?? section.title;
        section.text = createPromoSectionDto.text ?? section.text;
        section.buttonText = createPromoSectionDto.buttonText ?? section.buttonText;
        section.linkUrl = createPromoSectionDto.linkUrl ?? section.linkUrl;
        section.isActive = createPromoSectionDto.isActive ?? section.isActive;
        const endAt = this.parseEndAt(createPromoSectionDto.endAt);
        if (endAt !== undefined) {
          section.endAt = endAt;
        }
        section.imageUrl = imageUrl;
      } else {
        if (!imageUrl) {
          throw new BadRequestException(
            'An image is required to create the promo section.',
          );
        }
        section = queryRunner.manager.create(PromoSection, {
          title: createPromoSectionDto.title ?? null,
          text: createPromoSectionDto.text ?? null,
          buttonText: createPromoSectionDto.buttonText ?? null,
          linkUrl: createPromoSectionDto.linkUrl ?? null,
          endAt: this.parseEndAt(createPromoSectionDto.endAt) ?? null,
          isActive: createPromoSectionDto.isActive ?? true,
          imageUrl,
        });
      }

      await queryRunner.manager.save(PromoSection, section);
      await queryRunner.commitTransaction();

      return {
        message: existing
          ? 'Promo section updated successfully.'
          : 'Promo section created successfully.',
        HttpStatus: existing ? HttpStatus.OK : HttpStatus.CREATED,
        data: this.format(section),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to save promo section.');
    } finally {
      await queryRunner.release();
    }
  }

  async updateSection(
    updatePromoSectionDto: UpdatePromoSectionDto,
    file?: Express.Multer.File,
  ) {
    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const rows = await queryRunner.manager.find(PromoSection, {
        order: { createdAt: 'ASC' },
        take: 1,
      });
      const section = rows[0];

      if (!section) {
        throw new NotFoundException('Promo section not found.');
      }

      if (file) {
        if (section.imageUrl) {
          const oldPath = join(process.cwd(), section.imageUrl);
          if (existsSync(oldPath)) {
            unlinkSync(oldPath);
          }
        }
        await processHeroImage(file.path);
        section.imageUrl = `/uploads/${file.filename}`;
      }

      if (updatePromoSectionDto.title !== undefined) {
        section.title = updatePromoSectionDto.title || null;
      }
      if (updatePromoSectionDto.text !== undefined) {
        section.text = updatePromoSectionDto.text || null;
      }
      if (updatePromoSectionDto.buttonText !== undefined) {
        section.buttonText = updatePromoSectionDto.buttonText || null;
      }
      if (updatePromoSectionDto.linkUrl !== undefined) {
        section.linkUrl = updatePromoSectionDto.linkUrl || null;
      }
      if (updatePromoSectionDto.endAt !== undefined) {
        const endAt = this.parseEndAt(updatePromoSectionDto.endAt);
        section.endAt = endAt ?? null;
      }
      if (updatePromoSectionDto.isActive !== undefined) {
        section.isActive = updatePromoSectionDto.isActive;
      }

      await queryRunner.manager.save(PromoSection, section);
      await queryRunner.commitTransaction();

      return {
        message: 'Promo section updated successfully.',
        HttpStatus: HttpStatus.OK,
        data: this.format(section),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update promo section.');
    } finally {
      await queryRunner.release();
    }
  }

  async deleteSection() {
    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const rows = await queryRunner.manager.find(PromoSection, {
        order: { createdAt: 'ASC' },
        take: 1,
      });
      const section = rows[0];

      if (!section) {
        throw new NotFoundException('Promo section not found.');
      }

      if (section.imageUrl) {
        const filePath = join(process.cwd(), section.imageUrl);
        if (existsSync(filePath)) {
          unlinkSync(filePath);
        }
      }

      await queryRunner.manager.remove(PromoSection, section);
      await queryRunner.commitTransaction();

      return {
        message: 'Promo section deleted successfully.',
        HttpStatus: HttpStatus.OK,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete promo section.');
    } finally {
      await queryRunner.release();
    }
  }
}
