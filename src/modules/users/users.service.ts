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

  async create(createUserDto: CreateUserDto) {
    try {
      const { firstName, lastName, phone, isAdmin } = createUserDto;
      let newUser = this.userRepository.create({
        firstName,
        lastName,
        phone,
        isAdmin,
      });
      return await this.userRepository.save(newUser);
    } catch (err) {
      console.log('frefref');
      throw new BadRequestException('خطا در ایجاد کاربر');
    }
  }

  async findAllAdmin(limit: number, page: number, admin: boolean) {
    const ofset = (page - 1) * limit;

    const query = this.userRepository.createQueryBuilder('users');

    if (admin) {
      query.where('isAdmin = :admin', { admin });
    }

    query.take(limit).skip(ofset);

    return await query.getMany();
  }

  async findOne(id: number) {
    let user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }
    return user;
  }
  
  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findAll(limit: number, page: number, admin: boolean) {
    const ofset = (page - 1) * limit;

    const query = this.userRepository.createQueryBuilder('users');

    if (admin) {
      query.where('isAdmin = :admin', { admin });
    }

    query.take(limit).skip(ofset);

    return await query.getMany();
  }
}
