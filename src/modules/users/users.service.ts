import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Repository } from 'typeorm';


import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}


  async findOne(id: number) {
    let user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }
    return user;
  }


  async getProfile(id: number) {
    let user = await this.userRepository.findOne({
      where: { id },
      relations:{
        avatar: true
      }
    });
    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }
    return {profile : user};
  }
  
  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }



}
