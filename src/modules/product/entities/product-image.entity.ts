import { Node } from 'src/shared/node/common.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@Entity('tb_product_images')
export class ProductImage extends Node {
  @Column({ name: 'url', type: 'varchar', length: 500 })
  url: string;

  @Column({ name: 'alt', type: 'varchar', length: 255, nullable: true })
  alt: string;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
