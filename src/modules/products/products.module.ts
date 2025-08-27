import { Module } from '@nestjs/common';
import { AdminProductsService } from './adminProducts.service';
import { AdminProductsController } from './adminProducts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { UploadModule } from '../upload/upload.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]), UploadModule, CategoriesModule],
  controllers: [AdminProductsController],
  providers: [AdminProductsService],
})
export class ProductsModule {}
