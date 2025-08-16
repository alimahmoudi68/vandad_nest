import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AttributeService } from './attribute.service';
import { AttributeController } from './attribute.controller';
import { AttributeMetaController } from './attributeMeta.controller';
import { AttributeMetaService } from './attributeMeta.service';
import { AttributeEntity } from './entities/attribute.entity';
import { AttributeMetaEntity } from './entities/attribute-meta.entity';
import { CategoryEntity } from '../categories/entities/category.entity';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([AttributeEntity, AttributeMetaEntity, CategoryEntity])],
  controllers: [AttributeController, AttributeMetaController],
  providers: [AttributeService, AttributeMetaService],
  exports: [AttributeService],
})
export class AttributeModule {}
