import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoPopup } from './entities/promo-popup.entity';
import { PromoPopupService } from './promo-popup.service';
import { PromoPopupController } from './promo-popup.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PromoPopup])],
  controllers: [PromoPopupController],
  providers: [PromoPopupService],
  exports: [TypeOrmModule],
})
export class PromoPopupModule {}
