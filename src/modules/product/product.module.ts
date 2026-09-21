import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductRating } from './entities/product-rating.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage, ProductVariant, ProductRating])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
