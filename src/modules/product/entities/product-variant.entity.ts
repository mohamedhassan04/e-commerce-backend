import { Node } from 'src/shared/node/common.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@Entity('tb_product_variants')
export class ProductVariant extends Node {
  @Column({ name: 'size', type: 'varchar', length: 50 })
  size: string;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'stock', type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'sku', type: 'varchar', length: 100, unique: true, nullable: true })
  sku: string;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
