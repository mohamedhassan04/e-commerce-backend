import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from 'src/shared/send-mail/mail.service';
import { ContactCreatedEvent } from './events/contact-created.event';

@Injectable()
export class ContactsEmailListener {
  private readonly logger = new Logger(ContactsEmailListener.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  @OnEvent('contact.created', { async: true, suppressErrors: true })
  async handleContactCreated(event: ContactCreatedEvent): Promise<void> {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');

    if (!adminEmail) {
      this.logger.warn(
        'ADMIN_EMAIL is not configured; skipping contact admin notification.',
      );
      return;
    }

    try {
      await this.emailService.sendContactAdminEmail(adminEmail, event.emailData);
    } catch (error) {
      this.logger.error(
        `Failed to send contact admin notification from ${event.emailData.email}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
