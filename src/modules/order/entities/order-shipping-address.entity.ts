import { Node } from 'src/shared/node/common.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Order } from './order.entity';

@Entity('tb_order_shipping_addresses')
export class OrderShippingAddress extends Node {
  @Column({ name: 'street', type: 'varchar', length: 255 })
  street: string;

  @Column({ name: 'street_number', type: 'varchar', length: 20 })
  streetNumber: string;

  @Column({ name: 'city', type: 'varchar', length: 100 })
  city: string;

  @Column({ name: 'zip_code', type: 'varchar', length: 20 })
  zipCode: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 20 })
  phoneNumber: string;

  @OneToOne(() => Order, (order) => order.shippingAddress, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
