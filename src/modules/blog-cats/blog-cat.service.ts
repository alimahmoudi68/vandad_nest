import { BadRequestException, Injectable } from '@nestjs/common';
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

  findOne(id: number) {
    return `This action returns a #${id} blogCategory`;
  }

  update(id: number, updateBlogCatDto: UpdateBlogCatDto) {
    return `This action updates a #${id} blogCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} blogCategory`;
  }
}
