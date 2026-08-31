import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { configService } from 'src/config/config.service';

interface GenerateNumeroOptions<T> {
  repo: Repository<T>;
  dateColumn: string; // e.g. 'paymentDate', 'createdAt'
  numberColumn: string; // e.g. 'invoiceNo', 'orderNo'
  padding?: number; // default 3
}

export async function generateNumero<T>(
  options: GenerateNumeroOptions<T>,
): Promise<string> {
  const { repo, dateColumn, numberColumn, padding = 3 } = options;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  const lastItem = await repo
    .createQueryBuilder('e')
    .withDeleted()
    .where(`EXTRACT(YEAR FROM e.${dateColumn}) = :year`, { year })
    .andWhere(`EXTRACT(MONTH FROM e.${dateColumn}) = :month`, {
      month: Number(month),
    })
    .orderBy(`e.${numberColumn}`, 'DESC')
    .getOne();

  let sequence = 1;

  if (lastItem?.[numberColumn]) {
    const parts = String(lastItem[numberColumn]).split('-');
    sequence = parseInt(parts[2], 10) + 1;
  }

  const seqStr = String(sequence).padStart(padding, '0');

  return `${year}-${month}-${seqStr}`;
}

export const generateResetCode = (length = 10): string => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  return Array.from(crypto.randomBytes(length))
    .map((byte) => chars[byte % chars.length])
    .join('');
};

export function formatPrice(value: any): string {
  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) {
    return '0.000';
  }
  const fixedValue = numericValue.toFixed(3);
  const [integerPart, decimalPart] = fixedValue.split('.');
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return `${formattedInteger}.${decimalPart}`;
}

export function formatImageUrl(url: string): string {
  if (url.startsWith('http')) return url;
  return `${configService.backendUrl}${url}`;
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
