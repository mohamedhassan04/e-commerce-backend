export interface WithdrawCreatedEmailData {
  language: 'cz' | 'en';
  name: string;
  email: string;
  orderNumber: string;
  submittedAt: Date;
}

export class WithdrawCreatedEvent {
  constructor(
    public readonly withdrawId: string,
    public readonly emailData: WithdrawCreatedEmailData,
  ) {}
}
