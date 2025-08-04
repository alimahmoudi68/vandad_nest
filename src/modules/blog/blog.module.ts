import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { AdminBlogController } from './adminBlog.controller';
import { BlogEntity } from './entities/blog.entity';
import { AuthModule } from '../auth/auth.module';
import { BlogCatEntity } from '../blog-cats/entities/blog-cat.entity';
import { UserEntity } from '../users/entities/user.entity';
import { BlogCommentEntity } from './entities/blogComment.entity';
import { BlogCommentService } from './comment.service';
import { BlogCommentController } from './coment.controller';
import { addUserToReqWOV } from 'src/common/middlewares/addUserToReqWOV.middleWare';
import { UploadModule } from '../upload/upload.module';
import { S3Service } from '../s3/s3.service';



@Module({
  imports: [
    AuthModule,
    UploadModule,
    TypeOrmModule.forFeature([BlogEntity, BlogCatEntity, UserEntity, BlogCommentEntity]),
  ],
  controllers: [AdminBlogController,BlogController, BlogCommentController],
  providers: [BlogService,  BlogCommentService , S3Service],
})
export class BlogModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(addUserToReqWOV).forRoutes(":slug");
  }
}
