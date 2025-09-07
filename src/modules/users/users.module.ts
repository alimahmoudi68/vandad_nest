import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { AdminUserService } from './adminUsers.service';
import { UsersController } from './users.controller';
import { AdminUsersController } from './adminUsers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { ProfileEntity } from './entities/profile.entity';
import { UploadEntity } from '../upload/entities/upload.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([UserEntity , ProfileEntity, UploadEntity])],
  controllers: [UsersController , AdminUsersController],
  providers: [UserService, AdminUserService, AuthService],
  exports: [UserService]
})
export class UserModule {}
