export type ContentTranslations = Record<
  'cz' | 'en',
  Record<string, string | null>
>;

export function parseTranslations(value: unknown): ContentTranslations | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return undefined;
    }
    return parsed as ContentTranslations;
  } catch {
    return undefined;
  }
}
