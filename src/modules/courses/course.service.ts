import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { CourseCommentService } from './comment.service';
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
    private courseCommentService: CourseCommentService,

    private s3Service: S3Service,
  ) {}

  async create(dto: CreateCourseDto) {
    let {
      title,
      keywords_meta,
      description_meta,
      slug,
      content,
      image,
      categories,
      video
    } = dto;

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
      video
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
      where += 'category.slug = LOWER(:cat)';
    }
    const [courses, count] = await this.courseRepo
      .createQueryBuilder('course')
      .leftJoin('course.categories', 'category')
      .leftJoin('course.image', 'image')
      .leftJoin('course.episodes', 'episodes')
      .addSelect([
        'category.id',
        'category.title',
        'image.bucket',
        'image.location',
        'episodes.id',
        'episodes.title',
        'episodes.content',
        'episodes.price',
        'episodes.date',
        'episodes.time',
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
    if (!Number.isFinite(id) || id <= 0) {
      throw new BadRequestException('شناسه دوره نامعتبر است');
    }
    const course = await this.courseRepo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.categories', 'categories')
      .leftJoinAndSelect('course.image', 'image')
      .leftJoinAndSelect('course.episodes', 'episodes')
      .where('course.id = :id', { id })
      .orderBy('episodes.id', 'ASC') // ترتیب قدیمی به جدید (بر اساس date)
      .getOne();

    if (!course) {
      throw new BadRequestException('دوره پیدا نشد');
    }
    return { course };
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
      video
    } = updateCourseDto;

    let course = await this.courseRepo.findOne({
      where: { id },
      relations: ['image'],
    });

    if (!course) {
      throw new NotFoundException('مقاله مورد نظر یافت نشد');
    }

    const selectedCategories = await this.courseCategoryRepository.findBy({
      id: In(categories || []),
    });

    if (title) course.title = title;
    if (keywords_meta) course.keywords_meta = keywords_meta;
    if (description_meta) course.description_meta = description_meta;

    if (slug) {
      const courseSameSlug = await this.checkCourseBySlug(slug);
      if (courseSameSlug && courseSameSlug.id !== id) {
        course.slug = slug += `-${randomId()}`;
      } else {
        course.slug = slug;
      }
    }

    if (content) course.content = content;
    if (video) course.video = video;
    if (categories) course.categories = selectedCategories;

    let previousImage: UploadEntity | null = null;

    if (image && (!course.image || course.image.id !== image)) {
      previousImage = course.image;

      const newImage = await this.uploadRepository.findOneBy({ id: image });
      if (!newImage) {
        throw new NotFoundException('تصویر جدید یافت نشد');
      }

      course.image = newImage;
    }

    // ذخیره مقاله با تصویر جدید
    await this.courseRepo.save(course);

    // حذف تصویر قبلی بعد از قطع ارتباط
    if (previousImage) {
      const previousImageRecord = await this.uploadRepository.findOneBy({
        id: previousImage.id,
      });
      if (previousImageRecord) {
        await this.s3Service.deleteFile(previousImageRecord.location);
        await this.uploadRepository.delete(previousImageRecord.id);
      }
    }

    return {
      message: 'دوره با موفقیت ویرایش شد',
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
      const previousImage = await this.uploadRepository.findOneBy({
        id: blog.image.id,
      });
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

  async findOneDetail(slug: string) {
    const course = await this.courseRepo
      .createQueryBuilder('course')
      .leftJoin('course.categories', 'category')
      .leftJoin('course.image', 'image')
      .leftJoin('course.episodes', 'episode')
      .addSelect([
        'category.id',
        'category.title',
        'image.bucket',
        'image.location',
        'episode.title',
        'episode.content' ,
        'episode.price' ,
        'episode.time' ,
        'episode.date' ,
      ])
      .where({slug})
      .getOne();

    if (!course) {
      throw new NotFoundException('مقاله یافت نشد');
    }

    const commentData = await this.courseCommentService.findCommentsOfCourse(
      course.id,
      { page: 1, limit: 100 },
    );

    return {
      course,
      commentData,
    };
  }
}
