
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { storeFilesToDisk } from 'src/utility/filestorage/filestorage.service';

@Injectable()
export class AttachmentMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const files = (req as any).files as any[];

    if (files && files.length > 0) {
      const storedFiles = await storeFilesToDisk(files);
      (req as any).storedFiles = storedFiles;
      req.body.attachments = storedFiles.map((f) => f.id);
    }

    next();
  }
}

