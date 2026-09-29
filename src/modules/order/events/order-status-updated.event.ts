import { OrderStatusUpdateEmailData } from 'src/shared/send-mail/templates/order-status-update';

export class OrderStatusUpdatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly recipientEmail: string,
    public readonly emailData: OrderStatusUpdateEmailData,
  ) {}
}
