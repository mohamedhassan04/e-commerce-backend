import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from 'src/shared/send-mail/mail.service';
import { WithdrawCreatedEvent } from './events/withdraw-created.event';

@Injectable()
export class WithdrawEmailListener {
  private readonly logger = new Logger(WithdrawEmailListener.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  @OnEvent('withdraw.created', { async: true, suppressErrors: true })
  async handleWithdrawCreated(event: WithdrawCreatedEvent): Promise<void> {
    const { emailData } = event;

    try {
      await this.emailService.sendWithdrawCustomerEmail(emailData.email, {
        language: emailData.language,
        name: emailData.name,
        orderNumber: emailData.orderNumber,
        submittedAt: emailData.submittedAt,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send withdrawal confirmation email for order ${emailData.orderNumber}`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    if (!adminEmail) {
      this.logger.warn(
        'ADMIN_EMAIL is not configured; skipping withdrawal admin notification.',
      );
      return;
    }

    try {
      await this.emailService.sendWithdrawAdminEmail(adminEmail, {
        language: emailData.language,
        name: emailData.name,
        email: emailData.email,
        orderNumber: emailData.orderNumber,
        submittedAt: emailData.submittedAt,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send withdrawal admin notification for order ${emailData.orderNumber}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
