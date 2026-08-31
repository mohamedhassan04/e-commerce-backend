import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto, RateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductQueryDto } from 'src/shared/dto/pagination-query.dto';
import { formatProductImages } from 'src/shared/utils/utils';

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
      const savedProduct = await queryRunner.manager.save(
        Product,
        queryRunner.manager.create(Product, {
          name: createProductDto.name,
          description: createProductDto.description,
          isActive: createProductDto.isActive ?? true,
        }),
      );

      if (createProductDto.variants?.length) {
        const variants = createProductDto.variants.map((v) =>
          queryRunner.manager.create(ProductVariant, {
            size: v.size,
            price: v.price,
            stock: v.stock ?? 0,
            sku: v.sku,
            product: savedProduct,
          }),
        );
        await queryRunner.manager.save(ProductVariant, variants);
      }

      if (files?.length) {
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

  async findAllProducts(query: ProductQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const qb = this._productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variant')
      .leftJoinAndSelect('product.images', 'image');

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

    const [data, total] = await qb
      .skip(skip)
      .take(limit)
      .orderBy('product.createdAt', 'DESC')
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

  async removeProduct(id: string) {
    // Find the product by ID in the database
    const product = await this._productRepo.findOne({ where: { id } });

    // If product doesn't exist, throw a 404 error
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found.`);
    }

    // Delete the product from the database
    // Related variants and images are auto-deleted via ON DELETE CASCADE
    await this._productRepo.remove(product);

    return {
      message: 'Product deleted successfully.',
      HttpStatus: HttpStatus.OK,
    };
  }
}
