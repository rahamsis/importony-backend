import { Controller, Get, Query } from '@nestjs/common';
import { R2Service } from './r2.service';

@Controller('/backendApi/catalogos')
export class R2Controller {
  constructor(private readonly r2: R2Service) {}

  // GET /pdfs -> lista con URLs firmadas (ver y descargar)
  @Get()
  async list() {
    const items = await this.r2.listAllPdfs();
    const withUrls = await Promise.all(items.map(async (f) => {
      const viewUrl = await this.r2.signedViewUrl(f.key);
      const downloadUrl = await this.r2.signedDownloadUrl(f.key);
      return { ...f, viewUrl, downloadUrl };
    }));
    return withUrls;
  }

  // GET /pdfs/sign?key=pdfs/ejemplo.pdf -> firma uno puntual
  @Get('sign')
  async sign(@Query('key') key: string) {
    const viewUrl = await this.r2.signedViewUrl(key);
    const downloadUrl = await this.r2.signedDownloadUrl(key);
    return { key, viewUrl, downloadUrl };
  }
}
