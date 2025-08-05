import {
  Injectable,
  Scope,
  Inject,
  BadRequestException,
  Search,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseEntity } from './entities/course.entity';
import { UserEntity } from '../users/entities/user.entity';
import { CourseCommentEntity } from './entities/courseComment.entity';
import { IsNull, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationSolver } from 'src/utils/common/paginationSolver';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CourseService } from './course.service';

@Injectable({ scope: Scope.REQUEST })
export class CourseCommentService {
  constructor(
    @InjectRepository(CourseEntity)
    private courseRepository: Repository<CourseEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(CourseCommentEntity)
    private courseCommentRepository: Repository<CourseCommentEntity>,
    @Inject(forwardRef(() => CourseService)) private courseService: CourseService,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(createComentDto: CreateCommentDto) {
    const { content, parentId, blogId } = createComentDto;
    const { id } = this.request.user!;
    let parent: CourseCommentEntity | null = null;

    const course = await this.courseService.findOne(blogId);
    if (parentId && !isNaN(parentId)) {
      parent = await this.courseCommentRepository.findOneBy({ id: +parentId });
      if (!parent) {
        throw new BadRequestException('کامنت پدر وجود ندارد');
      }
    }

    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new BadRequestException('کاربر یافت نشد');
    }

    this.courseCommentRepository.insert({
      content,
      accepted: false,
      parent: parentId ? { id: parentId } : undefined,
      course: { id: course.course.id },
      user: { id: user.id },
    });

    return {
      message: 'نظر با موفقیت ثبت شد',
    };
  }

  async find(paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);

    const [comments, count] = await this.courseCommentRepository.findAndCount({
      relations: {
        course: true,
        user: true,
      },
      select: {
        course: {
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

    const [comments, count] = await this.courseCommentRepository.findAndCount({
      where: {
        course: { id: blogId },
        parent: IsNull(),
      },
      relations: {
        course: true,
        user: true,
        childs: true,
      },
      select: {
        course: {
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
    const comment = await this.courseCommentRepository.findOneBy({ id });
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
    await this.courseCommentRepository.save(comment);

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
    await this.courseCommentRepository.save(comment);

    return {
      message: 'کامنت با موفقیت رد شد',
    };
  }
}
