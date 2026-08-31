import { Node } from 'src/shared/node/common.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { Users } from './user.entity';

@Entity('tb_phone_numbers')
export class PhoneNumber extends Node {
  @Column({ name: 'phone_number', type: 'varchar', length: 20 })
  phoneNumber: string;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @ManyToOne(() => Users, (user) => user.phoneNumbers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;
}
