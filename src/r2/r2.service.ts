import { Injectable } from '@nestjs/common';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

type PdfItem = {
  key: string;
  name: string;
  size?: number;
  lastModified?: Date;
};

@Injectable()
export class R2Service {
  private s3 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  private bucket = process.env.R2_BUCKET_NAME!;
  private prefix = process.env.R2_PDF_PREFIX || '';
  private ttl = Number(process.env.SIGN_TTL_SECONDS || 3600);

  async listAllPdfs(): Promise<PdfItem[]> {
    const results: PdfItem[] = [];
    let token: string | undefined;

    do {
      const resp = await this.s3.send(new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: this.prefix || undefined,
        ContinuationToken: token,
      }));

      for (const o of resp.Contents || []) {
        if (!o.Key) continue;
        if (!o.Key.toLowerCase().endsWith('.pdf')) continue;

        results.push({
          key: o.Key,
          name: decodeURIComponent(o.Key.replace(this.prefix, '')),
          size: o.Size,
          lastModified: o.LastModified,
        });
      }
      token = resp.IsTruncated ? resp.NextContinuationToken : undefined;
    } while (token);

    results.sort((a, b) => (b.lastModified?.getTime() || 0) - (a.lastModified?.getTime() || 0));
    return results;
  }

  async signedViewUrl(key: string) {
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, cmd, { expiresIn: this.ttl });
  }

  async signedDownloadUrl(key: string) {
    const filename = key.split('/').pop() || 'archivo.pdf';
    const cmd = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${filename}"`,
    });
    return getSignedUrl(this.s3, cmd, { expiresIn: this.ttl });
  }
}
