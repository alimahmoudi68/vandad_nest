import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { AdminBlogController } from './adminBlog.controller';
import { BlogEntity } from './entities/blog.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BlogCatEntity } from '../blog-cats/entities/blog-cat.entity';
import { UserEntity } from '../users/entities/user.entity';
import { BlogCommentEntity } from './entities/blogComment.entity';
import { BlogCommentService } from './comment.service';
import { BlogCommentController } from './coment.controller';
import { addUserToReqWOV } from 'src/common/middlewares/addUserToReqWOV.middleWare';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([BlogEntity, BlogCatEntity, UserEntity, BlogCommentEntity]),
  ],
  controllers: [AdminBlogController,BlogController, BlogCommentController],
  providers: [BlogService,  BlogCommentService],
})
export class BlogModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(addUserToReqWOV).forRoutes(":slug");
  }
}
