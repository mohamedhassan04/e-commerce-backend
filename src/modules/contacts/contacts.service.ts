import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactCreatedEvent } from './events/contact-created.event';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(private readonly _eventEmitter: EventEmitter2) {}

  // @desc Send a contact message to the admin (public)
  // @route POST /contacts
  create(createContactDto: CreateContactDto) {
    this.emitContactCreated(createContactDto);

    return {
      message: 'Message sent successfully.',
      HttpStatus: HttpStatus.CREATED,
      data: {
        received: true,
      },
    };
  }

  private emitContactCreated(createContactDto: CreateContactDto): void {
    try {
      this._eventEmitter.emit(
        'contact.created',
        new ContactCreatedEvent({
          language: createContactDto.language ?? 'en',
          name: createContactDto.name,
          email: createContactDto.email,
          topic: createContactDto.topic,
          message: createContactDto.message,
          submittedAt: new Date(),
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to dispatch contact created event for ${createContactDto.email}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
