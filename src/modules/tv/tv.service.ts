import {
  Injectable,
  Scope,
  Inject,
  BadRequestException,
  Search,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { In, Repository } from 'typeorm';

import { CreateTvDto } from './dto/create-tv.dto';
import { UpdateTvDto } from './dto/update-tv.dto';
import { TvEntity } from './entities/tv.entity';
import { TvCatEntity } from '../tv-cats/entities/tv-cat.entity';
import { TvStatus } from './enum/status.enum';
import { randomId } from 'src/utils/common/randomId';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationSolver } from 'src/utils/common/paginationSolver';
import { FilterBlogDto } from 'src/common/dto/filterBlog.dto';
import { TvCommentService } from './comment.service';
import { UploadEntity } from '../upload/entities/upload.entity';
import { S3Service } from '../s3/s3.service';

@Injectable({ scope: Scope.REQUEST })
export class TvService {
  constructor(
    @InjectRepository(TvEntity)
    private tvRepository: Repository<TvEntity>,
    @InjectRepository(UploadEntity)
    private readonly uploadRepository: Repository<UploadEntity>,
    @InjectRepository(TvCatEntity)
    private tvCategoryRepository: Repository<TvCatEntity>,
    @Inject(REQUEST) private request: Request,
    private tvCommentService: TvCommentService,
    private s3Service: S3Service,
  ) {}

  async create(createBlogDto: CreateTvDto) {
    let {
      title,
      keywords_meta,
      description_meta,
      slug,
      content,
      categories,
      image,
      time,
      video_url,
    } = createBlogDto;

    const tvExists = await this.checkTvBySlug(slug);
    if (tvExists) {
      slug += `-${randomId()}`;
    }

    // دریافت دسته‌بندی‌ها بر اساس ID
    const selectedCategories = await this.tvCategoryRepository.findBy({
      id: In(categories || []),
    });

    let uploadEntity: UploadEntity | null = null;
    if (image) {
      uploadEntity = await this.uploadRepository.findOneBy({
        id: image,
      });
    }

    const tv = this.tvRepository.create({
      title,
      slug,
      keywords_meta,
      description_meta,
      content,
      categories: selectedCategories,
      status: TvStatus.Published,
      image: uploadEntity || undefined,
      time,
      video_url,
    });

    await this.tvRepository.save(tv);

    return {
      message: 'ویدیوی جدید با موفقیت ثبت شد',
    };
  }

  async findAll(paginationDto: PaginationDto, filterBlogDto: FilterBlogDto) {
    const { page, limit, skip } = paginationSolver(paginationDto);
    let { cat, q } = filterBlogDto;
    let where = '';
    if (q) {
      if (where.length > 0) where += ' AND ';
      q = `%${q}%`;
      where += 'LOWER(CONCAT(tv.title , tv.content)) LIKE :q'; // البته چون  ای لایک است لازم نیست لاور کیس کنیم
    }
    if (cat) {
      cat = cat.toLocaleLowerCase();
      if (where.length > 0) where += ' AND ';
      where += 'category.title = LOWER(:cat)';
    }

    const [tvs, count] = await this.tvRepository
      .createQueryBuilder('tv')
      .leftJoin('tv.categories', 'category')
      .leftJoin('tv.image', 'image')
      .addSelect([
        'category.id',
        'category.title',
        'image.bucket',
        'image.location',
      ])
      .where(where, { cat, q })
      .loadRelationIdAndMap('tv.comments', 'tv.comments', 'comments', (qb) =>
        qb.where('comments.accepted = :accepted', { accepted: true }),
      )
      .orderBy('tv.id', 'DESC')
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
      tvs,
      pagination: {
        count,
        page,
        limit,
      },
    };
  }

  async findOne(id: number) {
    const tv = await this.tvRepository.findOne({
      where: { id },
      relations: {
        categories: true,
        image: true,
      },
    });
    if (!tv) {
      throw new BadRequestException('ویدیو پیدا پیدا نشد');
    }
    return { tv };
  }

  async update(id: number, updateTvDto: UpdateTvDto) {
    let {
      title,
      keywords_meta,
      description_meta,
      slug,
      content,
      categories,
      image,
      time,
      video_url,
    } = updateTvDto;

    let tv = await this.tvRepository.findOne({
      where: { id },
      relations: ['image'],
    });

    if (!tv) {
      throw new NotFoundException('ویدیو مورد نظر یافت نشد');
    }

    const selectedCategories = await this.tvCategoryRepository.findBy({
      id: In(categories || []),
    });

    if (title) tv.title = title;
    if (keywords_meta) tv.keywords_meta = keywords_meta;
    if (description_meta) tv.description_meta = description_meta;
    if (slug) {
      const tvSameSlug = await this.checkTvBySlug(slug);
      if (tvSameSlug && tvSameSlug.id !== id) {
        tv.slug = slug += `-${randomId()}`;
      } else {
        tv.slug = slug;
      }
    }
    if (content) tv.content = content;
    if (time) tv.time = time;
    if (video_url) tv.video_url = video_url;
    if (categories) tv.categories = selectedCategories;

    let previousImage: UploadEntity | null = null;

    // اگر تصویر جدید با تصویر قبلی فرق دارد، بعد از ذخیره TV تصویر قبلی را پاک کن
    if (image && (!tv.image || tv.image.id !== image)) {
      previousImage = tv.image;

      const newImage = await this.uploadRepository.findOneBy({ id: image });
      if (!newImage) {
        throw new NotFoundException('تصویر جدید یافت نشد');
      }

      tv.image = newImage;
    }

    // ابتدا TV را ذخیره می‌کنیم (تا ارتباط با تصویر جدید برقرار شود)
    await this.tvRepository.save(tv);

    // حالا که ارتباط با تصویر قبلی قطع شده، آن را حذف کن
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
      message: 'ویدیو با موفقیت ویرایش شد',
    };
  }

  async remove(id: number) {
    let tv = await this.tvRepository.findOne({
      where: { id },
      relations: ['image'],
    });
    if (!tv) {
      throw new NotFoundException('ویدیو مورد نظر پیدا نشد');
    }
    if (tv.image) {
      const previousImage = await this.uploadRepository.findOneBy({
        id: tv.image.id,
      });
      if (previousImage) {
        await this.s3Service.deleteFile(previousImage.location);
        await this.uploadRepository.delete(previousImage.id);
      }
    }
    await this.tvRepository.delete({ id });
    return {
      message: 'ویدیو با موفقیت حذف شد',
    };
  }

  async checkTvBySlug(slug: string) {
    const tv = await this.tvRepository.findOne({
      where: { slug },
    });
    return tv;
  }

  async findOneDetail(slug: string) {
    const userId = this.request?.user?.id;
    const tv = await this.tvRepository
      .createQueryBuilder('tv')
      .leftJoin('tv.categories', 'category')
      .addSelect(['category.id', 'category.title'])
      .where({ slug })
      .getOne();

    if (!tv) {
      throw new NotFoundException('ویدیو یافت نشد');
    }

    const commentData = await this.tvCommentService.findCommentsOfTv(tv.id, {
      page: 1,
      limit: 10,
    });

    // let isLiked = false;
    // let isBookmarked = false;
    if (userId && !isNaN(userId) && userId > 0) {
      //isLiked = !!(await this.blogLikeRepository.findOneBy({userId , blogId : blog.id}));
      // isBookmarked = !!(await this.blogBookmarkRepository.findOneBy({userId , blogId : blog.id}));
    }

    // const blogData = {isLiked , isBookmarked , ...blog}
    // return blogData;

    return {
      tv,
      commentData,
    };
  }
}
