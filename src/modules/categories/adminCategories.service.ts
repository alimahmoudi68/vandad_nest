import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';
import { ConflictMessage } from 'src/common/enums/messages.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationSolver } from 'src/utils/common/paginationSolver';

@Injectable()
export class AdminCategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    let { title, slug, description, parent } = createCategoryDto;
    title = await this.checkExistAndResolveTitle(title);

    // Check for duplicate slug
    const existSlug = await this.categoryRepository.findOne({
      where: { slug },
    });
    if (existSlug) {
      throw new BadRequestException('اسلاگ دسته بندی تکراری است');
    }

    // مقداردهی parent اگر وجود داشته باشد
    let parentCategory: CategoryEntity | null = null;
    if (parent) {
      parentCategory = await this.categoryRepository.findOneBy({ id: parent });
      if (!parentCategory) {
        throw new NotFoundException('دسته والد پیدا نشد');
      }
    }

    let newCategory = this.categoryRepository.create({
      title,
      slug,
      description,
      parent: parentCategory || undefined,
    });
    const newProduct = await this.categoryRepository.save(newCategory);
    return { product: newProduct };
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);
    
    // ابتدا دسته‌بندی‌هایی که parent آنها null است را می‌گیریم
    const [rootCategories, count] = await this.categoryRepository.findAndCount({
      where: {
        parent: IsNull(),
      },
      relations: {
        childs: true,
      },
      skip,
      take: limit,
    });

    // تبدیل به ساختار سلسله‌مراتبی
    const hierarchicalCategories = rootCategories.map(category => ({
      ...category,
      children: category.childs || [],
    }));

    return {
      categories: hierarchicalCategories,
      pagination: {
        count,
        page,
        limit,
      },
    };
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({
      where: {
        id,
      },
      relations:{
        parent: true,
        childs: true
      }
    });
    if (!category) {
      throw new NotFoundException('دسته بندی مورد نظر پیدا نشد');
    }
    return {category};
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('دسته بندی مورد نظر پیدا نشد');
    }

    let { title, slug, description, parent, attributes } = updateCategoryDto;

    // بررسی تکراری نبودن عنوان
    if (title && title !== category.title) {
      await this.checkExistAndResolveTitle(title);
      category.title = title;
    }

    // بررسی تکراری نبودن اسلاگ
    if (slug && slug !== category.slug) {
      const existSlug = await this.categoryRepository.findOne({
        where: { slug },
      });
      if (existSlug && existSlug.id !== id) {
        throw new BadRequestException('اسلاگ دسته بندی تکراری است');
      }
      category.slug = slug;
    }

    if (description !== undefined) category.description = description;

    // مقداردهی parent اگر وجود داشته باشد
    if (parent !== undefined) {
      if (parent === null) {
        category.parent = null as any;
      } else {
        const parentCategory = await this.categoryRepository.findOneBy({
          id: parent,
        });
        if (!parentCategory) {
          throw new NotFoundException('دسته والد پیدا نشد');
        }
        category.parent = parentCategory;
      }
    }

    await this.categoryRepository.save(category);
    return category;
  }

  async remove(id: number) {
    const { category } = await this.findOne(id);
    
    // ابتدا همه فرزندان را حذف می‌کنیم
    if (category.childs && category.childs.length > 0) {
      for (const child of category.childs) {
        await this.categoryRepository.remove(child);
      }
    }
    
    // سپس دسته‌بندی اصلی را حذف می‌کنیم
    return await this.categoryRepository.remove(category);
  }

  async checkExistAndResolveTitle(title: string) {
    title = title?.trim()?.toLocaleLowerCase();
    const catrgory = await this.categoryRepository.findOneBy({ title });
    if (catrgory) {
      throw new ConflictException(ConflictMessage.CategoryTitle);
    }
    return title;
  }
}
