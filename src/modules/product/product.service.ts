import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { RateProductDto } from './dto/rate-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductRating } from './entities/product-rating.entity';
import { Category } from 'src/modules/category/entities/category.entity';
import { ProductQueryDto } from 'src/shared/dto/pagination-query.dto';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { formatProductImages } from 'src/shared/utils/utils';
import { processProductImage } from 'src/shared/sharp/image-processing';
import { Users } from '../users/entities/user.entity';

@Injectable()
export class ProductService {
  constructor(
    private readonly _dataSource: DataSource,
    @InjectRepository(Product)
    private readonly _productRepo: Repository<Product>,
    @InjectRepository(ProductRating)
    private readonly _ratingRepo: Repository<ProductRating>,
  ) {}

  async createProduct(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
  ) {
    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // If categoryId is provided, verify the category exists
      let category: Category | null = null;
      if (createProductDto.categoryId) {
        category = await queryRunner.manager.findOne(Category, {
          where: { id: createProductDto.categoryId },
        });
        if (!category) {
          throw new NotFoundException(
            `Category with ID "${createProductDto.categoryId}" not found.`,
          );
        }
      }

      const savedProduct = await queryRunner.manager.save(
        Product,
        queryRunner.manager.create(Product, {
          name: createProductDto.name,
          description: createProductDto.description,
          isActive: createProductDto.isActive ?? true,
          category: category,
        }),
      );

      if (createProductDto.variants?.length) {
        const variants = createProductDto.variants.map((v, index) =>
          queryRunner.manager.create(ProductVariant, {
            size: v.size,
            price: v.price,
            stock: v.stock ?? 0,
            sku: v.sku,
            order: index,
            product: savedProduct,
          }),
        );
        await queryRunner.manager.save(ProductVariant, variants);
      }

      if (files?.length) {
        await Promise.all(files.map((file) => processProductImage(file.path)));

        const images = files.map((file, index) =>
          queryRunner.manager.create(ProductImage, {
            url: `/uploads/${file.filename}`,
            alt: file.originalname,
            isPrimary: index === 0,
            product: savedProduct,
          }),
        );
        await queryRunner.manager.save(ProductImage, images);
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Product created successfully.',
        HttpStatus: HttpStatus.CREATED,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Failed to create product. All changes have been rolled back.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
    files: Express.Multer.File[],
    removeImages?: string[],
    primaryImageId?: string,
    primaryNewImage?: boolean,
  ) {
    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.findOne(Product, {
        where: { id },
        relations: ['variants', 'images'],
      });

      if (!product) {
        throw new NotFoundException(`Product with ID "${id}" not found.`);
      }

      if (updateProductDto.categoryId) {
        const category = await queryRunner.manager.findOne(Category, {
          where: { id: updateProductDto.categoryId },
        });
        if (!category) {
          throw new NotFoundException(
            `Category with ID "${updateProductDto.categoryId}" not found.`,
          );
        }
        product.category = category;
      }

      if (updateProductDto.name !== undefined) {
        product.name = updateProductDto.name;
      }
      if (updateProductDto.description !== undefined) {
        product.description = updateProductDto.description;
      }
      if (updateProductDto.isActive !== undefined) {
        product.isActive = updateProductDto.isActive;
      }

      await queryRunner.manager.save(Product, product);

      if (updateProductDto.variants?.length) {
        const incoming = updateProductDto.variants;
        const existingVariants = [...product.variants];

        const matchedExisting = new Set<string>();
        const matchedIncoming = new Set<number>();

        for (let i = 0; i < incoming.length; i++) {
          const v = incoming[i];
          const match = existingVariants.find(
            (e) =>
              !matchedExisting.has(e.id) &&
              ((e.sku && v.sku && e.sku === v.sku) ||
                (!e.sku && !v.sku && e.size === v.size)),
          );
          if (match) {
            matchedExisting.add(match.id);
            matchedIncoming.add(i);
            match.size = v.size;
            match.price = v.price;
            match.stock = v.stock ?? 0;
            match.sku = v.sku;
            match.order = i;
          }
        }

        const toRemove = existingVariants.filter(
          (e) => !matchedExisting.has(e.id),
        );
        if (toRemove.length) {
          await queryRunner.manager.remove(ProductVariant, toRemove);
        }

        for (let i = 0; i < incoming.length; i++) {
          if (!matchedIncoming.has(i)) {
            const v = incoming[i];
            const variant = queryRunner.manager.create(ProductVariant, {
              size: v.size,
              price: v.price,
              stock: v.stock ?? 0,
              sku: v.sku,
              order: i,
              product: product,
            });
            await queryRunner.manager.save(ProductVariant, variant);
          }
        }

        if (matchedExisting.size > 0) {
          const toUpdate = existingVariants.filter((e) =>
            matchedExisting.has(e.id),
          );
          await queryRunner.manager.save(ProductVariant, toUpdate);
        }
      }

      if (removeImages?.length) {
        const imagesToRemove = product.images.filter((img) =>
          removeImages.includes(img.id),
        );
        if (imagesToRemove.length) {
          for (const image of imagesToRemove) {
            const filePath = join(process.cwd(), image.url);
            if (existsSync(filePath)) {
              unlinkSync(filePath);
            }
          }
          await queryRunner.manager.remove(ProductImage, imagesToRemove);
          product.images = product.images.filter(
            (img) => !removeImages.includes(img.id),
          );
        }
      }

      if (primaryImageId) {
        for (const img of product.images) {
          img.isPrimary = img.id === primaryImageId;
        }
        await queryRunner.manager.save(ProductImage, product.images);
      }

      if (files?.length) {
        if (primaryNewImage) {
          for (const img of product.images) {
            img.isPrimary = false;
          }
          await queryRunner.manager.save(ProductImage, product.images);
        }

        await Promise.all(files.map((file) => processProductImage(file.path)));

        const images = files.map((file, index) =>
          queryRunner.manager.create(ProductImage, {
            url: `/uploads/${file.filename}`,
            alt: file.originalname,
            isPrimary: primaryNewImage && index === 0,
            product: product,
          }),
        );
        await queryRunner.manager.save(ProductImage, images);
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Product updated successfully.',
        HttpStatus: HttpStatus.OK,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update product. All changes have been rolled back.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAllProducts(query: ProductQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const qb = this._productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variant')
      .leftJoinAndSelect('product.images', 'image')
      .leftJoinAndSelect('product.category', 'category')
      .addSelect(
        'COALESCE((SELECT AVG(r.rating) FROM tb_product_ratings r WHERE r.product_id = product.id), 0)',
        '_avg_rating',
      )
      .addSelect(
        'COALESCE((SELECT COUNT(*) FROM tb_product_ratings r WHERE r.product_id = product.id), 0)',
        '_rating_count',
      )
      .andWhere('product.isActive = :isActive', { isActive: true });

    if (query.search) {
      qb.andWhere('product.name ILIKE :search', {
        search: `%${query.search}%`,
      });
    }

    if (query.minPrice) {
      qb.andWhere('variant.price >= :minPrice', {
        minPrice: Number(query.minPrice),
      });
    }

    if (query.maxPrice) {
      qb.andWhere('variant.price <= :maxPrice', {
        maxPrice: Number(query.maxPrice),
      });
    }

    if (query.categoryId) {
      qb.andWhere('category.id = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    const raw = await qb
      .skip(skip)
      .take(limit)
      .orderBy('product.createdAt', 'DESC')
      .addOrderBy('variant.order', 'ASC')
      .getRawAndEntities();

    const countQb = this._productRepo
      .createQueryBuilder('product')
      .leftJoin('product.variants', 'variant')
      .leftJoin('product.category', 'category')
      .andWhere('product.isActive = :isActive', { isActive: true });

    if (query.search) {
      countQb.andWhere('product.name ILIKE :search', {
        search: `%${query.search}%`,
      });
    }
    if (query.minPrice) {
      countQb.andWhere('variant.price >= :minPrice', {
        minPrice: Number(query.minPrice),
      });
    }
    if (query.maxPrice) {
      countQb.andWhere('variant.price <= :maxPrice', {
        maxPrice: Number(query.maxPrice),
      });
    }
    if (query.categoryId) {
      countQb.andWhere('category.id = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    const total = await countQb.getCount();

    const data = raw.entities.map((product, i) => ({
      ...product,
      rating: Number(raw.raw[i]?._avg_rating ?? 0),
      ratingCount: Number(raw.raw[i]?._rating_count ?? 0),
    }));

    const formattedData = formatProductImages(data);

    return {
      message: 'Products retrieved successfully.',
      HttpStatus: HttpStatus.OK,
      data: formattedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllProductsAdmin(query: ProductQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const qb = this._productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variant')
      .leftJoinAndSelect('product.images', 'image')
      .leftJoinAndSelect('product.category', 'category')
      .addSelect(
        'COALESCE((SELECT AVG(r.rating) FROM tb_product_ratings r WHERE r.product_id = product.id), 0)',
        '_avg_rating',
      )
      .addSelect(
        'COALESCE((SELECT COUNT(*) FROM tb_product_ratings r WHERE r.product_id = product.id), 0)',
        '_rating_count',
      );

    if (query.search) {
      qb.andWhere('product.name ILIKE :search', {
        search: `%${query.search}%`,
      });
    }

    if (query.isActive !== undefined) {
      qb.andWhere('product.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    if (query.minPrice) {
      qb.andWhere('variant.price >= :minPrice', {
        minPrice: Number(query.minPrice),
      });
    }

    if (query.maxPrice) {
      qb.andWhere('variant.price <= :maxPrice', {
        maxPrice: Number(query.maxPrice),
      });
    }

    if (query.categoryId) {
      qb.andWhere('category.id = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    const raw = await qb
      .skip(skip)
      .take(limit)
      .orderBy('product.createdAt', 'DESC')
      .addOrderBy('variant.order', 'ASC')
      .getRawAndEntities();

    const countQb = this._productRepo
      .createQueryBuilder('product')
      .leftJoin('product.variants', 'variant')
      .leftJoin('product.category', 'category');

    if (query.search) {
      countQb.andWhere('product.name ILIKE :search', {
        search: `%${query.search}%`,
      });
    }
    if (query.isActive !== undefined) {
      countQb.andWhere('product.isActive = :isActive', {
        isActive: query.isActive,
      });
    }
    if (query.minPrice) {
      countQb.andWhere('variant.price >= :minPrice', {
        minPrice: Number(query.minPrice),
      });
    }
    if (query.maxPrice) {
      countQb.andWhere('variant.price <= :maxPrice', {
        maxPrice: Number(query.maxPrice),
      });
    }
    if (query.categoryId) {
      countQb.andWhere('category.id = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    const total = await countQb.getCount();

    const data = raw.entities.map((product, i) => ({
      ...product,
      rating: Number(raw.raw[i]?._avg_rating ?? 0),
      ratingCount: Number(raw.raw[i]?._rating_count ?? 0),
    }));

    const formattedData = formatProductImages(data);

    return {
      message: 'Products retrieved successfully.',
      HttpStatus: HttpStatus.OK,
      data: formattedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async rateProduct(id: string, rateProductDto: RateProductDto, user: Users) {
    const product = await this._productRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found.`);
    }

    const existingRating = await this._ratingRepo.findOne({
      where: { product: { id }, user: { id: user.id } },
    });

    if (existingRating) {
      const currentTotal = product.rating * product.ratingCount;
      const oldSum = Number(existingRating.rating);
      const newSum = currentTotal - oldSum + rateProductDto.rating;
      const newRating = newSum / product.ratingCount;

      existingRating.rating = rateProductDto.rating;
      await this._ratingRepo.save(existingRating);

      product.rating = Math.round(newRating * 100) / 100;
      await this._productRepo.save(product);
    } else {
      const newRatingCount = product.ratingCount + 1;
      const currentTotal = product.rating * product.ratingCount;
      const newRating = (currentTotal + rateProductDto.rating) / newRatingCount;

      const rating = this._ratingRepo.create({
        rating: rateProductDto.rating,
        product,
        user: { id: user.id },
      });
      await this._ratingRepo.save(rating);

      product.rating = Math.round(newRating * 100) / 100;
      product.ratingCount = newRatingCount;
      await this._productRepo.save(product);
    }

    return {
      message: 'Product rated successfully.',
      HttpStatus: HttpStatus.OK,
    };
  }

  async findPopularProducts() {
    const data = await this._productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variant')
      .leftJoinAndSelect('product.images', 'image')
      .leftJoinAndSelect('product.category', 'category')
      .addSelect(
        'COALESCE((SELECT AVG(r.rating) FROM tb_product_ratings r WHERE r.product_id = product.id), 0)',
        '_avg_rating',
      )
      .addSelect(
        'COALESCE((SELECT COUNT(*) FROM tb_product_ratings r WHERE r.product_id = product.id), 0)',
        '_rating_count',
      )
      .andWhere(
        `COALESCE((SELECT AVG(r.rating) FROM tb_product_ratings r WHERE r.product_id = product.id), 0) >= :minRating`,
        { minRating: 4.0 },
      )
      .andWhere('product.isActive = :isActive', { isActive: true })
      .orderBy('_avg_rating', 'DESC')
      .addOrderBy('_rating_count', 'DESC')
      .addOrderBy('variant.order', 'ASC')
      .take(8)
      .getRawAndEntities();

    const products = data.entities.map((product, i) => ({
      ...product,
      rating: Number(data.raw[i]?._avg_rating ?? 0),
      ratingCount: Number(data.raw[i]?._rating_count ?? 0),
    }));

    const formattedData = formatProductImages(products);

    return {
      message: 'Popular products retrieved successfully.',
      HttpStatus: HttpStatus.OK,
      data: formattedData,
    };
  }

  async removeProduct(id: string) {
    const product = await this._productRepo.findOne({
      where: { id },
      relations: ['images'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found.`);
    }

    if (product.images?.length) {
      for (const image of product.images) {
        const filePath = join(process.cwd(), image.url);
        if (existsSync(filePath)) {
          unlinkSync(filePath);
        }
      }
    }

    await this._productRepo.remove(product);

    return {
      message: 'Product deleted successfully.',
      HttpStatus: HttpStatus.OK,
    };
  }
}
