import { UserRole } from 'src/shared/enum/enum.type';
import { Node } from 'src/shared/node/common.entity';
import { Column, Entity } from 'typeorm';

@Entity('tb_users')
export class Users extends Node {
  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'email', type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ name: 'password', type: 'varchar', select: false })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: false, type: 'boolean' })
  isActive: boolean;
}
