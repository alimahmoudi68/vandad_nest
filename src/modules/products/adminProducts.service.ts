import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { isArray } from 'class-validator';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
import { CategoryEntity } from '../categories/entities/category.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationSolver } from 'src/utils/common/paginationSolver';
import { UploadEntity } from '../upload/entities/upload.entity';
import { plainToInstance } from 'class-transformer';
import { ProductDto } from './dto/product.dto';
import slugify from 'src/utils/common/slugify';

@Injectable()
export class AdminProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(UploadEntity)
    private readonly uploadRepository: Repository<UploadEntity>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    // تبدیل DTO به any برای پردازش اولیه
    const dto = createProductDto as any;
    
    let {
      title,
      slug,
      price,
      stock,
      sku,
      thumbnail,
      images,
      description,
      categories,
      discount,
      discountPrice,
    } = dto;


    // تبدیل رشته‌های خالی به undefined برای فیلدهای عددی
    if (stock === '' || stock === null) stock = undefined;
    if (thumbnail === '' || thumbnail === null) thumbnail = undefined;
    if (discountPrice === '' || discountPrice === null) discountPrice = undefined;
    if (Array.isArray(images)) {
      images = images.filter(img => img !== '' && img !== null);
    }

    slug = slugify(title);
  
    // Check for duplicate slug
    const existSlug = await this.productRepository.findOne({ where: { slug } });
    if (existSlug) {
      // اگر slug تکراری بود، عدد اضافه کن
      let counter = 1;
      let newSlug = slug;
      while (await this.productRepository.findOne({ where: { slug: newSlug } })) {
        newSlug = `${slug}-${counter}`;
        counter++;
      }
      slug = newSlug;
    }

    
    // تبدیل thumbnail و images به entity
    let imagesEntities: UploadEntity[] = [];
    if (images && Array.isArray(images)) {
      imagesEntities = await this.uploadRepository.findBy({ id: In(images) });
    }
    let thumbnailEntity: UploadEntity | null = null;
    if (thumbnail) {
      thumbnailEntity = await this.uploadRepository.findOneBy({
        id: thumbnail,
      });
    }

    // مقداردهی اولیه محصول
    const newProduct = this.productRepository.create({
      title,
      slug,
      price,
      description,
      stock,
      sku,
      thumbnail: thumbnailEntity || undefined,
      images: imagesEntities,
      discount: !!discount,
      discountPrice: discountPrice || 0,
    });

    // دسته‌بندی‌ها
    if (categories) {
      const categoriesFounded = await this.categoryRepository.findBy({
        id: categories,
      });
      newProduct.categories = categoriesFounded;
    } else {
      newProduct.categories = [];
    }

    // ذخیره محصول
    const savedProduct = await this.productRepository.save(newProduct);

    return plainToInstance(ProductDto, savedProduct, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(
    paginationDto: PaginationDto,
  ) {
    const { limit, page, skip } = paginationSolver(paginationDto);

    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.thumbnail', 'thumbnail')
      .leftJoinAndSelect('product.images', 'images')
      .skip(skip)
      .take(limit);

    const [products, total] = await query.getManyAndCount();

    return {
      products: products.map((product) =>
        plainToInstance(ProductDto, product, {
          excludeExtraneousValues: true,
        }),
      ),
      pagination: {
        total,
        page,
        limit,
      },
    };
  }

  async findOne(id: number) {
    // واکشی محصول با تمام روابط مورد نیاز - استفاده از QueryBuilder برای اطمینان از بارگذاری روابط
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.thumbnail', 'thumbnail')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.id = :id', { id })
      .getOne();

    if (!product) {
      throw new NotFoundException('محصولی پیدا نشد');
    }



    // تبدیل به DTO با تنظیمات صحیح
    const result = plainToInstance(ProductDto, product, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });

    return { product: result };
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    let {
      title,
      slug,
      price,
      stock,
      sku,
      thumbnail,
      images,
      description,
      categories,
      discount,
      discountPrice,
    } = updateProductDto;

    // پیدا کردن محصول
    const product = await this.productRepository.findOne({
      where: { id }
    });
    if (!product) {
      throw new NotFoundException('محصول پیدا نشد');
    }

    // به‌روزرسانی فیلدهای ساده
    if (title !== undefined) product.title = title;
    if (slug !== undefined) product.slug = slug;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (sku !== undefined) product.sku = sku;
    if (description !== undefined) product.description = description;
    if (discount !== undefined) product.discount = discount;
    if (discountPrice !== undefined) product.discountPrice = discountPrice || 0;

    // دسته‌بندی‌ها
    if (categories) {
      if (!isArray(categories) && typeof categories == 'string') {
        categories = categories.split(',');
      }
      const categoriesFounded = await this.categoryRepository.findBy({
        id: In(categories),
      });
      product.categories = categoriesFounded;
    }

    // تصاویر
    if (images && Array.isArray(images)) {
      product.images = await this.uploadRepository.findBy({ id: In(images) });
    }

    // thumbnail
    if (thumbnail) {
      const thumbnailEntity = await this.uploadRepository.findOneBy({
        id: thumbnail,
      });
      if (thumbnailEntity) {
        product.thumbnail = thumbnailEntity;
      }
    }

    // ذخیره نهایی محصول
    const savedProduct = await this.productRepository.save(product);

    // خروجی به صورت ProductDto
    return plainToInstance(ProductDto, savedProduct, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: number) {
    // پیدا کردن محصول با روابط لازم
    const product = await this.productRepository.findOne({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('محصول پیدا نشد');
    }

    // حذف محصول (با توجه به cascade و onDelete، روابط هم حذف می‌شوند)
    await this.productRepository.remove(product);
    return { message: 'محصول با موفقیت حذف شد' };
  }
}
