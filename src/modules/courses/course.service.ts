import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';


import { CourseCatEntity } from '../course-cats/entities/course-cat.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationSolver } from 'src/utils/common/paginationSolver';
import { FilterBlogDto } from 'src/common/dto/filterBlog.dto';
import { randomId } from 'src/utils/common/randomId';
import { CourseEntity } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UploadEntity } from '../upload/entities/upload.entity';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(CourseEntity)
    private courseRepo: Repository<CourseEntity>,
    @InjectRepository(UploadEntity)
    private readonly uploadRepository: Repository<UploadEntity>,
    @InjectRepository(CourseCatEntity)
    private courseCategoryRepository: Repository<CourseCatEntity>,
    private s3Service: S3Service
  ) {}

  async create(dto: CreateCourseDto) {

    let { title, keywords_meta, description_meta , slug, content, image , categories } = dto;


    const courseExists = await this.checkCourseBySlug(slug);
    if (courseExists) {
      slug += `-${randomId()}`;
    }

    const selectedCategories = await this.courseCategoryRepository.findBy({
      id: In(categories || []),
    });


    let uploadEntity: UploadEntity | null = null;
    if (image) {
      uploadEntity = await this.uploadRepository.findOneBy({
        id: image,
      });
    }

    const course = this.courseRepo.create({
      title,
      slug,
      keywords_meta,
      description_meta,
      content,
      categories: selectedCategories,
      image: uploadEntity || undefined,
    });

    await this.courseRepo.save(course);

    return {
      message: 'دوره جدید با موفقیت ثبت شد',
    };

   
  }

  async findAll(paginationDto: PaginationDto, filterBlogDto: FilterBlogDto) {
      const { page, limit, skip } = paginationSolver(paginationDto);
      let { cat, q } = filterBlogDto;
      let where = '';
      if (q) {
        if (where.length > 0) where += ' AND ';
        q = `%${q}%`;
        where += 'LOWER(CONCAT(course.title , course.content)) LIKE :q'; // البته چون  ای لایک است لازم نیست لاور کیس کنیم
      }
      if (cat) {
        cat = cat.toLocaleLowerCase();
        if (where.length > 0) where += ' AND ';
        where += 'category.title = LOWER(:cat)';
      }
      const [courses, count] = await this.courseRepo
        .createQueryBuilder('course')
        .leftJoin('course.categories', 'category')
        .leftJoin('course.image', 'image')
        .addSelect([
          'category.id',
          'category.title',
          'image.bucket',
          'image.location',
        ])
        .where(where, { cat, q })
        .loadRelationIdAndMap(
          'course.comments',
          'course.comments',
          'comments',
          (qb) => qb.where('comments.accepted = :accepted', { accepted: true }),
        )
        .orderBy('course.id', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();
  
      return {
        courses,
        pagination: {
          count,
          page,
          limit,
        },
      };
  }


  async findOne(id: number) {
    const course = await this.courseRepo.findOne({ 
      where : { id } ,
      relations : {
        categories : true ,
        image : true
      } 
    });
    if (!course) {
      throw new BadRequestException('دوره پیدا پیدا نشد');
    }
    return {course};
  }

  async checkCourseBySlug(slug: string) {
    const course = await this.courseRepo.findOne({
      where: { slug },
    });
    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    let {
      title,
      keywords_meta,
      description_meta,
      slug,
      content,
      categories,
      image,
    } = updateCourseDto;
  
    let blog = await this.courseRepo.findOne({
      where: { id },
      relations: ['image'],
    });
  
    if (!blog) {
      throw new NotFoundException('مقاله مورد نظر یافت نشد');
    }
  
    const selectedCategories = await this.courseCategoryRepository.findBy({
      id: In(categories || []),
    });
  
    if (title) blog.title = title;
    if (keywords_meta) blog.keywords_meta = keywords_meta;
    if (description_meta) blog.description_meta = description_meta;
  
    if (slug) {
      const blogSameSlug = await this.checkCourseBySlug(slug);
      if (blogSameSlug && blogSameSlug.id !== id) {
        blog.slug = slug += `-${randomId()}`;
      } else {
        blog.slug = slug;
      }
    }
  
    if (content) blog.content = content;
    if (categories) blog.categories = selectedCategories;
  
    let previousImage: UploadEntity | null = null;
  
    if (image && (!blog.image || blog.image.id !== image)) {
      previousImage = blog.image;
  
      const newImage = await this.uploadRepository.findOneBy({ id: image });
      if (!newImage) {
        throw new NotFoundException('تصویر جدید یافت نشد');
      }
  
      blog.image = newImage;
    }
  
    // ذخیره مقاله با تصویر جدید
    await this.courseRepo.save(blog);
  
    // حذف تصویر قبلی بعد از قطع ارتباط
    if (previousImage) {
      const previousImageRecord = await this.uploadRepository.findOneBy({ id: previousImage.id });
      if (previousImageRecord) {
        await this.s3Service.deleteFile(previousImageRecord.location);
        await this.uploadRepository.delete(previousImageRecord.id);
      }
    }
  
    return {
      message: 'مقاله با موفقیت ویرایش شد',
    };
  }
  
  
    async remove(id: number) {
      let blog = await this.courseRepo.findOne({
        where: { id },
        relations: ['image'], 
      });
      if (!blog) {
        throw new NotFoundException('دوره مورد نظر پیدا نشد');
      }
      if (blog.image) {
        const previousImage = await this.uploadRepository.findOneBy({ id: blog.image.id });
        if (previousImage) {
          await this.s3Service.deleteFile(previousImage.location);
          await this.uploadRepository.delete(previousImage.id);
        }
      }
      await this.courseRepo.delete({ id });
      return {
        message: 'دوره با موفقیت حذف شد',
      };
    }

}
