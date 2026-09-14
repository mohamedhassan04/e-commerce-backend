export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum StatsRange {
  DAYS_7 = '7',
  DAYS_30 = '30',
  DAYS_90 = '90',
  DAYS_365 = '365',
}
