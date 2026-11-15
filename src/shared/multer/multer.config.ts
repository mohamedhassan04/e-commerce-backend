import { Options } from 'multer';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { mkdirSync } from 'fs';
import { join } from 'path';

const uploadsDir = process.env.UPLOADS_DIR || join(process.cwd(), 'uploads');
mkdirSync(uploadsDir, { recursive: true });

export const multerConfig: Options = {
  storage: diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      const uniqueName = `${uuid()}.webp`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      cb(new Error('Only image files are allowed') as any, false);
      return;
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};
