import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ProfileDto } from './dto/profile.dto';
import { ProfileEntity } from './entities/profile.entity';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
  ) {}

  // مبنای سرویس ها
  // ترای کچ نمیخواد چون مدیریت خطا اضافه کردیم
  async create(createUserDto: CreateUserDto) {
    const { firstName, lastName, phone, isAdmin } = createUserDto;
    let userExisted = await this.userRepository.findOne({
      where: {
        phone,
      },
    });

    if (userExisted) {
      throw new BadRequestException(
        'قبلا کاربری با این شماره موبایل اضافه شده است',
      );
    }

    let newUser = this.userRepository.create({
      firstName,
      lastName,
      phone,
      isAdmin,
    });
    return await this.userRepository.save(newUser);
  }

  async findAll(limit: number, page: number, admin: number) {
    const offset = (page - 1) * limit;
    const query = this.userRepository.createQueryBuilder('users');

    if (admin == 1) {
      query.where('users.isAdmin = :admin', { admin: true });
    } else {
      query.where('users.isAdmin = :admin', { admin: false });
    }

    const [users, total] = await query
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return { users, total };
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

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.userRepository.update(id, {
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
      phone: updateUserDto.phone,
      isAdmin: updateUserDto.isAdmin,
    });
    return await this.findOne(id);
  }

  async createProfile(profileDto: ProfileDto) {
    const { instagram, userId } = profileDto;

    let user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('کاربر پیدا نشد');
    }

    if (!user.profile) {
      let newProfile = this.profileRepository.create({
        instagram,
      });
      newProfile.user = user;
      await this.profileRepository.save(newProfile);
    } else {
      let profileExisted = await this.profileRepository.findOneBy({
        user: { id: userId },
      });
      if (profileExisted) {
        profileExisted.instagram = instagram ?? '';
        await this.profileRepository.save(profileExisted);
      }
    }

    return user;
  }

  //مقایسه کلی:
  //delete(id): مستقیماً یک رکورد را بر اساس id حذف می‌کند، اما شیء حذف‌شده را برنمی‌گرداند.
  //remove(entity): برای حذف نیاز به یک شیء دارد و پس از حذف، شیء حذف‌شده را برمی‌گرداند.
  async remove(id: number) {
    const reslult = await this.userRepository.delete(id);
    if (reslult.affected == 0) {
      throw new NotFoundException('کاربر یافت نشد');
    }
  }
}
