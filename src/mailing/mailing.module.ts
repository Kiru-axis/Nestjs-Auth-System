import { Module, Global } from '@nestjs/common';
import { MailingService } from './mailing.service';

@Global()
@Module({
  providers: [MailingService],
  exports: [MailingService],
})
export class MailingModule {}
