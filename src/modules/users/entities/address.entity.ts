import { Node } from 'src/shared/node/common.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { Users } from './user.entity';

@Entity('tb_addresses')
export class Address extends Node {
  @Column({ name: 'street', type: 'varchar', length: 255 })
  street: string;

  @Column({ name: 'city', type: 'varchar', length: 100 })
  city: string;

  @Column({ name: 'state', type: 'varchar', length: 100 })
  state: string;

  @Column({ name: 'zip_code', type: 'varchar', length: 20 })
  zipCode: string;

  @Column({ name: 'country', type: 'varchar', length: 100 })
  country: string;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @ManyToOne(() => Users, (user) => user.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;
}
