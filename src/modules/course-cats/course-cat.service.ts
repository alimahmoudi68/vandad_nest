import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateCourseCatDto } from './dto/create-course-cat.dto';
import { UpdateCourseCatDto } from './dto/update-course-cat.dto';
import { CourseCatEntity } from './entities/course-cat.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CourseCategoryService {

  constructor(
     @InjectRepository(CourseCatEntity)
      private courseCatRepository: Repository<CourseCatEntity>,
  ){}

  
  async create(createCourseCatDto: CreateCourseCatDto) {
    let { title , slug} = createCourseCatDto;

    const courseCatExists = await this.courseCatRepository.findOneBy({title});
    if (courseCatExists) {
      throw new BadRequestException("عنوان دسته بندی تکراری است");
    }

    const blogCat = this.courseCatRepository.create({
      title,
      slug
    });

    await this.courseCatRepository.save(blogCat);

    return {
      message: 'دسته بندی جدید با موفقیت ثبت شد',
    };
  }

  async findAll() {
    const categories = await this.courseCatRepository.find({});
    return {
      categories,
    };
  }

  async findOne(id: number) {
    const category = await this.courseCatRepository.findOne({
      where: {
        id,
      },
    });
    if (!category) {
      throw new NotFoundException('دسته بندی مورد نظر پیدا نشد');
    }
    return {category};
  }

  async update(id: number, updateCourseCatDto: UpdateCourseCatDto) {
    const category = await this.courseCatRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('دسته بندی مورد نظر پیدا نشد');
    }

    let { title , slug } = updateCourseCatDto;

    if(title){
      category.title = title;
    }

    // بررسی تکراری نبودن اسلاگ
    if (slug && slug !== category.slug) {
      const existSlug = await this.courseCatRepository.findOne({
        where: { slug },
      });
      if (existSlug && existSlug.id !== id) {
        throw new BadRequestException('اسلاگ دسته بندی تکراری است');
      }
      category.slug = slug;
    }

    await this.courseCatRepository.save(category);
    return {category};

  }

  async remove(id: number) {
    const reslult = await this.courseCatRepository.delete(id);
    if (reslult.affected == 0) {
      throw new NotFoundException('دسته بندی یافت نشد');
    }
  }
}
