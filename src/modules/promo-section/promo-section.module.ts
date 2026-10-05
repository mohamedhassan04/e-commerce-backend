import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoSection } from './entities/promo-section.entity';
import { PromoSectionService } from './promo-section.service';
import { PromoSectionController } from './promo-section.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PromoSection])],
  controllers: [PromoSectionController],
  providers: [PromoSectionService],
  exports: [TypeOrmModule],
})
export class PromoSectionModule {}
