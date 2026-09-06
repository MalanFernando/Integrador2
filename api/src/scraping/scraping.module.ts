import { Module } from '@nestjs/common';
import { ScrapingService } from './scraping.service.js';

@Module({
  providers: [ScrapingService],
  exports: [ScrapingService],
})
export class ScrapingModule {}
