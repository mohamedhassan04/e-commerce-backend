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
import { Category } from 'src/modules/category/entities/category.entity';
import { ProductQueryDto } from 'src/shared/dto/pagination-query.dto';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { formatProductImages } from 'src/shared/utils/utils';
import { processProductImage } from 'src/shared/sharp/image-processing';

@Injectable()
export class ProductService {
  constructor(
    private readonly _dataSource: DataSource,
    @InjectRepository(Product)
    private readonly _productRepo: Repository<Product>,
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
      .leftJoinAndSelect('product.category', 'category');

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

    const [data, total] = await qb
      .skip(skip)
      .take(limit)
      .orderBy('product.createdAt', 'DESC')
      .addOrderBy('variant.order', 'ASC')
      .getManyAndCount();

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

  async rateProduct(id: string, rateProductDto: RateProductDto) {
    // Find the product by ID in the database
    const product = await this._productRepo.findOne({ where: { id } });

    // If product doesn't exist, throw a 404 error
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found.`);
    }

    // Increment the total number of ratings by 1
    // e.g. if product was rated by 3 users before, now it's 4
    const newRatingCount = product.ratingCount + 1;

    // Calculate the sum of all previous ratings
    // e.g. if current avg is 4.00 and ratingCount is 3 => total sum = 4.00 * 3 = 12.00
    const currentTotal = product.rating * product.ratingCount;

    // Calculate new weighted average: (old sum + new rating) / new total count
    // e.g. (12.00 + 5) / 4 = 4.25
    const newRating = (currentTotal + rateProductDto.rating) / newRatingCount;

    // Round to 2 decimal places and store
    // e.g. 4.25333... => 4.25
    product.rating = Math.round(newRating * 100) / 100;

    // Update the rating count
    product.ratingCount = newRatingCount;

    // Save the updated product to the database
    await this._productRepo.save(product);

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
      .where('product.rating >= :minRating AND product.rating <= :maxRating', {
        minRating: 4.0,
        maxRating: 5.0,
      })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .orderBy('product.rating', 'DESC')
      .addOrderBy('product.ratingCount', 'DESC')
      .addOrderBy('variant.order', 'ASC')
      .take(8)
      .getMany();

    const formattedData = formatProductImages(data);

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
        const filePath = join(__dirname, '..', '..', image.url);
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
