import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';


import { UpdateProfileDto } from './dto/update-profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UploadEntity } from '../upload/entities/upload.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(UploadEntity)
    private uploadRepository: Repository<UploadEntity>,
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
  
  async updateProfile(id: number , updateProfileDto: UpdateProfileDto) {
    let user = await this.userRepository.findOne({
      where: { id },
      relations:{
        avatar: true
      }
    });

    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    const { firstName, lastName, about, avatar } = updateProfileDto;

    // Update basic fields
    user.firstName = firstName;
    user.lastName = lastName;
    user.about = about;

    // Optionally update avatar relation
    if (typeof avatar === 'number') {
      const foundUpload = await this.uploadRepository.findOne({ where: { id: avatar } });
      if (!foundUpload) {
        throw new NotFoundException('تصویر مورد نظر یافت نشد');
      }
      user.avatar = foundUpload;
    }

    const savedUser = await this.userRepository.save(user);
    return { profile: savedUser };
  }



}
