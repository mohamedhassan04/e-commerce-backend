import { AuthenticationModule } from 'src/modules/auth/auth.module';
import { CategoryModule } from 'src/modules/category/category.module';
import { HeroSectionModule } from 'src/modules/hero-section/hero-section.module';
import { OrderModule } from 'src/modules/order/order.module';
import { ProductModule } from 'src/modules/product/product.module';
import { PromoPopupModule } from 'src/modules/promo-popup/promo-popup.module';
import { PromoSectionModule } from 'src/modules/promo-section/promo-section.module';
import { StatsModule } from 'src/modules/stats/stats.module';
import { UsersModule } from 'src/modules/users/users.module';

export const AllModules = [
  AuthenticationModule,
  UsersModule,
  ProductModule,
  CategoryModule,
  OrderModule,
  HeroSectionModule,
  PromoPopupModule,
  PromoSectionModule,
  StatsModule,
];
