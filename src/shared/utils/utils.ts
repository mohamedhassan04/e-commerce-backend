import * as crypto from 'crypto';
import { configService } from 'src/config/config.service';

export const generateResetCode = (length = 10): string => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  return Array.from(crypto.randomBytes(length))
    .map((byte) => chars[byte % chars.length])
    .join('');
};

export function applyDiscount(
  price: number | string | null | undefined,
  discountPercent?: number | string | null,
): number {
  const base = Number(price ?? 0) || 0;
  const discount = Number(discountPercent ?? 0);
  if (!(discount > 0 && discount <= 100)) return base;
  return Math.round(base * (1 - discount / 100) * 100) / 100;
}

export function formatPrice(value: any): string {
  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) {
    return '0.00 Kč';
  }
  const fixedValue = numericValue.toFixed(2);
  const [integerPart, decimalPart] = fixedValue.split('.');
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return `${formattedInteger}.${decimalPart} Kč`;
}

export function formatImageUrl(url: string): string {
  if (url.startsWith('http')) return url;
  return `${configService.backendUrl}${url}`;
}

/**
 * Unambiguous alphabet (no 0/O, 1/I) for human-readable public identifiers.
 * 32 symbols × 6 positions = 32^6 ≈ 1.07 billion combinations per month.
 */
const ORDER_NUMBER_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const ORDER_NUMBER_SUFFIX_LENGTH = 6;
const ORDER_NUMBER_MAX_ATTEMPTS = 10;

/**
 * Cryptographically strong, unbiased random suffix.
 * `crypto.randomInt` uses rejection sampling, so every symbol has the same
 * probability (unlike `randomBytes()[i] % alphabet.length` or `Math.random()`).
 */
function randomOrderSuffix(length = ORDER_NUMBER_SUFFIX_LENGTH): string {
  return Array.from(
    { length },
    () => ORDER_NUMBER_ALPHABET[crypto.randomInt(ORDER_NUMBER_ALPHABET.length)],
  ).join('');
}

export async function generateOrderNumber(queryRunner: {
  query: (sql: string, parameters?: any[]) => Promise<any>;
}): Promise<string> {
  const now = new Date();
  const period = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    '0',
  )}`;

  for (let attempt = 0; attempt < ORDER_NUMBER_MAX_ATTEMPTS; attempt++) {
    const orderNumber = `ORD-${period}-${randomOrderSuffix()}`;

    // Idempotent pre-check; the UNIQUE constraint on order_number still
    // guarantees correctness if two requests race.
    const existing = await queryRunner.query(
      'SELECT 1 FROM tb_orders WHERE order_number = $1 LIMIT 1',
      [orderNumber],
    );
    if (!existing?.length) return orderNumber;
  }

  throw new Error('Unable to generate a unique order number.');
}

export function formatProductImages<T extends { images?: { url: string }[] }>(
  products: T[],
): T[] {
  return products.map((product) => ({
    ...product,
    images: product.images?.map((img) => ({
      ...img,
      url: formatImageUrl(img.url),
    })),
  }));
}
