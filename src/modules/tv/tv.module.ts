import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TvService } from './tv.service';
import { TvController } from './tv.controller';
import { AdminTvController } from './adminTv.controller';
import { TvEntity } from './entities/tv.entity';
import { AuthModule } from '../auth/auth.module';
import { TvCatEntity } from '../tv-cats/entities/tv-cat.entity';
import { UserEntity } from '../users/entities/user.entity';
import { TvCommentEntity } from './entities/tvComment.entity';
import { TvCommentService } from './comment.service';
import { TvCommentController } from './coment.controller';
import { AdminTvCommentController } from './adminComent.controller';
import { UploadModule } from '../upload/upload.module';
import { S3Service } from '../s3/s3.service';



@Module({
  imports: [
    AuthModule,
    UploadModule,
    TypeOrmModule.forFeature([TvEntity, TvCatEntity, UserEntity, TvCommentEntity]),
  ],
  controllers: [AdminTvController, TvController, TvCommentController, AdminTvCommentController],
  providers: [TvService,  TvCommentService , S3Service],
})
export class TvModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
  }
}
