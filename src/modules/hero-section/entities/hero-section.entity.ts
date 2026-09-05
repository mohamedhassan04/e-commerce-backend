import { Node } from 'src/shared/node/common.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { HeroImage } from './hero-image.entity';

@Entity('tb_hero_sections')
export class HeroSection extends Node {
  @Column({ name: 'slogan', type: 'varchar', length: 255 })
  slogan: string;

  @Column({ name: 'sub_slogan', type: 'varchar', length: 500, nullable: true })
  subSlogan: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => HeroImage, (heroImage) => heroImage.heroSection, {
    cascade: true,
  })
  images: HeroImage[];
}
