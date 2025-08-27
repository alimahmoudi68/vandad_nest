import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { CategoryEntity } from '../categories/entities/category.entity';
import { UserEntity } from '../users/entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationSolver } from 'src/utils/common/paginationSolver';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepositor: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @Inject(REQUEST) private request: Request,
  ) {}

  async findAll(paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);
    const [products, total] = await this.productRepositor.findAndCount({
      skip,
      take: limit,
      relations: ['categories'],
    });
    return {
      products,
      pagination: {
        total,
        page,
        limit,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.productRepositor.findOne({
      where: {
        id,
      },
      relations: ['categories'],
    });

    if (!product) {
      throw new NotFoundException('محصولی پیدا نشد');
    }

    return product;
  }

}
