import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { WithdrawStatus } from 'src/shared/enum/enum.type';
import { Order } from '../order/entities/order.entity';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { WithdrawQueryDto } from './dto/withdraw-query.dto';
import { Withdraw } from './entities/withdraw.entity';
import { WithdrawCreatedEvent } from './events/withdraw-created.event';

const WITHDRAW_WINDOW_DAYS = 14;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Strips the time part so only the calendar date is compared. */
const toCalendarDate = (date: Date): number =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

@Injectable()
export class WithdrawService {
  private readonly logger = new Logger(WithdrawService.name);

  constructor(
    @InjectRepository(Withdraw)
    private readonly _withdrawRepo: Repository<Withdraw>,
    @InjectRepository(Order)
    private readonly _orderRepo: Repository<Order>,
    private readonly _eventEmitter: EventEmitter2,
  ) {}

  // @desc Submit a withdrawal from contract request (public)
  // @route POST /withdraw
  async create(createWithdrawDto: CreateWithdrawDto) {
    const order = await this._orderRepo.findOne({
      where: { orderNumber: createWithdrawDto.orderNumber },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    if (!order.deliveredAt) {
      throw new BadRequestException('This order has not been delivered yet.');
    }

    const deliveredAt = toCalendarDate(new Date(order.deliveredAt));
    const today = toCalendarDate(new Date());
    const elapsedDays = (today - deliveredAt) / MS_PER_DAY;

    if (elapsedDays < 0) {
      throw new BadRequestException(
        'The delivery date cannot be in the future.',
      );
    }

    if (elapsedDays > WITHDRAW_WINDOW_DAYS) {
      throw new BadRequestException(
        `The ${WITHDRAW_WINDOW_DAYS}-day withdrawal period has expired.`,
      );
    }

    const existingWithdraw = await this._withdrawRepo.findOne({
      where: { orderNumber: createWithdrawDto.orderNumber },
    });

    if (existingWithdraw) {
      throw new ConflictException(
        'A withdrawal request for this order already exists.',
      );
    }

    try {
      const withdraw = this._withdrawRepo.create({
        ...createWithdrawDto,
        status: WithdrawStatus.PENDING,
      });
      await this._withdrawRepo.save(withdraw);
      this.emitWithdrawCreated(withdraw, order);

      return {
        message: 'Withdrawal request submitted successfully.',
        HttpStatus: HttpStatus.CREATED,
        data: {
          id: withdraw.id,
          orderNumber: withdraw.orderNumber,
          status: withdraw.status,
          createdAt: withdraw.createdAt,
        },
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException(
          'A withdrawal request for this order already exists.',
        );
      }

      throw new InternalServerErrorException(
        'Failed to submit withdrawal request.',
      );
    }
  }

  private emitWithdrawCreated(withdraw: Withdraw, order: Order): void {
    try {
      this._eventEmitter.emit(
        'withdraw.created',
        new WithdrawCreatedEvent(withdraw.id, {
          language: order.emailLanguage ?? 'en',
          name: withdraw.name,
          email: withdraw.email,
          orderNumber: withdraw.orderNumber,
          submittedAt: withdraw.createdAt,
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to dispatch withdrawal created event for order ${withdraw.orderNumber}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  // @desc Get all withdrawal requests with search and pagination (admin)
  // @route GET /withdraw
  async findAll(query: WithdrawQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const qb = this._withdrawRepo
      .createQueryBuilder('withdraw')
      .select([
        'withdraw.id',
        'withdraw.orderNumber',
        'withdraw.status',
        'withdraw.createdAt',
        'withdraw.updatedAt',
      ]);

    if (query.search?.trim()) {
      qb.andWhere(
        '(withdraw.name ILIKE :search OR withdraw.email ILIKE :search OR withdraw.orderNumber ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }

    const [data, total] = await qb
      .orderBy('withdraw.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      message: 'Withdrawal requests retrieved successfully.',
      HttpStatus: HttpStatus.OK,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
