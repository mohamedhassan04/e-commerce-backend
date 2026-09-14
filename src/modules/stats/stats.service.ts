import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from 'src/modules/order/entities/order.entity';
import { OrderItem } from 'src/modules/order/entities/order-item.entity';
import { Users } from 'src/modules/users/entities/user.entity';
import { StatsRange } from 'src/shared/enum/enum.type';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Order)
    private readonly _orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly _orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Users)
    private readonly _userRepo: Repository<Users>,
  ) {}

  async getDashboardStats(range: StatsRange) {
    const days = Number(range);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const [revenueResult, orderCount, statusCounts, dailyRevenue, bestSellers, recentOrders, neverViewed, newCustomers] =
      await Promise.all([
        this._getRevenue(cutoff),
        this._getOrderCount(cutoff),
        this._getStatusCounts(cutoff),
        this._getDailyRevenue(days, cutoff),
        this._getBestSellers(cutoff),
        this._getRecentOrders(),
        this._getNeverViewed(),
        this._getNewCustomers(cutoff),
      ]);

    const activeOrders = orderCount - statusCounts.filter((s) => s.status === 'CANCELLED').reduce((a, s) => a + s.count, 0);
    const avgOrderValue = activeOrders > 0 ? revenueResult / activeOrders : 0;

    return {
      revenue: Number(revenueResult) || 0,
      orderCount: activeOrders,
      avgOrderValue: Math.round(avgOrderValue),
      newCustomers,
      neverViewed,
      dailyRevenue,
      statusCounts,
      bestSellers,
      recentOrders,
    };
  }

  private async _getRevenue(cutoff: Date): Promise<number> {
    const result = await this._orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.total), 0)', 'sum')
      .where('o.createdAt >= :cutoff', { cutoff })
      .andWhere("o.status != 'CANCELLED'")
      .getRawOne();
    return Number(result?.sum ?? 0);
  }

  private async _getOrderCount(cutoff: Date): Promise<number> {
    return this._orderRepo
      .createQueryBuilder('o')
      .where('o.createdAt >= :cutoff', { cutoff })
      .getCount();
  }

  private async _getStatusCounts(cutoff: Date) {
    return this._orderRepo
      .createQueryBuilder('o')
      .select('o.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('o.createdAt >= :cutoff', { cutoff })
      .groupBy('o.status')
      .getRawMany();
  }

  private async _getDailyRevenue(days: number, cutoff: Date) {
    const raw = await this._orderRepo
      .createQueryBuilder('o')
      .select("TO_CHAR(o.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect("COALESCE(SUM(CASE WHEN o.status != 'CANCELLED' THEN o.total ELSE 0 END), 0)", 'total')
      .where('o.createdAt >= :cutoff', { cutoff })
      .groupBy("TO_CHAR(o.createdAt, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(o.createdAt, 'YYYY-MM-DD')", 'ASC')
      .getRawMany();

    const map = new Map(raw.map((r: any) => [r.date, Number(r.total)]));

    const result: { date: string; total: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      result.push({ date: key, total: map.get(key) ?? 0 });
    }
    return result;
  }

  private async _getBestSellers(cutoff: Date) {
    return this._orderItemRepo
      .createQueryBuilder('oi')
      .innerJoin('oi.order', 'o')
      .innerJoin('oi.productVariant', 'pv')
      .innerJoin('pv.product', 'p')
      .select('p.id', 'productId')
      .addSelect('p.name', 'productName')
      .addSelect('SUM(oi.quantity)', 'qty')
      .addSelect('SUM(oi.price * oi.quantity)', 'revenue')
      .where('o.createdAt >= :cutoff', { cutoff })
      .andWhere("o.status != 'CANCELLED'")
      .groupBy('p.id')
      .addGroupBy('p.name')
      .orderBy('SUM(oi.quantity)', 'DESC')
      .limit(5)
      .getRawMany();
  }

  private async _getRecentOrders() {
    return this._orderRepo
      .createQueryBuilder('o')
      .leftJoin('o.user', 'u')
      .select('o.id', 'id')
      .addSelect('o.orderNumber', 'orderNumber')
      .addSelect('o.total', 'total')
      .addSelect('o.status', 'status')
      .addSelect('o.createdAt', 'placedAt')
      .addSelect('o.guestFirstName', 'guestFirstName')
      .addSelect('o.guestLastName', 'guestLastName')
      .addSelect('u.firstName', 'userFirstName')
      .addSelect('u.lastName', 'userLastName')
      .orderBy('o.createdAt', 'DESC')
      .limit(6)
      .getRawMany()
      .then((rows) =>
        rows.map((r) => ({
          id: r.id,
          orderNumber: r.orderNumber,
          customerName: r.userFirstName
            ? `${r.userFirstName} ${r.userLastName}`
            : `${r.guestFirstName} ${r.guestLastName}`,
          total: Number(r.total ?? 0),
          status: r.status,
          placedAt: r.placedAt,
        })),
      );
  }

  private async _getNeverViewed(): Promise<number> {
    const result = await this._orderRepo
      .createQueryBuilder('o')
      .select('COUNT(*)', 'count')
      .where("o.status = 'PENDING'")
      .getRawOne();
    return Number(result?.count ?? 0);
  }

  private async _getNewCustomers(cutoff: Date): Promise<number> {
    const result = await this._userRepo
      .createQueryBuilder('u')
      .select('COUNT(*)', 'count')
      .where('u.createdAt >= :cutoff', { cutoff })
      .andWhere("u.role != 'ADMIN'")
      .getRawOne();
    return Number(result?.count ?? 0);
  }
}
