import { OrderEmailData } from 'src/shared/send-mail/templates/order-email';

export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly recipientEmail: string,
    public readonly emailData: OrderEmailData,
  ) {}
}
