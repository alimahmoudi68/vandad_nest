import { Module } from '@nestjs/common';
import { AdminProductsService } from './adminProducts.service';
import { ProductsService } from './products.service';
import { AdminProductsController } from './adminProducts.controller';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { CategoryEntity } from '../categories/entities/category.entity';
import { UserEntity } from '../users/entities/user.entity';
import { UploadModule } from '../upload/upload.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity, CategoryEntity, UserEntity]),
    UploadModule,
    CategoriesModule,
  ],
  controllers: [AdminProductsController, ProductsController],
  providers: [AdminProductsService, ProductsService],
})
export class ProductsModule {}
