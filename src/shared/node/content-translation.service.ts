import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ContentTranslation } from './content-translation.entity';

@Injectable()
export class ContentTranslationService {
  constructor(
    @InjectRepository(ContentTranslation)
    private readonly _translationRepo: Repository<ContentTranslation>,
  ) {}

  async attach<T extends { id: string }>(
    contentType: string,
    items: T[],
  ): Promise<
    Array<T & { translations: Record<string, Record<string, string | null>> }>
  > {
    if (!items.length) return [];
    const rows = await this._translationRepo.find({
      where: { contentType, contentId: In(items.map(({ id }) => id)) },
    });
    const byId = new Map(rows.map((row) => [row.contentId, row.translations]));
    return items.map((item) => ({
      ...item,
      translations: byId.get(item.id) ?? {},
    }));
  }

  async save(
    contentType: string,
    contentId: string,
    translations: Record<string, Record<string, string | null>> | undefined,
    repository = this._translationRepo,
  ) {
    if (!translations) return;
    await repository.upsert(
      { contentType, contentId, translations },
      ['contentType', 'contentId'],
    );
  }

  async remove(contentType: string, contentId: string) {
    await this._translationRepo.delete({ contentType, contentId });
  }
}
