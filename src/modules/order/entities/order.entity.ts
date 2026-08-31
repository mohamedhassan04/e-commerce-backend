import { Node } from 'src/shared/node/common.entity';
import { OrderStatus } from 'src/shared/enum/enum.type';
import { Users } from 'src/modules/users/entities/user.entity';
import { Address } from 'src/modules/users/entities/address.entity';
import { PhoneNumber } from 'src/modules/users/entities/phone-number.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity('tb_orders')
export class Order extends Node {
  @Column({
    name: 'status',
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ name: 'total', type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @ManyToOne(() => Address, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @ManyToOne(() => PhoneNumber, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'phone_number_id' })
  phoneNumber: PhoneNumber;

  @Column({
    name: 'manual_address_street',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  manualAddressStreet: string;

  @Column({
    name: 'manual_address_city',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  manualAddressCity: string;

  @Column({
    name: 'manual_address_state',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  manualAddressState: string;

  @Column({
    name: 'manual_address_zip_code',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  manualAddressZipCode: string;

  @Column({
    name: 'manual_address_country',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  manualAddressCountry: string;

  @Column({
    name: 'manual_phone_number',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  manualPhoneNumber: string;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];
}
