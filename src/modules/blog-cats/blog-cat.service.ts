import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateBlogCatDto } from './dto/create-blog-cat.dto';
import { UpdateBlogCatDto } from './dto/update-blog-cat.dto';
import { BlogCatEntity } from './entities/blog-cat.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BlogCategoryService {

  constructor(
     @InjectRepository(BlogCatEntity)
      private blogCatRepository: Repository<BlogCatEntity>,
  ){}

  
  async create(createBlogCatDto: CreateBlogCatDto) {
    let { title , slug} = createBlogCatDto;

    const blogCatExists = await this.blogCatRepository.findOneBy({title});
    if (blogCatExists) {
      throw new BadRequestException("عنوان دسته بندی تکراری است");
    }

    const blogCat = this.blogCatRepository.create({
      title,
      slug
    });

    await this.blogCatRepository.save(blogCat);

    return {
      message: 'دسته بندی جدید با موفقیت ثبت شد',
    };
  }

  async findAll() {
    const categories = await this.blogCatRepository.find({});
    return {
      categories,
    };
  }

  async findOne(id: number) {
    const category = await this.blogCatRepository.findOne({
      where: {
        id,
      },
    });
    if (!category) {
      throw new NotFoundException('دسته بندی مورد نظر پیدا نشد');
    }
    return {category};
  }

  async update(id: number, updateBlogCatDto: UpdateBlogCatDto) {
    const category = await this.blogCatRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('دسته بندی مورد نظر پیدا نشد');
    }

    let { title , slug } = updateBlogCatDto;

    if(title){
      category.title = title;
    }

    // بررسی تکراری نبودن اسلاگ
    if (slug && slug !== category.slug) {
      const existSlug = await this.blogCatRepository.findOne({
        where: { slug },
      });
      if (existSlug && existSlug.id !== id) {
        throw new BadRequestException('اسلاگ دسته بندی تکراری است');
      }
      category.slug = slug;
    }

    await this.blogCatRepository.save(category);
    return {category};

  }

  async remove(id: number) {
    const reslult = await this.blogCatRepository.delete(id);
    if (reslult.affected == 0) {
      throw new NotFoundException('دسته بندی یافت نشد');
    }
  }
}
