import { Node } from 'src/shared/node/common.entity';
import { Column, Entity } from 'typeorm';

@Entity('tb_hero_slides')
export class HeroSlide extends Node {
  @Column({ name: 'tag', type: 'varchar', length: 255 })
  tag: string;

  @Column({ name: 'headline1', type: 'varchar', length: 255 })
  headline1: string;

  @Column({ name: 'headline2', type: 'varchar', length: 255 })
  headline2: string;

  @Column({ name: 'body', type: 'text' })
  body: string;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'chip1', type: 'varchar', length: 255, nullable: true })
  chip1: string | null;

  @Column({ name: 'chip2', type: 'varchar', length: 255, nullable: true })
  chip2: string | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
