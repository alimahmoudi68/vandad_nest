import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { In, Repository } from 'typeorm';
import { CategoryEntity } from '../categories/entities/category.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationSolver } from 'src/utils/common/paginationSolver';
import { isArray } from 'class-validator';
import { UploadEntity } from '../upload/entities/upload.entity';
import { plainToInstance } from 'class-transformer';
import { ProductDto } from './dto/product.dto';

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
    } = createProductDto;

    // Check for duplicate slug
    const existSlug = await this.productRepository.findOne({ where: { slug } });
    if (existSlug) {
      throw new BadRequestException('محصولی با این اسلاگ قبلاً ثبت شده است');
    }

    if (!isArray(categories) && typeof categories == 'string') {
      categories = categories.split(',');
    } else if (!categories) {
      throw new BadRequestException('دسته بندی آرایه نیست');
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
      discountPrice: discountPrice ?? 0,
    });

    // دسته‌بندی‌ها
    if (categories) {
      const categoriesFounded = await this.categoryRepository.findBy({
        id: In(categories),
      });
      newProduct.categories = categoriesFounded;
    }

    // مقداردهی اولیه attributes (تبدیل object به آرایه entity) حذف می‌شود و به بعد از ذخیره محصول منتقل می‌شود

    // ذخیره محصول بدون attributes
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
      .leftJoinAndSelect('product.categories', 'category')
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
    // واکشی محصول با تمام روابط مورد نیاز
    const product = await this.productRepository.findOne({
      where: { id },
      relations: [
        'categories',
      ],
    });

    if (!product) {
      throw new NotFoundException('محصولی پیدا نشد');
    }

    // خروجی به صورت ProductDto
    return plainToInstance(ProductDto, product, {
      excludeExtraneousValues: true,
    });
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
    if (discountPrice !== undefined) product.discountPrice = discountPrice;

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
