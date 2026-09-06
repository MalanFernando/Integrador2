import { Injectable, BadRequestException } from '@nestjs/common';
import * as cheerio from 'cheerio';

export interface ScrapedEvento {
  titulo: string | null;
  descripcion: string | null;
  imagenes: string[];
  fechaInicio: string | null;
  fechaFin: string | null;
}

@Injectable()
export class ScrapingService {
  async scrapEventoDesdeUrl(url: string): Promise<ScrapedEvento> {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      throw new BadRequestException('URL inválida');
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new BadRequestException('La URL debe usar http o https');
    }

    let html: string;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; HastaLaVuelta/1.0; +https://hastalavuelta.ec)',
        },
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new BadRequestException(
          `No se pudo acceder a la URL (status ${response.status})`,
        );
      }
      html = await response.text();
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException('Error al obtener la URL');
    }

    const $ = cheerio.load(html);

    const titulo =
      this.getMeta($, 'og:title') ||
      this.getMeta($, 'twitter:title') ||
      $('title').text().trim() ||
      null;

    const descripcion =
      this.getMeta($, 'og:description') ||
      this.getMeta($, 'twitter:description') ||
      this.getMeta($, 'description') ||
      null;

    const imagenes: string[] = [];
    const ogImage = this.getMeta($, 'og:image');
    if (ogImage) imagenes.push(ogImage);
    const twitterImage = this.getMeta($, 'twitter:image');
    if (twitterImage && !imagenes.includes(twitterImage))
      imagenes.push(twitterImage);

    const fechaInicio =
      this.getMeta($, 'og:event:start_time') ||
      this.getMeta($, 'event:start_time') ||
      this.getSchemaOrgDate($, 'startDate') ||
      null;

    const fechaFin =
      this.getMeta($, 'og:event:end_time') ||
      this.getMeta($, 'event:end_time') ||
      this.getSchemaOrgDate($, 'endDate') ||
      null;

    return { titulo, descripcion, imagenes, fechaInicio, fechaFin };
  }

  private getMeta($: cheerio.CheerioAPI, name: string): string | null {
    const el =
      $(`meta[property="${name}"]`).attr('content') ||
      $(`meta[name="${name}"]`).attr('content');
    return el?.trim() || null;
  }

  private getSchemaOrgDate($: cheerio.CheerioAPI, prop: string): string | null {
    const scripts = $('script[type="application/ld+json"]');
    for (const el of scripts.toArray()) {
      try {
        const data = JSON.parse($(el).html() || '{}') as Record<
          string,
          unknown
        >;
        const items = Array.isArray(data) ? data : [data];
        for (const item of items) {
          const record = item as Record<string, unknown>;
          if (record[prop]) return record[prop] as string;
          if (record.startDate && prop === 'startDate')
            return record.startDate as string;
          if (record.endDate && prop === 'endDate')
            return record.endDate as string;
        }
      } catch {
        // ignore invalid JSON-LD
      }
    }
    return null;
  }
}
