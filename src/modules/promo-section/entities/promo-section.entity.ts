import { Node } from 'src/shared/node/common.entity';
import { Column, Entity } from 'typeorm';

@Entity('tb_promo_sections')
export class PromoSection extends Node {
  @Column({ name: 'title', type: 'varchar', length: 255, nullable: true })
  title: string | null;

  @Column({ name: 'text', type: 'text', nullable: true })
  text: string | null;

  @Column({ name: 'button_label', type: 'varchar', length: 100, nullable: true })
  buttonText: string | null;

  @Column({ name: 'link_url', type: 'varchar', length: 500, nullable: true })
  linkUrl: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'end_at', type: 'timestamp', nullable: true })
  endAt: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
