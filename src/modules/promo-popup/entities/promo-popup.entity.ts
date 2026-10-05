import { Node } from 'src/shared/node/common.entity';
import { Column, Entity } from 'typeorm';

@Entity('tb_promo_popups')
export class PromoPopup extends Node {
  @Column({ name: 'title', type: 'varchar', length: 255, nullable: true })
  title: string | null;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'link_url', type: 'varchar', length: 500, nullable: true })
  linkUrl: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
