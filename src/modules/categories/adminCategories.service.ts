import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';
import { ConflictMessage } from 'src/common/enums/messages.enum';
import { AttributeService } from '../attribute/attribute.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationSolver } from 'src/utils/common/paginationSolver';

@Injectable()
export class AdminCategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    private readonly attributeService: AttributeService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    let { title, slug, description, parent, attributes } = createCategoryDto;
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
    // مقداردهی attributes اگر وجود داشته باشد
    let attributeEntities: any[] = [];
    if (attributes && Array.isArray(attributes) && attributes.length > 0) {
      attributeEntities = await Promise.all(
        attributes.map(async (attrId) => {
          const attr = await this.attributeService.findOne(attrId);
          if (!attr || !attr.attribute)
            throw new NotFoundException(`ویژگی با آیدی ${attrId} پیدا نشد`);
          return attr.attribute;
        }),
      );
    }

    let newCategory = this.categoryRepository.create({
      title,
      slug,
      description,
      parent: parentCategory || undefined,
      attributes: attributeEntities,
    });
    const newProduct = await this.categoryRepository.save(newCategory);
    return { product: newProduct };
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);
    const [categories, count] = await this.categoryRepository.findAndCount({
      relations: {
        attributes: {
          metas: true,
        },
      },
      skip,
      take: limit,
    });
    return {
      categories,
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
      relations: {
        attributes: {
          metas: true,
        },
      },
    });
    if (!category) {
      throw new NotFoundException('دسته بندی مورد نظر پیدا نشد');
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: { attributes: true, parent: true },
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

    // مقداردهی attributes اگر وجود داشته باشد
    if (attributes !== undefined) {
      let attributeEntities: any[] = [];
      if (Array.isArray(attributes) && attributes.length > 0) {
        attributeEntities = await Promise.all(
          attributes.map(async (attrId) => {
            const attr = await this.attributeService.findOne(attrId);
            if (!attr || !attr.attribute)
              throw new NotFoundException(`ویژگی با آیدی ${attrId} پیدا نشد`);
            return attr.attribute;
          }),
        );
      }
      category.attributes = attributeEntities;
    }

    await this.categoryRepository.save(category);
    return category;
  }

  async remove(id: number) {
    const category = await this.findOne(id);
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
