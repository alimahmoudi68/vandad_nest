import {
  Injectable,
  Scope,
  Inject,
  BadRequestException,
  Search,
  NotFoundException,
} from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { UserEntity } from '../users/entities/user.entity';
import { BlogCatEntity } from '../blog-cats/entities/blog-cat.entity';
import { In, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BlogStatus } from './enum/status.enum';
import { randomId } from 'src/utils/common/randomId';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationSolver } from 'src/utils/common/paginationSolver';
import { FilterBlogDto } from 'src/common/dto/filterBlog.dto';
import { BlogCommentService } from './comment.service';
import { UploadEntity } from '../upload/entities/upload.entity';
import { S3Service } from '../s3/s3.service';

@Injectable({ scope: Scope.REQUEST })
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
    @InjectRepository(UploadEntity)
    private readonly uploadRepository: Repository<UploadEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(BlogCatEntity)
    private blogCategoryRepository: Repository<BlogCatEntity>,
    @Inject(REQUEST) private request: Request,
    private blogCommentService: BlogCommentService,
    private s3Service: S3Service,
  ) {}

  async create(createBlogDto: CreateBlogDto) {
    let {
      title,
      keywords_meta,
      description_meta,
      slug,
      content,
      categories,
      image,
    } = createBlogDto;

    // بررسی اینکه بلاگ با این slug قبلاً وجود دارد یا نه
    const blogExists = await this.checkBlogBySlug(slug);
    if (blogExists) {
      slug += `-${randomId()}`;
    }

    const author = this.request.user;

    // دریافت دسته‌بندی‌ها بر اساس ID
    const selectedCategories = await this.blogCategoryRepository.findBy({
      id: In(categories || []),
    });

    let uploadEntity: UploadEntity | null = null;
    if (image) {
      console.log('32');
      uploadEntity = await this.uploadRepository.findOneBy({
        id: image,
      });
    }

    // calc time study
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const time_study = Math.ceil(wordCount / wordsPerMinute);

    const blog = this.blogRepository.create({
      title,
      slug,
      keywords_meta,
      description_meta,
      content,
      author,
      categories: selectedCategories, // 👈 اینجا آبجکت‌ها را پاس می‌دیم
      status: BlogStatus.Published,
      time_study: String(time_study),
      image: uploadEntity || undefined,
    });

    await this.blogRepository.save(blog);

    return {
      message: 'مقاله جدید با موفقیت ثبت شد',
    };
  }

  async findAll(paginationDto: PaginationDto, filterBlogDto: FilterBlogDto) {
    const { page, limit, skip } = paginationSolver(paginationDto);
    let { cat, q } = filterBlogDto;
    let where = '';
    if (q) {
      if (where.length > 0) where += ' AND ';
      q = `%${q}%`;
      where += 'LOWER(CONCAT(blog.title , blog.content)) LIKE :q'; // البته چون  ای لایک است لازم نیست لاور کیس کنیم
    }
    if (cat) {
      cat = cat.toLocaleLowerCase();
      if (where.length > 0) where += ' AND ';
      where += 'category.slug = LOWER(:cat)';
    }

    const [blogs, count] = await this.blogRepository
      .createQueryBuilder('blog')
      .leftJoin('blog.categories', 'category')
      .leftJoin('blog.author', 'author')
      .leftJoin('blog.image', 'image')
      .addSelect([
        'category.id',
        'category.title',
        'category.slug',
        'author.firstName',
        'author.lastName',
        'image.bucket',
        'image.location',
      ])
      .where(where, { cat, q })
      .loadRelationCountAndMap('blog.likedUsersCount', 'blog.likedUsers')
      .loadRelationIdAndMap(
        'blog.comments',
        'blog.comments',
        'comments',
        (qb) => qb.where('comments.accepted = :accepted', { accepted: true }),
      )
      .orderBy('blog.id', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // const [blogs, count] = await this.blogRepository.findAndCount({
    //   relations: {
    //     categories: true
    //   },
    //   where,
    //   order: {
    //     id: 'DESC',
    //   },
    //   skip,
    //   take: limit,
    // });
    return {
      blogs,
      pagination: {
        count,
        page,
        limit,
      },
    };
  }

  async findOne(id: number) {
    const blog = await this.blogRepository.findOne({
      where: { id },
      relations: {
        categories: true,
        image: true,
      },
    });
    if (!blog) {
      throw new BadRequestException('مقاله پیدا پیدا نشد');
    }
    return { blog };
  }

  async update(id: number, updateBlogDto: UpdateBlogDto) {
    let {
      title,
      keywords_meta,
      description_meta,
      slug,
      content,
      categories,
      image,
    } = updateBlogDto;

    let blog = await this.blogRepository.findOne({
      where: { id },
      relations: ['image'],
    });

    if (!blog) {
      throw new NotFoundException('مقاله مورد نظر یافت نشد');
    }

    const selectedCategories = await this.blogCategoryRepository.findBy({
      id: In(categories || []),
    });

    if (title) blog.title = title;
    if (keywords_meta) blog.keywords_meta = keywords_meta;
    if (description_meta) blog.description_meta = description_meta;

    if (slug) {
      const blogSameSlug = await this.checkBlogBySlug(slug);
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
    await this.blogRepository.save(blog);

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
      message: 'مقاله با موفقیت ویرایش شد',
    };
  }

  async remove(id: number) {
    let blog = await this.blogRepository.findOne({
      where: { id },
      relations: ['image'],
    });
    if (!blog) {
      throw new NotFoundException('مقاله مورد نظر پیدا نشد');
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
    await this.blogRepository.delete({ id });
    return {
      message: 'مقاله با موفقیت حذف شد',
    };
  }

  async checkBlogBySlug(slug: string) {
    const blog = await this.blogRepository.findOne({
      where: { slug },
    });
    return blog;
  }

  async like(blogId: number) {
    const { id: userId } = this.request.user!;

    // گرفتن مقاله به همراه لیست افرادی که لایک کردند
    const blog = await this.blogRepository.findOne({
      where: { id: blogId },
      relations: ['likedUsers'],
    });

    if (!blog) {
      throw new NotFoundException('مقاله مورد نظر پیدا نشد');
    }

    // گرفتن کاربر
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('کاربر پیدا نشد');
    }

    // بررسی اینکه آیا کاربر قبلاً این مقاله را لایک کرده یا نه
    const hasLiked = blog.likedUsers.some((u) => u.id === userId);

    if (hasLiked) {
      // اگر قبلاً لایک کرده، لایک را حذف کن
      blog.likedUsers = blog.likedUsers.filter((u) => u.id !== userId);
    } else {
      // اگر لایک نکرده بود، لایک را اضافه کن
      blog.likedUsers.push(user);
    }

    // ذخیره تغییرات
    await this.blogRepository.save(blog);

    return {
      liked: !hasLiked,
      message: hasLiked ? 'لایک حذف شد' : 'لایک شد',
    };
  }

  async findOneDetail(slug: string) {
    const userId = this.request?.user?.id;
    const blog = await this.blogRepository
      .createQueryBuilder('blog')
      .leftJoin('blog.categories', 'category')
      .leftJoin('blog.author', 'author')
      .leftJoin('blog.image', 'image')
      .addSelect([
        'category.id',
        'category.title',
        'author.firstName',
        'author.lastName',
        'image.bucket',
        'image.location',
      ])
      .where({ slug })
      .loadRelationCountAndMap('blog.likedUsersCount', 'blog.likedUsers')
      .getOne();

    if (!blog) {
      throw new NotFoundException('مقاله یافت نشد');
    }

    const commentData = await this.blogCommentService.findCommentsOfBlog(
      blog.id,
      { page: 1, limit: 100 },
    );

    // let isLiked = false;
    // let isBookmarked = false;
    if (userId && !isNaN(userId) && userId > 0) {
      //isLiked = !!(await this.blogLikeRepository.findOneBy({userId , blogId : blog.id}));
      // isBookmarked = !!(await this.blogBookmarkRepository.findOneBy({userId , blogId : blog.id}));
    }

    // const blogData = {isLiked , isBookmarked , ...blog}
    // return blogData;

    return {
      blog,
      commentData,
    };
  }
}
