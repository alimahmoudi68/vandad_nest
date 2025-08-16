import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressEntity } from './entities/address.entity';
import { UserEntity } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports:[ AuthModule , TypeOrmModule.forFeature([AddressEntity , UserEntity])],
  controllers: [AddressController],
  providers: [AddressService],
})
export class AddressModule {}
