import { Node } from 'src/shared/node/common.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';
import { Category } from 'src/modules/category/entities/category.entity';

@Entity('tb_products')
export class Product extends Node {
  @Column({ name: 'name', type: 'varchar', length: 255 })
  @Index()
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    name: 'rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  rating: number;

  @Column({ name: 'rating_count', type: 'int', default: 0 })
  ratingCount: number;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[];

  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];
}
