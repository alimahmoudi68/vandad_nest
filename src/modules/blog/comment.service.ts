import {
  Injectable,
  Scope,
  Inject,
  BadRequestException,
  Search,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { UserEntity } from '../users/entities/user.entity';
import { BlogCommentEntity } from './entities/blogComment.entity';
import { BlogCatEntity } from '../blog-cats/entities/blog-cat.entity';
import { FindOptionsWhere, In, IsNull, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { BlogStatus } from './enum/status.enum';
import { randomId } from 'src/utils/common/randomId';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationSolver } from 'src/utils/common/paginationSolver';
import { FilterBlog } from 'src/common/decorators/filterBlog.decorator';
import { FilterBlogDto } from 'src/common/dto/filterBlog.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { BlogService } from './blog.service';

@Injectable({ scope: Scope.REQUEST })
export class BlogCommentService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(BlogCommentEntity)
    private blogCommentRepository: Repository<BlogCommentEntity>,
    @Inject(forwardRef(() => BlogService)) private blogService: BlogService,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(createComentDto: CreateCommentDto) {
    const { content, parentId, blogId } = createComentDto;
    const { id } = this.request.user!;
    let parent: BlogCommentEntity | null = null;

    const blog = await this.blogService.findOne(blogId);
    if (parentId && !isNaN(parentId)) {
      parent = await this.blogCommentRepository.findOneBy({ id: +parentId });
      if (!parent) {
        throw new BadRequestException('کامنت پدر وجود ندارد');
      }
    }

    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new BadRequestException('کاربر یافت نشد');
    }

    this.blogCommentRepository.insert({
      content,
      accepted: false,
      blog,
      parent: parentId ? (parent as any) : undefined,
      user,
    });

    return {
      message: 'نظر با موفقیت ثبت شد',
    };
  }

  async find(paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);

    const [comments, count] = await this.blogCommentRepository.findAndCount({
      relations: {
        blog: true,
        user: true,
      },
      select: {
        blog: {
          title: true,
        },
        user: {
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
      skip,
      take: limit,
      order: { id: 'DESC' },
    });

    return {
      comments,
      pagination: {
        count,
        page,
        limit,
      },
    };
  }

  async findCommentsOfBlog(blogId: number, paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);

    const [comments, count] = await this.blogCommentRepository.findAndCount({
      where: {
        blog: { id: blogId },
        parent: IsNull(),
      },
      relations: {
        blog: true,
        user: true,
        childs: true,
      },
      select: {
        blog: {
          title: true,
        },
        user: {
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
      skip,
      take: limit,
      order: { id: 'DESC' },
    });

    return {
      comments,
      pagination: {
        count,
        page,
        limit,
      },
    };
  }

  async findOne(id: number) {
    const comment = await this.blogCommentRepository.findOneBy({ id });
    if (!comment) {
      throw new NotFoundException('کامنت یافت نشد');
    }
    return comment;
  }

  async accept(id: number) {
    const comment = await this.findOne(id);
    if (comment.accepted) {
      throw new BadRequestException('این کامنت قبلا تایید شده است');
    }
    comment.accepted = true;
    await this.blogCommentRepository.save(comment);

    return {
      message: 'کامنت با موفقیت تایید شد',
    };
  }

  async reject(id: number) {
    const comment = await this.findOne(id);
    if (!comment.accepted) {
      throw new BadRequestException('این کامنت قبلا رد شده است');
    }
    comment.accepted = false;
    await this.blogCommentRepository.save(comment);

    return {
      message: 'کامنت با موفقیت رد شد',
    };
  }
}
