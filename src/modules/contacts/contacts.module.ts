import { Module } from '@nestjs/common';
import { SendMailModule } from 'src/shared/send-mail/send-mail.module';
import { ContactsController } from './contacts.controller';
import { ContactsEmailListener } from './contacts-email.listener';
import { ContactsService } from './contacts.service';

@Module({
  imports: [SendMailModule],
  controllers: [ContactsController],
  providers: [ContactsService, ContactsEmailListener],
})
export class ContactsModule {}
