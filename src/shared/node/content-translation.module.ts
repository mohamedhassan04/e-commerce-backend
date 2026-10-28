import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentTranslation } from './content-translation.entity';
import { ContentTranslationService } from './content-translation.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ContentTranslation])],
  providers: [ContentTranslationService],
  exports: [ContentTranslationService],
})
export class ContentTranslationModule {}
