import { Node } from 'src/shared/node/common.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Product } from './product.entity';
import { Users } from 'src/modules/users/entities/user.entity';

@Entity('tb_product_ratings')
@Unique(['product', 'user'])
export class ProductRating extends Node {
  @Column({ name: 'rating', type: 'decimal', precision: 3, scale: 2 })
  rating: number;

  @ManyToOne(() => Product, (product) => product.ratings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;
}
