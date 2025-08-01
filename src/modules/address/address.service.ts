import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressEntity } from './entities/address.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(AddressEntity)
    private addressRepository: Repository<AddressEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async create(createAddressDto: CreateAddressDto) {
    const {
      province,
      city,
      postal_code,
      address,
      receiver_phone,
      description,
      userId,
    } = createAddressDto;
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }
    let newAddress = this.addressRepository.create({
      province,
      city,
      postal_code,
      address,
      receiver_phone,
      description,
      user,
    });
    return await this.addressRepository.save(newAddress);
  }

  async findAll(page: number, limit: number) {
    const take = limit;
    const skip = (page - 1) * limit;
    const [addresses, total] = await this.addressRepository.findAndCount({
      skip,
      take,
      relations: ['user'],
    });
    return {
      addresses,
      total,
    };
  }

  async findOne(id: number) {
    let addresss = await this.addressRepository.findOne({
      where: { id },
    });
    if (!addresss) {
      throw new NotFoundException('آدرس یافت نشد');
    }
    return addresss;
  }

  async update(id: number, updateAddressDto: UpdateAddressDto) {
    const address = await this.addressRepository.findOne({
      where: { id },
    });
    if (!address) {
      throw new NotFoundException('آدرس یافت نشد');
    }
    const {
      province,
      city,
      postal_code,
      address: addressText,
      receiver_phone,
      description,
    } = updateAddressDto;
    address.province = province ?? '';
    address.city = city ?? '';
    address.postal_code = postal_code ?? '';
    address.address = addressText ?? '';
    address.receiver_phone = receiver_phone ?? '';
    address.description = description ?? '';
    await this.addressRepository.save(address);
    return address;
  }

  async remove(id: number) {
    const address = await this.addressRepository.findOne({
      where: { id },
    });
    if (!address) {
      throw new NotFoundException('آدرس یافت نشد');
    }
    return await this.addressRepository.remove(address);
  }
}
