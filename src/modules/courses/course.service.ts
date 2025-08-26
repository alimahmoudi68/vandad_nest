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
import { CourseFaqEntity } from './entities/courseFaq.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(CourseEntity)
    private courseRepo: Repository<CourseEntity>,
    @InjectRepository(UploadEntity)
    private readonly uploadRepository: Repository<UploadEntity>,
    @InjectRepository(CourseFaqEntity)
    private readonly courseFaqRepository: Repository<CourseFaqEntity>,
    @InjectRepository(CourseCatEntity)
    private courseCategoryRepository: Repository<CourseCatEntity>,
    private courseCommentService: CourseCommentService,

    private s3Service: S3Service,
  ) {}

  
  async create(dto: CreateCourseDto) {
    const {
      title,
      keywords_meta,
      description_meta,
      slug: rawSlug,
      content,
      image,
      categories,
      video,
      faqs,
    } = dto;
  
    // همه‌چیز داخل یک تراکنش تا نیمه‌کاره ذخیره نشه
    return await this.courseRepo.manager.transaction(async (tm) => {
      let slug = rawSlug;
  
      // یکتا کردن slug
      const courseExists = await tm.getRepository(CourseEntity).exists({ where: { slug } });
      if (courseExists) slug = `${slug}-${randomId()}`;
  
      // گرفتن کتگوری‌های معتبر
      const catRepo = tm.getRepository(CourseCatEntity);
      const selectedCategories = (Array.isArray(categories) && categories.length)
        ? await catRepo.findBy({ id: In(categories) })
        : [];
  
      // اگر ورودی کتگوری داشتیم ولی چیزی پیدا نشد، ارور بده (یا می‌تونی نادیده بگیری)
      if ((categories?.length ?? 0) > 0 && selectedCategories.length === 0) {
        throw new BadRequestException('هیچ دسته‌بندی معتبری پیدا نشد.');
      }
  
      // تصویر انتخابی (nullable)
      const uploadEntity = image
        ? await tm.getRepository(UploadEntity).findOne({ where: { id: image } })
        : null;
  
      // ساخت پیلود کورس بدون اسپرد DTO
      const coursePayload: Partial<CourseEntity> = {
        title,
        slug,
        keywords_meta,
        description_meta,
        content,
        video,
        image: uploadEntity || undefined,
      };
      // فقط اگر دسته‌بندی معتبر داریم ست کن (از ست‌کردن آرایه خالی هم اشکالی نیست، اما شرطی امن‌تره)
      if (selectedCategories.length) {
        coursePayload.categories = selectedCategories;
      }
  
      // ساخت و ذخیره کورس
      const courseRepo = tm.getRepository(CourseEntity);
      const course = courseRepo.create(coursePayload);
      const savedCourse = await courseRepo.save(course);
  
      // ساخت و ذخیره‌ی FAQها (فقط question و answer؛ هیچ فیلد دیگری را عبور نده)
      if (Array.isArray(faqs) && faqs.length) {
        const faqRepo = tm.getRepository(CourseFaqEntity);
  
        // فقط آیتم‌های معتبر را نگه دار
        const cleanFaqs = faqs
          .filter((f) => f && typeof f.question === 'string' && typeof f.answer === 'string')
          .map((f) =>
            faqRepo.create({
              question: f.question.trim(),
              answer: f.answer.trim(),
              course: savedCourse,
            }),
          );
  
        if (cleanFaqs.length) {
          await faqRepo.save(cleanFaqs);
        }
      }
  
      return { message: 'دوره جدید با موفقیت ثبت شد', id: savedCourse.id };
    });
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
      .leftJoinAndSelect('course.faqs', 'faqs')
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
      video,
      faqs
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

    if (faqs !== undefined) {
      // 1. پیدا کردن تمام FAQهای قبلی دوره
      const existingFaqs = await this.courseFaqRepository.find({
        where: { course: { id: course.id } },
      });
    
      // 2. حذف همه FAQهای قبلی
      if (existingFaqs.length > 0) {
        await this.courseFaqRepository.remove(existingFaqs);
      }
    
      // 3. اضافه کردن FAQهای جدید (اگر وجود دارند)
      if (faqs.length > 0) {
        const newFaqs = faqs.map(f =>
          this.courseFaqRepository.create({
            question: f.question,
            answer: f.answer,
            course: course,
          }),
        );
        await this.courseFaqRepository.save(newFaqs);
      }
    }
    
    

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
      .leftJoin('course.faqs', 'faq')
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
        'faq.id',
        'faq.question',
        'faq.answer',
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
