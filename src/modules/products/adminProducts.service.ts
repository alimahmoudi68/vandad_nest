import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
import { AttributeEntity } from '../attribute/entities/attribute.entity';
import { ProductAttributeEntity } from './entities/product-attribute.entity';
import { ProductVariantEntity } from './entities/product-variant.entity';
import { ProductVariantAttributeEntity } from './entities/product-variant-attribute.entity';

@Injectable()
export class AdminProductsService {

  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository : Repository<ProductEntity> ,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository : Repository<CategoryEntity>,
    @InjectRepository(UploadEntity)
    private readonly uploadRepository: Repository<UploadEntity>,
    @InjectRepository(AttributeEntity)
    private readonly attributeRepository: Repository<AttributeEntity>
  ){}

  /**
   * محاسبه قیمت‌های محصول بر اساس واریانت‌ها
   */
  private calculateProductPricesFromVariants(variantPrices: number[]): { minPrice: number, maxPrice: number, basePrice: number } {
    if (variantPrices.length === 0) {
      return { minPrice: 0, maxPrice: 0, basePrice: 0 };
    }
    
    const minPrice = Math.min(...variantPrices);
    const maxPrice = Math.max(...variantPrices);
    const basePrice = minPrice; // قیمت پایه = کمترین قیمت واریانت
    
    return { minPrice, maxPrice, basePrice };
  }

  
  async create(createProductDto: CreateProductDto) {
    let {
      title,
      slug,
      price,
      maxPrice,
      minPrice,
      stock,
      sku,
      thumbnail,
      images,
      description,
      categories,
      isVariant,
      attributes,
      variants,
      discount,
      discountPrice
    } = createProductDto;

    // Check for duplicate slug
    const existSlug = await this.productRepository.findOne({ where: { slug } });
    if (existSlug) {
      throw new BadRequestException('محصولی با این اسلاگ قبلاً ثبت شده است');
    }

    if (!isArray(categories) && typeof categories == "string") {
      categories = categories.split(",");
    } else if (!categories) {
      throw new BadRequestException("دسته بندی آرایه نیست");
    }

    // تبدیل thumbnail و images به entity
    let imagesEntities: UploadEntity[] = [];
    if (images && Array.isArray(images)) {
      imagesEntities = await this.uploadRepository.findBy({ id: In(images) });
    }
    let thumbnailEntity: UploadEntity | undefined = undefined;
    if (thumbnail) {
      const foundThumb = await this.uploadRepository.findOneBy({ id: thumbnail });
      if (!foundThumb) {
        throw new BadRequestException('تصویر بندانگشتی پیدا نشد');
      }
      thumbnailEntity = foundThumb;
    }

    // --- چک مجاز بودن attribute و meta بر اساس دسته‌بندی ---
    let allowedAttributes: string[] = [];
    let allowedMetas: number[] = [];
    if (categories) {
      const categoryId = Number(categories[0]); // اگر فقط یکی داری
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
        relations: { attributes: { metas: true } }
      });
      if (!category) throw new BadRequestException('دسته‌بندی پیدا نشد');
      allowedAttributes = category.attributes.map(attr => attr.slug);
      allowedMetas = category.attributes.reduce((acc, attr) => {
        attr.metas.forEach(meta => acc.push(meta.id));
        return acc;
      }, [] as number[]);
    }

    // چک attributes اصلی محصول
    if (categories && attributes) {
      Object.entries(attributes).forEach(([attrSlug, metaId]) => {
        if (!allowedAttributes.includes(attrSlug)) {
          throw new BadRequestException(`ویژگی ${attrSlug} برای این دسته‌بندی مجاز نیست`);
        }
        if (!allowedMetas.includes(Number(metaId))) {
          throw new BadRequestException(`متا با id ${metaId} برای ویژگی ${attrSlug} مجاز نیست`);
        }
      });
    }

    // چک attributes و metas واریانت‌ها
    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        const variantAttrs = variant.attributes;
        if (variantAttrs) {
          Object.entries(variantAttrs).forEach(([attrSlug, metaId]) => {
            if (!allowedAttributes.includes(attrSlug)) {
              throw new BadRequestException(`ویژگی ${attrSlug} برای این دسته‌بندی (در واریانت) مجاز نیست`);
            }
            if (!allowedMetas.includes(Number(metaId))) {
              throw new BadRequestException(`متا با id ${metaId} برای ویژگی ${attrSlug} (در واریانت) مجاز نیست`);
            }
          });
        }
      }
    }
    // --- پایان چک ---

    // مقداردهی اولیه محصول
    const newProduct = this.productRepository.create({
      title,
      slug,
      price,
      minPrice,
      maxPrice,
      description,
      stock,
      sku,
      thumbnail: thumbnailEntity,
      images: imagesEntities,
      isVariant: !!isVariant,
      discount: !!discount,
      discountPrice: discountPrice ?? 0
    });

    // دسته‌بندی‌ها
    if (categories) {
      const categoriesFounded = await this.categoryRepository.findBy({ id: In(categories) });
      newProduct.categories = categoriesFounded;
    }

    // مقداردهی اولیه attributes (تبدیل object به آرایه entity) حذف می‌شود و به بعد از ذخیره محصول منتقل می‌شود

    // ذخیره محصول بدون attributes
    const savedProduct = await this.productRepository.save(newProduct);

    // ساخت و ذخیره attributes بعد از ذخیره محصول
    if (attributes) {
      const attributeSlugs = Object.keys(attributes);
      const attributeEntities = await this.attributeRepository.find({
        where: { slug: In(attributeSlugs) }
      });

      const productAttributes = attributeEntities.map(attrEntity =>
        this.productRepository.manager.create(ProductAttributeEntity, {
          attribute: attrEntity,
          product: savedProduct,
          attributeMeta: { id: Number(attributes[attrEntity.slug]) }
        })
      ) as ProductAttributeEntity[];

      await this.productRepository.manager.save(ProductAttributeEntity, productAttributes);
      savedProduct.attributes = productAttributes;
    }

    // ذخیره variants
    if (variants && Array.isArray(variants)) {
      const variantEntities: ProductVariantEntity[] = [];
      const variantPrices: number[] = [];
      
      for (const variant of variants) {
        const { attributes: variantAttrs, price, stock, sku, discount, discountPrice, images } = variant;

        // ساخت و ذخیره واریانت
        const variantEntity = this.productRepository.manager.create(ProductVariantEntity, {
          product: savedProduct,
          price,
          stock,
          sku,
          discount: discount ?? false,
          discountPrice: discountPrice ?? 0,
        });

        // ذخیره واریانت تا id داشته باشد
        const savedVariant = await this.productRepository.manager.save(ProductVariantEntity, variantEntity) as ProductVariantEntity;

        // اضافه کردن تصاویر واریانت
        if (images && Array.isArray(images) && images.length > 0) {
          const variantImages = await this.uploadRepository.findBy({ id: In(images) });
          savedVariant.images = variantImages;
          await this.productRepository.manager.save(ProductVariantEntity, savedVariant);
        }

        // ساخت ویژگی‌های واریانت
        const variantAttrEntities: ProductVariantAttributeEntity[] = [];
        if (variantAttrs) {
          for (const [attrSlug, metaId] of Object.entries(variantAttrs)) {
            // پیدا کردن AttributeEntity
            const attrEntity = await this.attributeRepository.findOne({ where: { slug: attrSlug } });
            if (!attrEntity) continue;

            const variantAttrEntity = this.productRepository.manager.create(ProductVariantAttributeEntity, {
              variant: savedVariant,
              attribute: attrEntity,
              attributeMeta: { id: Number(metaId) }
            }) as ProductVariantAttributeEntity;
            variantAttrEntities.push(variantAttrEntity);
          }
          // ذخیره ویژگی‌های واریانت
          await this.productRepository.manager.save(ProductVariantAttributeEntity, variantAttrEntities);
          savedVariant.attributes = variantAttrEntities;
        }

        variantEntities.push(savedVariant);
        variantPrices.push(price);
      }
      
      // محاسبه minPrice و maxPrice بر اساس واریانت‌ها
      if (variantPrices.length > 0) {
        const { minPrice, maxPrice, basePrice } = this.calculateProductPricesFromVariants(variantPrices);
        
        // به‌روزرسانی قیمت‌های محصول اصلی
        savedProduct.minPrice = minPrice;
        savedProduct.maxPrice = maxPrice;
        savedProduct.price = basePrice;
        
        await this.productRepository.save(savedProduct);
      }
      
      savedProduct.variants = variantEntities;
    }

    return plainToInstance(ProductDto, savedProduct, { excludeExtraneousValues: true });
  }

  async findAll(paginationDto: PaginationDto, attributeFilters: Record<string, any>) {
    const { limit, page, skip } = paginationSolver(paginationDto);
  
    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'category')
      .leftJoinAndSelect('category.attributes', 'categoryAttribute')
      .leftJoinAndSelect('product.variants', 'variant')
      .leftJoinAndSelect('variant.attributes', 'variantAttribute')
      .leftJoinAndSelect('variantAttribute.attribute', 'variantAttr')
      .leftJoinAndSelect('variantAttribute.attributeMeta', 'variantAttrMeta')
      .leftJoinAndSelect('variant.images', 'variantImages')
      .leftJoinAndSelect('product.attributes', 'productAttribute')
      .leftJoinAndSelect('productAttribute.attribute', 'productAttributeEntity')
      .leftJoinAndSelect('productAttribute.attributeMeta', 'productAttributeMeta')
      .skip(skip)
      .take(limit);
  
    const [products, total] = await query.getManyAndCount();

    // جمع‌آوری همه attributeIdهای یکتا از همه دسته‌بندی‌های محصولات
    const allAttributeIds = Array.from(new Set(
      products.flatMap(product =>
        product.categories.flatMap(category =>
          category.attributes.map(attr => attr.id)
        )
      )
    ));

    // گرفتن همه attributeها با metas فقط با یک کوئری
    const attributesWithMetas = await this.attributeRepository.find({
      where: { id: In(allAttributeIds) },
      relations: ['metas'],
    });
    const attrIdToFullAttr = Object.fromEntries(
      attributesWithMetas.map(attr => [attr.id, attr])
    );

    // جایگزینی metas کامل برای هر attribute
    for (const product of products) {
      for (const category of product.categories) {
        for (const attribute of category.attributes) {
          attribute.metas = attrIdToFullAttr[attribute.id]?.metas || [];
        }
      }
    }

    // لاگ برای بررسی مقدار واقعی metas قبل از mapping
    if (products.length > 0 && products[0].categories.length > 0 && products[0].categories[0].attributes.length > 0) {
      console.log('metas sample:', JSON.stringify(products[0].categories[0].attributes[0].metas, null, 2));
    }

    return {
      products: products.map(product =>
        plainToInstance(ProductDto, product, {
          excludeExtraneousValues: true,
        })
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
        'categories.attributes',
        'categories.attributes.metas',
        'variants',
        'variants.attributes',
        'variants.attributes.attribute',
        'variants.attributes.attributeMeta',
        'variants.images',
        'attributes',
        'attributes.attribute',
        'attributes.attributeMeta',
      ],
    });

    if (!product) {
      throw new NotFoundException('محصولی پیدا نشد');
    }

    // جمع‌آوری همه attributeIdهای یکتا از همه دسته‌بندی‌های محصول
    const allAttributeIds = Array.from(new Set(
      product.categories.flatMap(category =>
        category.attributes.map(attr => attr.id)
      )
    ));

    // گرفتن همه attributeها با metas فقط با یک کوئری
    const attributesWithMetas = await this.attributeRepository.find({
      where: { id: In(allAttributeIds) },
      relations: ['metas'],
    });
    const attrIdToFullAttr = Object.fromEntries(
      attributesWithMetas.map(attr => [attr.id, attr])
    );

    // جایگزینی metas کامل برای هر attribute
    for (const category of product.categories) {
      for (const attribute of category.attributes) {
        attribute.metas = attrIdToFullAttr[attribute.id]?.metas || [];
      }
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
      maxPrice,
      minPrice,
      stock,
      sku,
      thumbnail,
      images,
      description,
      categories,
      isVariant,
      attributes,
      variants,
      discount,
      discountPrice
    } = updateProductDto;

    // پیدا کردن محصول
    const product = await this.productRepository.findOne({
      where: { id },
      relations: [
        'attributes',
        'variants',
        'variants.attributes'
      ]
    });
    if (!product) {
      throw new NotFoundException('محصول پیدا نشد');
    }

    // به‌روزرسانی فیلدهای ساده
    if (title !== undefined) product.title = title;
    if (slug !== undefined) product.slug = slug;
    if (price !== undefined) product.price = price;
    if (minPrice !== undefined) product.minPrice = minPrice;
    if (maxPrice !== undefined) product.maxPrice = maxPrice;
    if (stock !== undefined) product.stock = stock;
    if (sku !== undefined) product.sku = sku;
    if (description !== undefined) product.description = description;
    if (isVariant !== undefined) product.isVariant = isVariant;
    if (discount !== undefined) product.discount = discount;
    if (discountPrice !== undefined) product.discountPrice = discountPrice;

    // دسته‌بندی‌ها
    if (categories) {
      if (!isArray(categories) && typeof categories == "string") {
        categories = categories.split(",");
      }
      const categoriesFounded = await this.categoryRepository.findBy({ id: In(categories) });
      product.categories = categoriesFounded;
    }

    // تصاویر
    if (images && Array.isArray(images)) {
      product.images = await this.uploadRepository.findBy({ id: In(images) });
    }

    // thumbnail
    if (thumbnail) {
      const foundThumb = await this.uploadRepository.findOneBy({ id: thumbnail });
      if (!foundThumb) {
        throw new BadRequestException('تصویر بندانگشتی پیدا نشد');
      }
      product.thumbnail = foundThumb;
    }

    // حذف ویژگی‌های قبلی محصول
    if (product.attributes && product.attributes.length > 0) {
      await this.productRepository.manager.delete('ProductAttributeEntity', { product: { id: product.id } });
    }

    // ایجاد ویژگی‌های جدید محصول
    if (attributes) {
      const attributeSlugs = Object.keys(attributes);
      const attributeEntities = await this.attributeRepository.find({
        where: { slug: In(attributeSlugs) }
      });

      const productAttributes = attributeEntities.map(attrEntity =>
        this.productRepository.manager.create(ProductAttributeEntity, {
          attribute: attrEntity,
          product: product,
          attributeMeta: { id: Number(attributes[attrEntity.slug]) }
        })
      ) as ProductAttributeEntity[];

      await this.productRepository.manager.save(ProductAttributeEntity, productAttributes);
      product.attributes = productAttributes;
    }

    // حذف واریانت‌های قبلی
    if (product.variants && product.variants.length > 0) {
      await this.productRepository.manager.delete('ProductVariantEntity', { product: { id: product.id } });
    }

    // ایجاد واریانت‌های جدید
    if (variants && Array.isArray(variants)) {
      const variantEntities: ProductVariantEntity[] = [];
      const variantPrices: number[] = [];
      
      for (const variant of variants) {
        const { attributes: variantAttrs, price, stock, sku, discount, discountPrice, images } = variant;

        // ساخت و ذخیره واریانت
        const variantEntity = this.productRepository.manager.create(ProductVariantEntity, {
          product: product,
          price,
          stock,
          sku,
          discount: discount ?? false,
          discountPrice: discountPrice ?? 0,
        });

        const savedVariant = await this.productRepository.manager.save(ProductVariantEntity, variantEntity) as ProductVariantEntity;

        // اضافه کردن تصاویر واریانت
        if (images && Array.isArray(images) && images.length > 0) {
          const variantImages = await this.uploadRepository.findBy({ id: In(images) });
          savedVariant.images = variantImages;
          await this.productRepository.manager.save(ProductVariantEntity, savedVariant);
        }

        // ساخت ویژگی‌های واریانت
        const variantAttrEntities: ProductVariantAttributeEntity[] = [];
        if (variantAttrs) {
          for (const [attrSlug, metaId] of Object.entries(variantAttrs)) {
            const attrEntity = await this.attributeRepository.findOne({ where: { slug: attrSlug } });
            if (!attrEntity) continue;

            const variantAttrEntity = this.productRepository.manager.create(ProductVariantAttributeEntity, {
              variant: savedVariant,
              attribute: attrEntity,
              attributeMeta: { id: Number(metaId) }
            }) as ProductVariantAttributeEntity;
            variantAttrEntities.push(variantAttrEntity);
          }
          await this.productRepository.manager.save(ProductVariantAttributeEntity, variantAttrEntities);
          savedVariant.attributes = variantAttrEntities;
        }

        variantEntities.push(savedVariant);
        variantPrices.push(price);
      }
      
      // محاسبه minPrice و maxPrice بر اساس واریانت‌ها
      if (variantPrices.length > 0) {
        const { minPrice, maxPrice, basePrice } = this.calculateProductPricesFromVariants(variantPrices);
        
        // به‌روزرسانی قیمت‌های محصول اصلی
        product.minPrice = minPrice;
        product.maxPrice = maxPrice;
        product.price = basePrice;
      }
      
      product.variants = variantEntities;
    }

    // ذخیره نهایی محصول
    const savedProduct = await this.productRepository.save(product);

    // خروجی به صورت ProductDto
    return plainToInstance(ProductDto, savedProduct, { excludeExtraneousValues: true });
  }

  async remove(id: number) {
    // پیدا کردن محصول با روابط لازم
    const product = await this.productRepository.findOne({
      where: { id },
      relations: [
        'attributes',
        'variants',
        'variants.attributes',
      ],
    });
    if (!product) {
      throw new NotFoundException('محصول پیدا نشد');
    }

    // حذف محصول (با توجه به cascade و onDelete، روابط هم حذف می‌شوند)
    await this.productRepository.remove(product);
    return { message: 'محصول با موفقیت حذف شد' };
  }
}
