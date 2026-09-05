import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeroSection } from './entities/hero-section.entity';
import { HeroImage } from './entities/hero-image.entity';
import { HeroSectionService } from './hero-section.service';
import { HeroSectionController } from './hero-section.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HeroSection, HeroImage])],
  controllers: [HeroSectionController],
  providers: [HeroSectionService],
  exports: [TypeOrmModule],
})
export class HeroSectionModule {}
