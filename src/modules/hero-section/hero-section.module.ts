import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeroSlide } from './entities/hero-slide.entity';
import { HeroSectionService } from './hero-section.service';
import { HeroSectionController } from './hero-section.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HeroSlide])],
  controllers: [HeroSectionController],
  providers: [HeroSectionService],
  exports: [TypeOrmModule],
})
export class HeroSectionModule {}
