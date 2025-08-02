import { Module } from '@nestjs/common';
import { BlogCategoryService } from './blog-cat.service';
import { BlogCategoryController } from './blog-cat.controller';
import { BlogCatEntity } from './entities/blog-cat.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports:[AuthModule , TypeOrmModule.forFeature([BlogCatEntity])],
  controllers: [BlogCategoryController],
  providers: [BlogCategoryService],
  exports: [BlogCategoryService],
})
export class BlogCategoryModule {}
