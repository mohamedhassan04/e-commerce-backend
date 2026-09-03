import { Node } from 'src/shared/node/common.entity';
import { OrderStatus } from 'src/shared/enum/enum.type';
import { Users } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { OrderShippingAddress } from './order-shipping-address.entity';

@Entity('tb_orders')
export class Order extends Node {
  @Column({ name: 'order_number', type: 'varchar', length: 20, unique: true })
  orderNumber: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ name: 'total', type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @OneToOne(
    () => OrderShippingAddress,
    (shippingAddress) => shippingAddress.order,
    { cascade: true },
  )
  shippingAddress: OrderShippingAddress;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];
}
