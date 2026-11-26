import { Node } from 'src/shared/node/common.entity';
import { WithdrawStatus } from 'src/shared/enum/enum.type';
import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'tb_withdraw' })
@Index('name', ['name'])
@Index('email', ['email'])
@Index('order_number', ['orderNumber'], { unique: true })
export class Withdraw extends Node {
  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'email', type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'order_number', type: 'varchar', length: 30 })
  orderNumber: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: WithdrawStatus,
    default: WithdrawStatus.PENDING,
  })
  status: WithdrawStatus;
}
