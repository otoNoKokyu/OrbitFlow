
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createFiles, updateFiles } from 'src/utility/filestorage/filestorage.service';


@Injectable()
export class AttachmentMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const files = (req as any).files
    if(!files) { return next()}
    let storedFileInfo = null
    if (req.body.draftId) {
      storedFileInfo = await updateFiles(req.body.draftId, files)
    }
    else {
      storedFileInfo = await createFiles(files);
    }
    (req as any).body.attachments = storedFileInfo.stored.map((f) => f.name);
    req.body.draftId = storedFileInfo.draftId

    next();
  }
}

