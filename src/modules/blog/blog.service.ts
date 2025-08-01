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
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BlogStatus } from './enum/status.enum';
import { randomId } from 'src/utils/common/randomId';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationSolver } from 'src/utils/common/paginationSolver';
import { FilterBlog } from 'src/common/decorators/filterBlog.decorator';
import { FilterBlogDto } from 'src/common/dto/filterBlog.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { BlogCommentService } from './comment.service';

@Injectable({ scope: Scope.REQUEST })
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(BlogCatEntity)
    private blogCategoryRepository: Repository<BlogCatEntity>,
    @Inject(REQUEST) private request: Request,
    private blogCommentService: BlogCommentService,
  ) {}

  async create(createBlogDto: CreateBlogDto) {
    let { title, slug, content, categories, timeStudy } = createBlogDto;

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

    const blog = this.blogRepository.create({
      title,
      slug,
      content,
      author,
      categories: selectedCategories, // 👈 اینجا آبجکت‌ها را پاس می‌دیم
      status: BlogStatus.Draft,
      time_study: timeStudy,
    });

    await this.blogRepository.save(blog);

    return {
      message: 'بلاگ جدید با موفقیت ثبت شد',
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
      where += 'category.title = LOWER(:cat)';
    }

    const [blogs, count] = await this.blogRepository
      .createQueryBuilder('blog')
      .leftJoin('blog.categories', 'category')
      .leftJoin('blog.author', 'author')
      .addSelect([
        'category.id',
        'category.title',
        'author.firstName',
        'author.lastName',
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
    const blog = await this.blogRepository.findOneBy({ id });
    if (!blog) {
      throw new BadRequestException('مقاله پیدا پیدا نشد');
    }
    return blog;
  }

  async update(id: number, updateBlogDto: UpdateBlogDto) {
    let { title, slug, content, timeStudy, categories } = updateBlogDto;
    let blog = await this.blogRepository.findOneBy({ id });
    if (!blog) {
      throw new NotFoundException('مقاله مورد نظر یافت نشد');
    }

    const selectedCategories = await this.blogCategoryRepository.findBy({
      id: In(categories || []),
    });

    if (title) blog.title = title;
    if (slug) {
      const blogSameSlug = await this.checkBlogBySlug(slug);
      if (blogSameSlug && blogSameSlug.id !== id) {
        blog.slug = slug += `-${randomId()}`;
      } else {
        blog.slug = slug;
      }
    }
    if (content) blog.content = content;
    if (timeStudy) blog.time_study = timeStudy;
    if (categories) blog.categories = selectedCategories;
    await this.blogRepository.save(blog);
    return {
      MESSAGE: 'مقاله با موفقیت ویرایش شد',
    };
  }

  async remove(id: number) {
    const blog = await this.blogRepository.findOneBy({ id });
    if (!blog) {
      throw new NotFoundException('مقاله مورد نظر پیدا نشد');
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
      .addSelect([
        'category.id',
        'category.title',
        'author.firstName',
        'author.lastName',
      ])
      .where({ slug })
      .loadRelationCountAndMap('blog.likedUsersCount', 'blog.likedUsers')
      .getOne();

    if (!blog) {
      throw new NotFoundException('مقاله یافت نشد');
    }

    const commentData = await this.blogCommentService.findCommentsOfBlog(
      blog.id,
      { page: 1, limit: 10 },
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
