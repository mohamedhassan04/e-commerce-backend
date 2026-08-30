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

@Injectable()
export class ProductService {
  constructor(
    private readonly _dataSource: DataSource,
    @InjectRepository(Product)
    private readonly _productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly _variantRepo: Repository<ProductVariant>,
    @InjectRepository(ProductImage)
    private readonly _imageRepo: Repository<ProductImage>,
  ) {}

  async create(createProductDto: CreateProductDto) {
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

      if (createProductDto.images?.length) {
        const images = createProductDto.images.map((img) =>
          queryRunner.manager.create(ProductImage, {
            url: img.url,
            alt: img.alt,
            isPrimary: img.isPrimary ?? false,
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

  findAll() {
    return `This action returns all product`;
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
