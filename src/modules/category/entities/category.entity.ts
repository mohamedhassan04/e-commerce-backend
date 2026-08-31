import { Node } from 'src/shared/node/common.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity('tb_categories')
export class Category extends Node {
  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
