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

  @Column({ name: 'guest_email', type: 'varchar', length: 255, nullable: true })
  guestEmail: string | null;

  @Column({ name: 'guest_first_name', type: 'varchar', length: 100, nullable: true })
  guestFirstName: string | null;

  @Column({ name: 'guest_last_name', type: 'varchar', length: 100, nullable: true })
  guestLastName: string | null;

  @OneToOne(
    () => OrderShippingAddress,
    (shippingAddress) => shippingAddress.order,
    { cascade: true },
  )
  shippingAddress: OrderShippingAddress;

  @ManyToOne(() => Users, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: Users | null;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];
}
