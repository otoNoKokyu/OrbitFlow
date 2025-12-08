import crypto from "crypto";
import type { File as MulterFile } from "multer";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET!;

export interface StoredFile {
  path: string;   // same as before
  name: string;
}

export async function storeFilesToS3(
  files: MulterFile[],
  draftId?: string
): Promise<{ stored: StoredFile[]; draftId: string }> {
  const finalDraftId = draftId ?? crypto.randomBytes(3).toString("hex");
  const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  const stored = await Promise.all(
    (files || []).map(async (file) => {
      const hash = crypto
        .createHash("sha1")
        .update(file.buffer)
        .digest("hex")
        .slice(0, 8);

      const ext = file.originalname.split(".").pop();
      const safeName = `${finalDraftId}_${hash}.${ext}`;
      const key = `drafts/${finalDraftId}/${safeName}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );

      return {
        path: key,       // S3 key
        name: safeName,  // filename only
      } as StoredFile;
    })
  );

  return { stored, draftId: finalDraftId };
}

export async function createFiles(files: MulterFile[]) {
  const draftId = crypto.randomBytes(3).toString('hex');
  return storeFilesToS3(files, draftId);
}

export async function updateFiles(draftId: string, files: MulterFile[]) {
  const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  const prefix = `drafts/${draftId}/`;
  console.log()
  const listed = await s3.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: prefix,
    })
  );

  if (listed.Contents) {
    await Promise.all(
      listed.Contents.map((obj) =>
        obj.Key
          ? s3.send(
            new DeleteObjectCommand({
              Bucket: BUCKET,
              Key: obj.Key,
            })
          )
          : null
      )
    );
  }

  return storeFilesToS3(files, draftId);
}
