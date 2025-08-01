import { Module } from '@nestjs/common';
import { AdminProductsService } from './adminProducts.service';
import { AdminProductsController } from './adminProducts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { UploadModule } from '../upload/upload.module';
import { CategoriesModule } from '../categories/categories.module';
import { AttributeEntity } from '../attribute/entities/attribute.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, AttributeEntity]), UploadModule, CategoriesModule],
  controllers: [AdminProductsController],
  providers: [AdminProductsService],
})
export class ProductsModule {}
