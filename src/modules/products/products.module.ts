import { Module } from '@nestjs/common';
import { AdminProductsService } from './adminProducts.service';
import { ProductsService } from './products.service';
import { AdminProductsController } from './adminProducts.controller';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { UploadModule } from '../upload/upload.module';
import { CategoriesModule } from '../categories/categories.module';
import { AttributeEntity } from '../attribute/entities/attribute.entity';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([ProductEntity, AttributeEntity]), UploadModule, CategoriesModule],
  controllers: [AdminProductsController, ProductsController],
  providers: [AdminProductsService, ProductsService],
})
export class ProductsModule {}
