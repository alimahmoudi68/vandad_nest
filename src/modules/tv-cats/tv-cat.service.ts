import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateTvCatDto } from './dto/create-tv-cat.dto';
import { UpdateTvCatDto } from './dto/update-tv-cat.dto';
import { TvCatEntity } from './entities/tv-cat.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TvCategoryService {

  constructor(
     @InjectRepository(TvCatEntity)
      private tvCatRepository: Repository<TvCatEntity>,
  ){}

  
  async create(createBlogCatDto: CreateTvCatDto) {
    let { title , slug} = createBlogCatDto;

    const tvCatExists = await this.tvCatRepository.findOneBy({title});
    if (tvCatExists) {
      throw new BadRequestException("عنوان دسته بندی تکراری است");
    }

    const tvCat = this.tvCatRepository.create({
      title,
      slug
    });

    await this.tvCatRepository.save(tvCat);

    return {
      message: 'دسته بندی جدید با موفقیت ثبت شد',
    };
  }

  async findAll() {
    const categories = await this.tvCatRepository.find({});
    return {
      categories,
    };
  }

  async findOne(id: number) {
    const category = await this.tvCatRepository.findOne({
      where: {
        id,
      },
    });
    if (!category) {
      throw new NotFoundException('دسته بندی مورد نظر پیدا نشد');
    }
    return {category};
  }

  async update(id: number, updateTvCatDto: UpdateTvCatDto) {
    const category = await this.tvCatRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('دسته بندی مورد نظر پیدا نشد');
    }

    let { title , slug } = updateTvCatDto;

    if(title){
      category.title = title;
    }

    // بررسی تکراری نبودن اسلاگ
    if (slug && slug !== category.slug) {
      const existSlug = await this.tvCatRepository.findOne({
        where: { slug },
      });
      if (existSlug && existSlug.id !== id) {
        throw new BadRequestException('اسلاگ دسته بندی تکراری است');
      }
      category.slug = slug;
    }

    await this.tvCatRepository.save(category);
    return {category};

  }

  async remove(id: number) {
    const reslult = await this.tvCatRepository.delete(id);
    if (reslult.affected == 0) {
      throw new NotFoundException('دسته بندی یافت نشد');
    }
  }
}
