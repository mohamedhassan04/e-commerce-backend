import { ContactTopic } from '../dto/create-contact.dto';

export interface ContactCreatedEmailData {
  language: 'cz' | 'en';
  name: string;
  email: string;
  topic: ContactTopic;
  message: string;
  submittedAt: Date;
}

export class ContactCreatedEvent {
  constructor(public readonly emailData: ContactCreatedEmailData) {}
}
