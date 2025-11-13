import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import type { File as MulterFile } from 'multer';

const UPLOAD_DIR = path.join(__dirname, '../../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export interface StoredFile {
  id: string;
  path: string;
  name: string;
}
export async function storeFilesToDisk(files: MulterFile[]): Promise<StoredFile[]> {
  const stored: StoredFile[] = [];

  for (const file of files || []) {
    const id = randomUUID();
    const fileName = `${id}-${file.originalname}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    await fs.promises.writeFile(filePath, file.buffer);

    stored.push({
      id,
      path: `/uploads/${fileName}`,
      name: file.originalname,
    });
  }

  return stored;
}