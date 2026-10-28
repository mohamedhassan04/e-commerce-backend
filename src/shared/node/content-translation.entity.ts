import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tb_content_translations')
@Index(['contentType', 'contentId'], { unique: true })
export class ContentTranslation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'content_type', type: 'varchar', length: 40 })
  contentType: string;

  @Column({ name: 'content_id', type: 'uuid' })
  contentId: string;

  @Column({ name: 'translations', type: 'jsonb', default: () => "'{}'::jsonb" })
  translations: Record<string, Record<string, string | null>>;
}
