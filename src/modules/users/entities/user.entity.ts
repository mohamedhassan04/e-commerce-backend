import { UserRole } from 'src/shared/enum/enum.type';
import { Node } from 'src/shared/node/common.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Address } from './address.entity';
import { PhoneNumber } from './phone-number.entity';

@Entity('tb_users')
export class Users extends Node {
  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'email', type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ name: 'password', type: 'varchar' })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: false, type: 'boolean' })
  isActive: boolean;

  @Column({ name: 'is_verified', default: false, type: 'boolean' })
  isVerified: boolean;

  @Column({ name: 'terms_accepted_at', type: 'timestamptz', nullable: true })
  termsAcceptedAt: Date | null;

  @Column({ name: 'terms_version', type: 'varchar', length: 20, nullable: true })
  termsVersion: string | null;

  @Column({ name: 'privacy_accepted_at', type: 'timestamptz', nullable: true })
  privacyAcceptedAt: Date | null;

  @Column({ name: 'privacy_version', type: 'varchar', length: 20, nullable: true })
  privacyVersion: string | null;

  @Column({ name: 'verification_code', type: 'varchar', nullable: true })
  verificationCode: string;

  @Column({
    name: 'verification_code_expiry',
    type: 'timestamp',
    nullable: true,
  })
  verificationCodeExpiry: Date;

  @Column({ name: 'reset_password_code', type: 'varchar', nullable: true })
  resetPasswordCode: string;

  @Column({
    name: 'reset_password_code_expiry',
    type: 'timestamp',
    nullable: true,
  })
  resetPasswordCodeExpiry: Date;

  @OneToMany(() => Address, (address) => address.user, { cascade: true })
  addresses: Address[];

  @OneToMany(() => PhoneNumber, (phone) => phone.user, { cascade: true })
  phoneNumbers: PhoneNumber[];
}
