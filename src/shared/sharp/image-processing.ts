import sharp from 'sharp';
import { existsSync, unlinkSync, renameSync } from 'fs';
import { join, parse } from 'path';

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

const DEFAULT_OPTIONS: ImageProcessingOptions = {
  maxWidth: 1920,
  quality: 80,
};

export async function processImage(
  filePath: string,
  options?: ImageProcessingOptions,
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!existsSync(filePath)) {
    throw new Error(`Image file not found: ${filePath}`);
  }

  const parsed = parse(filePath);
  const tempPath = join(parsed.dir, `${parsed.name}.tmp.webp`);
  const outputPath = join(parsed.dir, `${parsed.name}.webp`);

  await sharp(filePath)
    .resize({
      width: opts.maxWidth,
      height: opts.maxHeight,
      withoutEnlargement: true,
    })
    .webp({ quality: opts.quality })
    .toFile(tempPath);

  if (existsSync(filePath) && filePath !== outputPath) {
    unlinkSync(filePath);
  }

  renameSync(tempPath, outputPath);

  return outputPath;
}

export async function processHeroImage(filePath: string): Promise<string> {
  return processImage(filePath, { maxWidth: 1920, quality: 80 });
}

export async function processProductImage(filePath: string): Promise<string> {
  return processImage(filePath, { maxWidth: 1200, quality: 80 });
}
