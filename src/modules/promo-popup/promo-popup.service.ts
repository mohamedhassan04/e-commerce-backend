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
import { PromoPopup } from './entities/promo-popup.entity';
import { CreatePromoPopupDto } from './dto/create-promo-popup.dto';
import { UpdatePromoPopupDto } from './dto/update-promo-popup.dto';
import { formatImageUrl } from 'src/shared/utils/utils';
import { processHeroImage } from 'src/shared/sharp/image-processing';

@Injectable()
export class PromoPopupService {
  constructor(
    @InjectRepository(PromoPopup)
    private readonly _promoRepo: Repository<PromoPopup>,
    private readonly _dataSource: DataSource,
  ) {}

  private format(promo: PromoPopup | null) {
    return promo
      ? {
          ...promo,
          imageUrl: promo.imageUrl ? formatImageUrl(promo.imageUrl) : null,
        }
      : null;
  }

  async getActivePromo() {
    const promo = await this._promoRepo.findOne({
      where: { isActive: true },
      order: { createdAt: 'ASC' },
    });

    return {
      message: 'Promo popup retrieved successfully.',
      HttpStatus: HttpStatus.OK,
      data: this.format(promo),
    };
  }

  async getAdminPromo() {
    const [promo] = await this._promoRepo.find({
      order: { createdAt: 'ASC' },
      take: 1,
    });

    return {
      message: 'Promo popup retrieved successfully.',
      HttpStatus: HttpStatus.OK,
      data: this.format(promo),
    };
  }

  async createPromo(
    createPromoPopupDto: CreatePromoPopupDto,
    file?: Express.Multer.File,
  ) {
    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingRows = await queryRunner.manager.find(PromoPopup, {
        order: { createdAt: 'ASC' },
        take: 1,
      });
      const existing = existingRows[0] ?? null;

      let promo: PromoPopup;
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

      if (existing) {
        promo = existing;
        promo.title = createPromoPopupDto.title ?? promo.title;
        promo.description =
          createPromoPopupDto.description ?? promo.description;
        promo.linkUrl = createPromoPopupDto.linkUrl ?? promo.linkUrl;
        promo.isActive = createPromoPopupDto.isActive ?? promo.isActive;
        promo.imageUrl = imageUrl;
      } else {
        if (!imageUrl) {
          throw new BadRequestException(
            'An image is required to create a promo popup.',
          );
        }
        promo = queryRunner.manager.create(PromoPopup, {
          title: createPromoPopupDto.title ?? null,
          description: createPromoPopupDto.description ?? null,
          linkUrl: createPromoPopupDto.linkUrl ?? null,
          isActive: createPromoPopupDto.isActive ?? true,
          imageUrl,
        });
      }

      await queryRunner.manager.save(PromoPopup, promo);
      await queryRunner.commitTransaction();

      return {
        message: existing
          ? 'Promo popup updated successfully.'
          : 'Promo popup created successfully.',
        HttpStatus: existing ? HttpStatus.OK : HttpStatus.CREATED,
        data: this.format(promo),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to save promo popup.');
    } finally {
      await queryRunner.release();
    }
  }

  async updatePromo(
    updatePromoPopupDto: UpdatePromoPopupDto,
    file?: Express.Multer.File,
  ) {
    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const promoRows = await queryRunner.manager.find(PromoPopup, {
        order: { createdAt: 'ASC' },
        take: 1,
      });
      const promo = promoRows[0];

      if (!promo) {
        throw new NotFoundException('Promo popup not found.');
      }

      if (file) {
        if (promo.imageUrl) {
          const oldPath = join(process.cwd(), promo.imageUrl);
          if (existsSync(oldPath)) {
            unlinkSync(oldPath);
          }
        }
        await processHeroImage(file.path);
        promo.imageUrl = `/uploads/${file.filename}`;
      }

      if (updatePromoPopupDto.title !== undefined) {
        promo.title = updatePromoPopupDto.title || null;
      }
      if (updatePromoPopupDto.description !== undefined) {
        promo.description = updatePromoPopupDto.description || null;
      }
      if (updatePromoPopupDto.linkUrl !== undefined) {
        promo.linkUrl = updatePromoPopupDto.linkUrl || null;
      }
      if (updatePromoPopupDto.isActive !== undefined) {
        promo.isActive = updatePromoPopupDto.isActive;
      }

      await queryRunner.manager.save(PromoPopup, promo);
      await queryRunner.commitTransaction();

      return {
        message: 'Promo popup updated successfully.',
        HttpStatus: HttpStatus.OK,
        data: this.format(promo),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update promo popup.');
    } finally {
      await queryRunner.release();
    }
  }

  async deletePromo() {
    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const promoRows = await queryRunner.manager.find(PromoPopup, {
        order: { createdAt: 'ASC' },
        take: 1,
      });
      const promo = promoRows[0];

      if (!promo) {
        throw new NotFoundException('Promo popup not found.');
      }

      if (promo.imageUrl) {
        const filePath = join(process.cwd(), promo.imageUrl);
        if (existsSync(filePath)) {
          unlinkSync(filePath);
        }
      }

      await queryRunner.manager.remove(PromoPopup, promo);
      await queryRunner.commitTransaction();

      return {
        message: 'Promo popup deleted successfully.',
        HttpStatus: HttpStatus.OK,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete promo popup.');
    } finally {
      await queryRunner.release();
    }
  }
}
