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
import { IsNull, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import { UpdateCommentDto } from './dto/update-comment.dto';
import { CreateTvDto } from './dto/create-tv.dto';
import { UpdateTvDto } from './dto/update-tv.dto';
import { TvEntity } from './entities/tv.entity';
import { UserEntity } from '../users/entities/user.entity';
import { TvCommentEntity } from './entities/tvComment.entity';
import { TvCatEntity } from '../tv-cats/entities/tv-cat.entity';
import { TvStatus } from './enum/status.enum';
import { randomId } from 'src/utils/common/randomId';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationSolver } from 'src/utils/common/paginationSolver';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TvService } from './tv.service';

@Injectable({ scope: Scope.REQUEST })
export class TvCommentService {
  constructor(
    @InjectRepository(TvEntity)
    private tvRepository: Repository<TvEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(TvCommentEntity)
    private tvCommentRepository: Repository<TvCommentEntity>,
    @Inject(forwardRef(() => TvService)) private tvService: TvService,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(createComentDto: CreateCommentDto) {
    const { content, parentId, tvId } = createComentDto;
    const { id } = this.request.user!;
    let parent: TvCommentEntity | null = null;

    const tv = await this.tvService.findOne(tvId);
    if (parentId && !isNaN(parentId)) {
      parent = await this.tvCommentRepository.findOneBy({ id: +parentId });
      if (!parent) {
        throw new BadRequestException('کامنت پدر وجود ندارد');
      }
    }

    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new BadRequestException('کاربر یافت نشد');
    }

    this.tvCommentRepository.insert({
      content,
      accepted: false,
      parent: parentId ? { id: parentId } : undefined,
      tv: { id: tv.tv.id },
      user: { id: user.id },
    });

    return {
      message: 'نظر با موفقیت ثبت شد',
    };
  }

  async find(paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);

    const [comments, count] = await this.tvCommentRepository.findAndCount({
      relations: {
        tv: true,
        user: true,
      },
      select: {
        tv: {
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

  async findCommentsOfTv(tvId: number, paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);

    const [comments, count] = await this.tvCommentRepository.findAndCount({
      where: {
        tv: { id: tvId },
        parent: IsNull(),
      },
      relations: {
        tv: true,
        user: true,
        childs: true,
      },
      select: {
        tv: {
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
    const comment = await this.tvCommentRepository.findOneBy({ id });
    if (!comment) {
      throw new NotFoundException('کامنت یافت نشد');
    }
    return comment;
  }


  async findOneDetail(id: number) {
    const comment = await this.tvCommentRepository.findOneBy({ id });
    if (!comment) {
      throw new NotFoundException('کامنت یافت نشد');
    }
    return {comment};
  }

  async accept(id: number) {
    const comment = await this.findOne(id);
    if (comment.accepted) {
      throw new BadRequestException('این کامنت قبلا تایید شده است');
    }
    comment.accepted = true;
    await this.tvCommentRepository.save(comment);

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
    await this.tvCommentRepository.save(comment);

    return {
      message: 'کامنت با موفقیت رد شد',
    };
  }


  async remove(id: number) {
    let comment = await this.tvCommentRepository.findOne({
      where: { id },
    });
    if (!comment) {
      throw new NotFoundException('نظر مورد نظر پیدا نشد');
    }
    await this.tvCommentRepository.delete({ id });
    return {
      message: 'نظر با موفقیت حذف شد',
    };
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    let {
      content,
    } = updateCommentDto;
  
    let comment = await this.tvCommentRepository.findOne({
      where: { id },
    });
  
    if (!comment) {
      throw new NotFoundException('نظر مورد نظر یافت نشد');
    }
  
    if (content) comment.content = content;
  
    await this.tvCommentRepository.save(comment);
  
  
    return {
      message: 'نظر با موفقیت ویرایش شد',
    };
  }


}
