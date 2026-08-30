import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductQueryDto } from 'src/shared/dto/pagination-query.dto';

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

    return {
      message: 'Products retrieved successfully.',
      HttpStatus: HttpStatus.OK,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  findOne(id: string) {
    return `This action returns a #${id} product`;
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: string) {
    return `This action removes a #${id} product`;
  }
}
