import {
  Injectable,
  Scope,
  Inject,
  BadRequestException,
  Search,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';

import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { UserEntity } from '../users/entities/user.entity';
import { BlogCommentEntity } from './entities/blogComment.entity';
import { IsNull, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationSolver } from 'src/utils/common/paginationSolver';
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
      parent: parentId ? { id: parentId } : undefined,
      blog: { id: blog.blog.id },
      user: { id: user.id },
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

    // const [comments, count] = await this.blogCommentRepository.findAndCount({
    //   where: {
    //     blog: { id: blogId },
    //     accepted: true,
    //     parent: IsNull(),
    //   },
    //   relations: {
    //     blog: true,
    //     user: true,
    //     childs: {
    //       user: true,
    //     },
    //   },
    //   select: {
    //     blog: {
    //       title: true,
    //     },
    //     user: {
    //       firstName: true,
    //       lastName: true,
    //       phone: true,
    //     },
    //     childs: {
    //       id: true,
    //       content: true,
    //       accepted: true,
    //       createdAt: true,
    //       updatedAt: true,
    //       user: {
    //         firstName: true,
    //         lastName: true,
    //         phone: true,
    //       },
    //     },
    //   },
    //   skip,
    //   take: limit,
    //   order: { id: 'DESC' },
    // });

    // // Filter child comments to only include accepted ones
    // const filteredComments = comments.map((comment) => ({
    //   ...comment,
    //   childs: comment.childs.filter((child) => child.accepted),
    // }));


    const [comments, count] = await this.blogCommentRepository
    .createQueryBuilder('comment')
    .leftJoinAndSelect('comment.blog', 'blog')
    .leftJoinAndSelect('comment.user', 'user')
    .leftJoinAndSelect('comment.childs', 'childs', 'childs.accepted = :childAccepted', { childAccepted: true })
    .leftJoinAndSelect('childs.user', 'childUser')
    .where('comment.blogId = :blogId', { blogId })
    .andWhere('comment.accepted = true')
    .andWhere('comment.parentId IS NULL')
    .orderBy('comment.id', 'DESC')
    .skip(skip)
    .take(limit)
    .getManyAndCount();

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

  async findOneDetail(id: number) {
    const comment = await this.blogCommentRepository.findOneBy({ id });
    if (!comment) {
      throw new NotFoundException('کامنت یافت نشد');
    }
    return { comment };
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

  async remove(id: number) {
    let blog = await this.blogCommentRepository.findOne({
      where: { id },
    });
    if (!blog) {
      throw new NotFoundException('نظر مورد نظر پیدا نشد');
    }
    await this.blogCommentRepository.delete({ id });
    return {
      message: 'نظر با موفقیت حذف شد',
    };
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    let { content } = updateCommentDto;

    let comment = await this.blogCommentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('نظر مورد نظر یافت نشد');
    }

    if (content) comment.content = content;

    await this.blogCommentRepository.save(comment);

    return {
      message: 'نظر با موفقیت ویرایش شد',
    };
  }
}
