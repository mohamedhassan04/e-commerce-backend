import { Node } from 'src/shared/node/common.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('tb_product_variants')
@Index('UQ_tb_product_variants_sku', ['sku'], {
  unique: true,
  where: 'deleted_at IS NULL',
})
export class ProductVariant extends Node {
  @Column({ name: 'size', type: 'varchar', length: 50 })
  size: string;

  @Column({ name: 'order', type: 'int', default: 0 })
  order: number;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'stock', type: 'int', default: 0 })
  stock: number;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @Column({
    name: 'sku',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  sku: string;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
