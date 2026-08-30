import { Node } from 'src/shared/node/common.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('tb_products')
export class Product extends Node {
  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[];

  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];
}
