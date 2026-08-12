export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum ClientStatus {
  ACTIVE = 'O',
  INACTIVE = 'N',
}

export enum ProductStock {
  LOW_STOCK = 'stock_faible',
  IN_STOCK = 'en_stock',
  OUT_OF_STOCK = 'rupture_de_stock',
}

export enum OrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  READY = 'ready',
  SERVED = 'served',
}

export enum DeliveryWith {
  'SELF_DELIVERY' = 'Retrait au magasin',
  'CDG' = 'Par CDG',
}

export enum Tag {
  'ARRIVAGE' = 'ARRIVAGE',
  'PROMO' = 'PROMO',
  'INFO' = 'INFO',
}

export enum LoginAttemptStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
