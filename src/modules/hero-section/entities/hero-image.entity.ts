import { Node } from 'src/shared/node/common.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { HeroSection } from './hero-section.entity';

@Entity('tb_hero_images')
export class HeroImage extends Node {
  @Column({ name: 'url', type: 'varchar', length: 500 })
  url: string;

  @Column({ name: 'alt', type: 'varchar', length: 255, nullable: true })
  alt: string;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => HeroSection, (heroSection) => heroSection.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'hero_section_id' })
  heroSection: HeroSection;
}
