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

  private cleanNullFields(order: Order) {
    const cleaned = { ...order };
    if (!cleaned.address) delete cleaned.address;
    if (!cleaned.phoneNumber) delete cleaned.phoneNumber;
    if (!cleaned.manualAddressStreet) delete cleaned.manualAddressStreet;
    if (!cleaned.manualAddressCity) delete cleaned.manualAddressCity;
    if (!cleaned.manualAddressState) delete cleaned.manualAddressState;
    if (!cleaned.manualAddressZipCode) delete cleaned.manualAddressZipCode;
    if (!cleaned.manualAddressCountry) delete cleaned.manualAddressCountry;
    if (!cleaned.manualPhoneNumber) delete cleaned.manualPhoneNumber;
    return cleaned;
  }

  // @desc Create a new order
  // @route POST /order
  async createOrder(createOrderDto: CreateOrderDto, user: Users) {
    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let address: Address | null = null;
      let phoneNumber: PhoneNumber | null = null;

      if (createOrderDto.addressId) {
        address = await queryRunner.manager.findOne(Address, {
          where: { id: createOrderDto.addressId, user: { id: user.id } },
        });
        if (!address) {
          throw new NotFoundException('Adresse non trouvée.');
        }
      }

      if (createOrderDto.phoneNumberId) {
        phoneNumber = await queryRunner.manager.findOne(PhoneNumber, {
          where: { id: createOrderDto.phoneNumberId, user: { id: user.id } },
        });
        if (!phoneNumber) {
          throw new NotFoundException('Numéro de téléphone non trouvé.');
        }
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

      const order = queryRunner.manager.create(Order, {
        total,
        user,
        items: orderItems,
        address: address,
        phoneNumber: phoneNumber,
        manualAddressStreet: createOrderDto.manualAddress?.street,
        manualAddressCity: createOrderDto.manualAddress?.city,
        manualAddressState: createOrderDto.manualAddress?.state,
        manualAddressZipCode: createOrderDto.manualAddress?.zipCode,
        manualAddressCountry: createOrderDto.manualAddress?.country,
        manualPhoneNumber: createOrderDto.manualPhoneNumber?.phoneNumber,
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
  async findUserOrders(user: Users, query: ProductQueryDto) {
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
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.phoneNumber', 'phoneNumber')
      .where('order.user.id = :userId', { userId: user.id })
      .orderBy('order.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      message: 'Orders retrieved successfully.',
      data: data.map((order) => this.cleanNullFields(order)),
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
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.phoneNumber', 'phoneNumber')
      .leftJoin('order.user', 'user')
      .addSelect(['user.id', 'user.firstName', 'user.lastName', 'user.email'])
      .orderBy('order.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      message: 'Orders retrieved successfully.',
      data: data.map((order) => this.cleanNullFields(order)),
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
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.phoneNumber', 'phoneNumber')
      .leftJoin('order.user', 'user')
      .addSelect(['user.id', 'user.firstName', 'user.lastName', 'user.email'])
      .where('order.id = :orderId', { orderId })
      .getOne();

    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found.`);
    }

    return {
      message: 'Order retrieved successfully.',
      data: this.cleanNullFields(order),
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
  async cancelOrder(orderId: string, user: Users) {
    const order = await this._orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.productVariant', 'productVariant')
      .where('order.id = :orderId', { orderId })
      .andWhere('order.user.id = :userId', { userId: user.id })
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
