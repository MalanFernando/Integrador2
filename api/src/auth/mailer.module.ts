import { Module } from '@nestjs/common';
import { AuthMailerService } from './auth-mailer.service.js';

@Module({
  providers: [AuthMailerService],
  exports: [AuthMailerService],
})
export class MailerModule {}
