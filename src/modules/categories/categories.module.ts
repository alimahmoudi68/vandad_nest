import { Module } from '@nestjs/common';
import { AdminCategoriesService } from './adminCategories.service';
import { AdminCategoriesController } from './adminCategories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { AttributeModule } from '../attribute/attribute.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ AuthModule, TypeOrmModule.forFeature([CategoryEntity]), AttributeModule],
  controllers: [AdminCategoriesController],
  providers: [AdminCategoriesService],
  exports: [TypeOrmModule]
})
export class CategoriesModule {}
