import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderShippingAddress } from './entities/order-shipping-address.entity';
import { ProductVariant } from 'src/modules/product/entities/product-variant.entity';
import { Address } from 'src/modules/users/entities/address.entity';
import { PhoneNumber } from 'src/modules/users/entities/phone-number.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { BulkUpdateOrderStatusDto } from './dto/bulk-update-order-status.dto';
import { ProductQueryDto } from 'src/shared/dto/pagination-query.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { generateOrderNumber } from 'src/shared/utils/utils';
import { OrderCreatedEvent } from './events/order-created.event';
import { OrderStatusUpdatedEvent } from './events/order-status-updated.event';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly _dataSource: DataSource,
    @InjectRepository(Order)
    private readonly _orderRepo: Repository<Order>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // @desc Create a new order
  // @route POST /order
  async createOrder(createOrderDto: CreateOrderDto, userId: string | null) {
    const isGuest = !userId;

    if (isGuest) {
      if (!createOrderDto.guestEmail) {
        throw new BadRequestException('Email is required for guest checkout.');
      }
      if (!createOrderDto.guestFirstName) {
        throw new BadRequestException('First name is required for guest checkout.');
      }
      if (!createOrderDto.guestLastName) {
        throw new BadRequestException('Last name is required for guest checkout.');
      }
      if (createOrderDto.addressId) {
        throw new BadRequestException('Guests cannot use saved addresses. Please provide a manualAddress.');
      }
      if (createOrderDto.phoneNumberId) {
        throw new BadRequestException('Guests cannot use saved phone numbers. Please provide a phone number in manualAddress.');
      }
    }

    if (!createOrderDto.addressId && !createOrderDto.manualAddress) {
      throw new BadRequestException(
        'An address is required. Provide addressId or manualAddress.',
      );
    }

    if (createOrderDto.addressId && createOrderDto.manualAddress) {
      throw new BadRequestException(
        'Provide either addressId or manualAddress, not both.',
      );
    }

    if (
      !createOrderDto.phoneNumberId &&
      !createOrderDto.manualAddress?.phoneNumber
    ) {
      throw new BadRequestException(
        'A phone number is required. Provide phoneNumberId or include phoneNumber in manualAddress.',
      );
    }

    if (
      createOrderDto.phoneNumberId &&
      createOrderDto.manualAddress?.phoneNumber
    ) {
      throw new BadRequestException(
        'Provide either phoneNumberId or phoneNumber in manualAddress, not both.',
      );
    }

    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let orderCreatedEvent: OrderCreatedEvent | null = null;

    try {
      let street: string;
      let city: string;
      let state: string;
      let zipCode: string;
      let country: string;
      let phoneNumber: string;

      if (createOrderDto.addressId) {
        const address = await queryRunner.manager.findOne(Address, {
          where: { id: createOrderDto.addressId, user: { id: userId } },
        });
        if (!address) {
          throw new NotFoundException('Adresse non trouvée.');
        }
        street = address.street;
        city = address.city;
        state = address.state;
        zipCode = address.zipCode;
        country = address.country;
      } else {
        street = createOrderDto.manualAddress.street;
        city = createOrderDto.manualAddress.city;
        state = createOrderDto.manualAddress.state;
        zipCode = createOrderDto.manualAddress.zipCode;
        country = createOrderDto.manualAddress.country;
      }

      if (createOrderDto.phoneNumberId) {
        const savedPhoneNumber = await queryRunner.manager.findOne(
          PhoneNumber,
          {
            where: {
              id: createOrderDto.phoneNumberId,
              user: { id: userId },
            },
          },
        );
        if (!savedPhoneNumber) {
          throw new NotFoundException('Numéro de téléphone non trouvé.');
        }
        phoneNumber = savedPhoneNumber.phoneNumber;
      } else {
        phoneNumber = createOrderDto.manualAddress.phoneNumber;
      }

      let total = 0;
      const orderItems: OrderItem[] = [];

      for (const item of createOrderDto.items) {
        const variant = await queryRunner.manager
          .createQueryBuilder(ProductVariant, 'variant')
          .innerJoinAndSelect('variant.product', 'product')
          .setLock('pessimistic_write')
          .where('variant.id = :id', { id: item.productVariantId })
          .getOne();

        if (!variant) {
          throw new NotFoundException(
            `Product variant with ID "${item.productVariantId}" not found.`,
          );
        }

        if (variant.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for variant "${variant.size}". Available: ${variant.stock}, requested: ${item.quantity}.`,
          );
        }

        variant.stock -= item.quantity;
        await queryRunner.manager.save(ProductVariant, variant);

        const itemTotal = variant.price * item.quantity;
        total += itemTotal;

        const orderItem = queryRunner.manager.create(OrderItem, {
          quantity: item.quantity,
          price: variant.price,
          productVariant: variant,
        });
        orderItems.push(orderItem);
      }

      const shippingAddress = queryRunner.manager.create(OrderShippingAddress, {
        street,
        city,
        state,
        zipCode,
        country,
        phoneNumber,
      });

      const order = queryRunner.manager.create(Order, {
        orderNumber: await generateOrderNumber(queryRunner),
        total,
        user: userId ? { id: userId } : null,
        guestEmail: isGuest ? createOrderDto.guestEmail : null,
        guestFirstName: isGuest ? createOrderDto.guestFirstName : null,
        guestLastName: isGuest ? createOrderDto.guestLastName : null,
        items: orderItems,
        shippingAddress,
      });

      await queryRunner.manager.save(Order, order);
      const recipientEmail = isGuest ? createOrderDto.guestEmail : null;
      const customerName = isGuest
        ? `${createOrderDto.guestFirstName} ${createOrderDto.guestLastName}`
        : null;

      if (recipientEmail) {
        orderCreatedEvent = new OrderCreatedEvent(
          order.id,
          recipientEmail,
          {
            ref: order.orderNumber,
            clientName: customerName,
            items: orderItems.map((item) => ({
              productName: item.productVariant?.product?.name
                ? `${item.productVariant.product.name} ${item.productVariant.size || ''}`.trim()
                : item.productVariant?.size || 'Item',
              quantity: item.quantity,
              priceTTC: item.price * item.quantity,
            })),
            totalTTC: total,
          },
        );
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    if (orderCreatedEvent) {
      try {
        this.eventEmitter.emit('order.created', orderCreatedEvent);
      } catch (error) {
        this.logger.error(
          `Failed to dispatch order confirmation email for order ${orderCreatedEvent.orderId}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }

    return {
      message: 'Order placed successfully.',
      HttpStatus: HttpStatus.CREATED,
    };
  }

  // @desc Get user orders with pagination
  // @route GET /order/my-orders
  async findUserOrders(userId: string, query: ProductQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const qb = this._orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoin('items.productVariant', 'productVariant')
      .addSelect(['productVariant.id', 'productVariant.size'])
      .leftJoin('productVariant.product', 'product')
      .addSelect(['product.id', 'product.name'])
      .leftJoinAndSelect('order.shippingAddress', 'shippingAddress')
      .where('order.user.id = :userId', { userId })
      .orderBy('order.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      message: 'Orders retrieved successfully.',
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // @desc Get all orders with pagination and filters (admin)
  // @route GET /order/all
  async findAllOrders(query: OrderQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const qb = this._orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoin('items.productVariant', 'productVariant')
      .addSelect(['productVariant.id', 'productVariant.size'])
      .leftJoin('productVariant.product', 'product')
      .addSelect(['product.id', 'product.name'])
      .leftJoinAndSelect('order.shippingAddress', 'shippingAddress')
      .leftJoin('order.user', 'user')
      .addSelect(['user.id', 'user.firstName', 'user.lastName', 'user.email']);

    if (query.orderNumber) {
      qb.andWhere('order.orderNumber ILIKE :orderNumber', {
        orderNumber: `%${query.orderNumber}%`,
      });
    }

    if (query.status) {
      qb.andWhere('order.status = :status', { status: query.status });
    }

    qb.orderBy('order.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      message: 'Orders retrieved successfully.',
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // @desc Get order by ID
  // @route GET /order/:id
  async findOrderById(orderId: string) {
    const order = await this._orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.productVariant', 'productVariant')
      .leftJoinAndSelect('productVariant.product', 'product')
      .leftJoinAndSelect('order.shippingAddress', 'shippingAddress')
      .leftJoin('order.user', 'user')
      .addSelect(['user.id', 'user.firstName', 'user.lastName', 'user.email'])
      .where('order.id = :orderId', { orderId })
      .getOne();

    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found.`);
    }

    return {
      message: 'Order retrieved successfully.',
      data: order,
    };
  }

  // @desc Update order status (admin)
  // @route PATCH /order/:id/status
  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this._orderRepo
      .createQueryBuilder('order')
      .leftJoin('order.user', 'user')
      .addSelect(['user.firstName', 'user.lastName', 'user.email'])
      .where('order.id = :orderId', { orderId })
      .getOne();

    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found.`);
    }

    order.status = dto.status;
    await this._orderRepo.save(order);
    this.emitOrderStatusUpdated(order);

    return {
      message: 'Order status updated successfully.',
      httpStatus: HttpStatus.OK,
    };
  }

  // @desc Bulk update order status (admin)
  // @route PATCH /order/bulk-status
  async bulkUpdateOrderStatus(dto: BulkUpdateOrderStatusDto) {
    const orders = await this._orderRepo
      .createQueryBuilder('order')
      .leftJoin('order.user', 'user')
      .addSelect(['user.firstName', 'user.lastName', 'user.email'])
      .where('order.id IN (:...ids)', { ids: dto.ids })
      .getMany();

    if (orders.length === 0) {
      throw new NotFoundException('No orders found with the provided IDs.');
    }

    for (const order of orders) {
      order.status = dto.status;
    }

    await this._orderRepo.save(orders);

    for (const order of orders) {
      this.emitOrderStatusUpdated(order);
    }

    return {
      message: `${orders.length} order(s) status updated successfully.`,
      httpStatus: HttpStatus.OK,
    };
  }

  private emitOrderStatusUpdated(order: Order): void {
    const recipientEmail = order.user?.email || order.guestEmail;
    if (!recipientEmail) return;

    const customerName = order.user
      ? `${order.user.firstName} ${order.user.lastName}`
      : `${order.guestFirstName} ${order.guestLastName}`;

    try {
      this.eventEmitter.emit(
        'order.status.updated',
        new OrderStatusUpdatedEvent(order.id, recipientEmail, {
          ref: order.orderNumber,
          clientName: customerName,
          status: order.status,
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to dispatch order status update email for order ${order.id}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  // @desc Cancel pending order
  // @route PATCH /order/:id/cancel
  async cancelOrder(orderId: string, userId: string) {
    const order = await this._orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.productVariant', 'productVariant')
      .where('order.id = :orderId', { orderId })
      .andWhere('order.user.id = :userId', { userId })
      .getOne();

    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found.`);
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Only pending orders can be cancelled.');
    }

    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of order.items) {
        const variant = await queryRunner.manager
          .createQueryBuilder(ProductVariant, 'variant')
          .setLock('pessimistic_write')
          .where('variant.id = :id', { id: item.productVariant.id })
          .getOne();

        if (variant) {
          variant.stock += item.quantity;
          await queryRunner.manager.save(ProductVariant, variant);
        }
      }

      order.status = 'CANCELLED' as any;
      await queryRunner.manager.save(Order, order);
      await queryRunner.commitTransaction();

      return {
        message: 'Order cancelled successfully.',
        httpStatus: HttpStatus.OK,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
