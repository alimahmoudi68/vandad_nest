import { Module } from '@nestjs/common';
import { TvCategoryService } from './tv-cat.service';
import { TvCategoryController } from './tv-cat.controller';
import { TvCatEntity } from './entities/tv-cat.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports:[AuthModule , TypeOrmModule.forFeature([TvCatEntity])],
  controllers: [TvCategoryController],
  providers: [TvCategoryService],
  exports: [TvCategoryService],
})
export class TvCategoryModule {}
