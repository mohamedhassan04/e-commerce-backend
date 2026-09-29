import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from 'src/shared/send-mail/mail.service';
import { OrderCreatedEvent } from './events/order-created.event';
import { OrderStatusUpdatedEvent } from './events/order-status-updated.event';

@Injectable()
export class OrderEmailListener {
  private readonly logger = new Logger(OrderEmailListener.name);

  constructor(private readonly emailService: EmailService) {}

  @OnEvent('order.created', { async: true, suppressErrors: true })
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    try {
      await this.emailService.sendOrderEmail(
        event.recipientEmail,
        event.emailData,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send order confirmation email for order ${event.orderId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  @OnEvent('order.status.updated', { async: true, suppressErrors: true })
  async handleOrderStatusUpdated(event: OrderStatusUpdatedEvent): Promise<void> {
    try {
      await this.emailService.sendOrderStatusUpdateEmail(
        event.recipientEmail,
        event.emailData,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send order status update email for order ${event.orderId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
