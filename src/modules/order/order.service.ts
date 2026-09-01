import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderShippingAddress } from './entities/order-shipping-address.entity';
import { ProductVariant } from 'src/modules/product/entities/product-variant.entity';
import { Users } from 'src/modules/users/entities/user.entity';
import { Address } from 'src/modules/users/entities/address.entity';
import { PhoneNumber } from 'src/modules/users/entities/phone-number.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ProductQueryDto } from 'src/shared/dto/pagination-query.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly _dataSource: DataSource,
    @InjectRepository(Order)
    private readonly _orderRepo: Repository<Order>,
  ) {}

  // @desc Create a new order
  // @route POST /order
  async createOrder(createOrderDto: CreateOrderDto, userId: string) {
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

    if (!createOrderDto.phoneNumberId && !createOrderDto.manualPhoneNumber) {
      throw new BadRequestException(
        'A phone number is required. Provide phoneNumberId or manualPhoneNumber.',
      );
    }

    if (createOrderDto.phoneNumberId && createOrderDto.manualPhoneNumber) {
      throw new BadRequestException(
        'Provide either phoneNumberId or manualPhoneNumber, not both.',
      );
    }

    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

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
        phoneNumber = createOrderDto.manualPhoneNumber.phoneNumber;
      }

      let total = 0;
      const orderItems: OrderItem[] = [];

      for (const item of createOrderDto.items) {
        const variant = await queryRunner.manager
          .createQueryBuilder(ProductVariant, 'variant')
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

      const shippingAddress = queryRunner.manager.create(
        OrderShippingAddress,
        {
          street,
          city,
          state,
          zipCode,
          country,
          phoneNumber,
        },
      );

      const order = queryRunner.manager.create(Order, {
        total,
        user: { id: userId },
        items: orderItems,
        shippingAddress,
      });

      await queryRunner.manager.save(Order, order);
      await queryRunner.commitTransaction();

      return {
        message: 'Order placed successfully.',
        HttpStatus: HttpStatus.CREATED,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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

  // @desc Get all orders with pagination (admin)
  // @route GET /order/all
  async findAllOrders(query: ProductQueryDto) {
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
      .addSelect(['user.id', 'user.firstName', 'user.lastName', 'user.email'])
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
      .where('order.id = :orderId', { orderId })
      .getOne();

    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found.`);
    }

    order.status = dto.status;
    await this._orderRepo.save(order);

    return {
      message: 'Order status updated successfully.',
      httpStatus: HttpStatus.OK,
    };
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
