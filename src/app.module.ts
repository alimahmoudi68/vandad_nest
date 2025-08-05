import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from './config/typeorm.config';
import { UserModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { ErrorModule } from './modules/error/error.module';
import { CustomConfigModule } from './modules/config/config.module';
import { JwtModule } from '@nestjs/jwt';
import { AddressModule } from './modules/address/address.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BlogModule } from './modules/blog/blog.module';
import { BlogCategoryModule } from './modules/blog-cats/blog-cat.module';
import { UploadModule } from './modules/upload/upload.module';
import { AttributeModule } from './modules/attribute/attribute.module';
import { CourseModule } from './modules/courses/course.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { TvCategoryModule } from './modules/tv-cats/tv-cat.module';
import { TvModule } from './modules/tv/tv.module';
import { EpisodeModule } from './modules/episodes/episode.module';
import { CourseCategoryModule } from './modules/course-cats/course-cat.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: join(process.cwd(), '.env'),
      isGlobal: true,
    }),
    CustomConfigModule,
    TypeOrmModule.forRoot(TypeOrmConfig()),
    UserModule,
    AuthModule,
    JwtModule,
    ErrorModule,
    AddressModule,
    TicketsModule,
    ProductsModule,
    CategoriesModule,
    BlogModule,
    BlogCategoryModule,
    UploadModule,
    AttributeModule,
    CourseModule,
    InvoiceModule,
    TvCategoryModule,
    TvModule,
    EpisodeModule,
    CourseCategoryModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
