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

  async createOrder(createOrderDto: CreateOrderDto, user: Users) {
    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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
      });

      const savedOrder = await queryRunner.manager.save(Order, order);
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

  async findUserOrders(user: Users, query: ProductQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this._orderRepo.findAndCount({
      where: { user: { id: user.id } },
      relations: [
        'items',
        'items.productVariant',
        'items.productVariant.product',
      ],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

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

  async findAllOrders(query: ProductQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this._orderRepo.findAndCount({
      relations: [
        'items',
        'items.productVariant',
        'items.productVariant.product',
        'user',
      ],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

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

  async findOrderById(orderId: string) {
    const order = await this._orderRepo.findOne({
      where: { id: orderId },
      relations: [
        'items',
        'items.productVariant',
        'items.productVariant.product',
        'user',
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found.`);
    }

    return {
      message: 'Order retrieved successfully.',
      data: order,
    };
  }

  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this._orderRepo.findOne({ where: { id: orderId } });

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

  async cancelOrder(orderId: string, user: Users) {
    const order = await this._orderRepo.findOne({
      where: { id: orderId, user: { id: user.id } },
      relations: ['items', 'items.productVariant'],
    });

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
