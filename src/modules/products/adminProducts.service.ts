import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { In, Repository, DataSource } from 'typeorm';

import { CategoryEntity } from '../categories/entities/category.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationSolver } from 'src/utils/common/paginationSolver';
import { UploadEntity } from '../upload/entities/upload.entity';
import { plainToInstance } from 'class-transformer';
import { ProductDto } from './dto/product.dto';
import { AttributeEntity } from '../attribute/entities/attribute.entity';
import { ProductAttributeEntity } from './entities/product-attribute.entity';
import { ProductVariantEntity } from './entities/product-variant.entity';
import { ProductVariantAttributeEntity } from './entities/product-variant-attribute.entity';
import { randomId } from 'src/utils/common/randomId';

import slugify from 'src/utils/common/slugify';
import { UploadService } from '../upload/upload.service';

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
    private readonly attributeRepository: Repository<AttributeEntity>,
    private readonly uploadService: UploadService,
    private dataSource: DataSource
  ){}

  // async create(createProductDto: CreateProductDto) {
  //   let {
  //     title,
  //     price,
  //     stock,
  //     sku,
  //     thumbnail,
  //     images,
  //     description,
  //     categories,
  //     isVariant,
  //     attributes,
  //     variants,
  //     discountPrice
  //   } = createProductDto;

  //   // console.log('thumbnail' , thumbnail);
  //   // console.log('images' , images);
  //   // console.log('variants' , variants);

  //   // Check for duplicate SKU
  //   if (sku) {
  //     const existSku = await this.productRepository.findOne({ where: { sku } });
  //     if (existSku) {
  //       throw new BadRequestException('محصولی با این شناسه کالا قبلاً ثبت شده است');
  //     }
  //   }

  //   // Helper to coerce possibly-empty string numbers to numeric defaults
  //   const toNumber = (val: any, fallback = 0): number => {
  //     const n = Number(val);
  //     return Number.isFinite(n) ? n : fallback;
  //   };

  //   // Normalize main product numbers
  //   const normalizedPrice = toNumber(price, 0);
  //   const normalizedStock = stock === undefined || stock === null ? undefined : toNumber(stock, 0);
  //   const normalizedDiscountPrice = toNumber(discountPrice, 0);

  //   // Check for duplicate slug
  //   let slug = slugify(title);
  //   const existSlug = await this.productRepository.findOne({ where: { slug } });
  //   if (existSlug) {
  //     slug += `-${randomId()}`;
  //   }

  //   // تبدیل thumbnail و images به entity
  //   let imagesEntities: UploadEntity[] = [];
  //   if (images) {
  //     // اگر images یک object است، آن را به آرایه تبدیل کن
  //     let imageIds: number[] = [];
  //     if (Array.isArray(images)) {
  //       imageIds = images;
  //     } else if (typeof images === 'object' && images !== null) {
  //       // اگر object است، سعی کن id را استخراج کن
  //       imageIds = [(images as any).id || 0].filter(id => id > 0);
  //     }
      
  //     if (imageIds.length > 0) {
  //       console.log('imageIds for main product:', imageIds);
  //       // بررسی اضافی برای اطمینان از اینکه آرایه است
  //       if (Array.isArray(imageIds)) {
  //         imagesEntities = await this.uploadRepository.findBy({ id: In(imageIds) });
  //       } else {
  //         console.error('imageIds is not an array:', imageIds);
  //       }
  //     }
  //   }
  //   let thumbnailEntity: UploadEntity | undefined = undefined;
  //   if (thumbnail) {
  //     const foundThumb = await this.uploadRepository.findOneBy({ id: thumbnail });
  //     if (!foundThumb) {
  //       throw new BadRequestException('تصویر بندانگشتی پیدا نشد');
  //     }
  //     thumbnailEntity = foundThumb;
  //   }

  //   // --- چک مجاز بودن attribute و meta بر اساس دسته‌بندی ---
  //   let allowedAttributes: string[] = [];
  //   let allowedMetas: number[] = [];
  //   if (categories) {
  //     const categoryId = Number(categories); // اگر فقط یکی داری
  //     const category = await this.categoryRepository.findOne({
  //       where: { id: categoryId },
  //       relations: { attributes: { metas: true } }
  //     });
  //     if (!category) throw new BadRequestException('دسته‌بندی پیدا نشد');
  //     allowedAttributes = category.attributes.map(attr => attr.slug);
  //     allowedMetas = category.attributes.reduce((acc, attr) => {
  //       attr.metas.forEach(meta => acc.push(meta.id));
  //       return acc;
  //     }, [] as number[]);
  //   }

  //   // چک attributes اصلی محصول
  //   if (categories && attributes) {
  //     Object.entries(attributes).forEach(([attrSlug, metaId]) => {
  //       if (!allowedAttributes.includes(attrSlug)) {
  //         throw new BadRequestException(`ویژگی ${attrSlug} برای این دسته‌بندی مجاز نیست`);
  //       }
  //       if (!allowedMetas.includes(Number(metaId))) {
  //         throw new BadRequestException(`متا با id ${metaId} برای ویژگی ${attrSlug} مجاز نیست`);
  //       }
  //     });
  //   }

  //   // چک attributes و metas واریانت‌ها
  //   if (variants && Array.isArray(variants)) {
  //     for (const variant of variants) {
  //       const variantAttrs = variant.attributes;
  //       if (variantAttrs) {
  //         Object.entries(variantAttrs).forEach(([attrSlug, metaId]) => {
  //           if (!allowedAttributes.includes(attrSlug)) {
  //             throw new BadRequestException(`ویژگی ${attrSlug} برای این دسته‌بندی (در واریانت) مجاز نیست`);
  //           }
  //           if (!allowedMetas.includes(Number(metaId))) {
  //             throw new BadRequestException(`متا با id ${metaId} برای ویژگی ${attrSlug} (در واریانت) مجاز نیست`);
  //           }
  //         });
  //       }
  //     }
  //   }
  //   // --- پایان چک ---

  //   // مقداردهی اولیه محصول
  //   const newProduct = this.productRepository.create({
  //     title,
  //     slug,
  //     price: normalizedPrice, // اگر isVariant=true باشد، این مقدار بعداً از واریانت‌ها محاسبه می‌شود
  //     discountPrice: normalizedDiscountPrice,
  //     discount: normalizedDiscountPrice > 0 ? true : false,
  //     description,
  //     stock: normalizedStock,
  //     sku: sku ?? "", // اگر isVariant=true باشد، SKU در واریانت‌ها تعریف می‌شود
  //     thumbnail: thumbnailEntity,
  //     images: imagesEntities,
  //     isVariant: !!isVariant,
  //   });

  //   // دسته‌بندی‌ها
  //   if (categories) {
  //     const categoriesFounded = await this.categoryRepository.findBy({ id: categories });
  //     newProduct.categories = categoriesFounded;
  //   }

  //   // مقداردهی اولیه attributes (تبدیل object به آرایه entity) حذف می‌شود و به بعد از ذخیره محصول منتقل می‌شود

  //   // ذخیره محصول بدون attributes
  //   const savedProduct = await this.productRepository.save(newProduct);

  //   // ساخت و ذخیره attributes بعد از ذخیره محصول
  //   if (attributes) {
  //     const attributeSlugs = Object.keys(attributes);
  //     const attributeEntities = await this.attributeRepository.find({
  //       where: { slug: In(attributeSlugs) }
  //     });

  //     const productAttributes = attributeEntities.map(attrEntity =>
  //       this.productRepository.manager.create(ProductAttributeEntity, {
  //         attribute: attrEntity,
  //         product: savedProduct,
  //         attributeMeta: { id: Number(attributes[attrEntity.slug]) }
  //       })
  //     ) as ProductAttributeEntity[];

  //     await this.productRepository.manager.save(ProductAttributeEntity, productAttributes);
  //     savedProduct.attributes = productAttributes;
  //   }

  //   // ذخیره variants
  //   if (variants && Array.isArray(variants)) {
  //     // Validate variant SKUs are unique (in request and DB)
  //     const variantSkus = variants
  //       .map(v => (v?.sku ?? '').toString().trim())
  //       .filter(s => !!s);
  //     if (variantSkus.length > 0) {
  //       // Duplicates inside request
  //       const duplicateInRequest = variantSkus.find((s, idx) => variantSkus.indexOf(s) !== idx);
  //       if (duplicateInRequest) {
  //         throw new BadRequestException(`SKU واریانت تکراری در ورودی: ${duplicateInRequest}`);
  //       }

  //       // Duplicates against DB (products and variants)
  //       const variantRepo = this.productRepository.manager.getRepository(ProductVariantEntity);
  //       const [existInProducts, existInVariants] = await Promise.all([
  //         this.productRepository.findOne({ where: { sku: In(variantSkus) } }),
  //         variantRepo.findOne({ where: { sku: In(variantSkus) } })
  //       ]);
  //       if (existInProducts || existInVariants) {
  //         throw new BadRequestException('شناسه کالای یکی از واریانت‌ها قبلاً ثبت شده است');
  //       }
  //     }

  //     const variantEntities: ProductVariantEntity[] = [];
  //     const variantPrices: number[] = [];
      
  //     for (const variant of variants) {
  //       const { attributes: variantAttrs, price, stock, sku, discountPrice, images } = variant;

  //       const vPrice = toNumber(price, 0);
  //       const vStock = stock === undefined || stock === null ? undefined : toNumber(stock, 0);
  //       const vDiscountPrice = toNumber(discountPrice, 0);

  //       // ساخت و ذخیره واریانت
  //       const variantEntity = this.productRepository.manager.create(ProductVariantEntity, {
  //         product: savedProduct,
  //         price: vPrice,
  //         stock: vStock,
  //         sku,
  //         discount: vDiscountPrice > 0 ? true : false,
  //         discountPrice: vDiscountPrice,
  //       });

  //       // ذخیره واریانت تا id داشته باشد
  //       const savedVariant = await this.productRepository.manager.save(ProductVariantEntity, variantEntity) as ProductVariantEntity;

  //       // اضافه کردن تصاویر واریانت
  //       if (images) {
  //         let variantImageIds: number[] = [];
  //         if (Array.isArray(images)) {
  //           variantImageIds = images;
  //         } else if (typeof images === 'object' && images !== null) {
  //           variantImageIds = [(images as any).id || 0].filter(id => id > 0);
  //         }
          
  //         if (variantImageIds.length > 0) {
  //           const variantImages = await this.uploadRepository.findBy({ id: In(variantImageIds) });
  //           savedVariant.images = variantImages;
  //           await this.productRepository.manager.save(ProductVariantEntity, savedVariant);
  //         }
  //       }

  //       // ساخت ویژگی‌های واریانت
  //       const variantAttrEntities: ProductVariantAttributeEntity[] = [];
  //       if (variantAttrs) {
  //         for (const [attrSlug, metaId] of Object.entries(variantAttrs)) {
  //           // پیدا کردن AttributeEntity
  //           const attrEntity = await this.attributeRepository.findOne({ where: { slug: attrSlug } });
  //           if (!attrEntity) continue;

  //           const variantAttrEntity = this.productRepository.manager.create(ProductVariantAttributeEntity, {
  //             variant: savedVariant,
  //             attribute: attrEntity,
  //             attributeMeta: { id: Number(metaId) }
  //           }) as ProductVariantAttributeEntity;
  //           variantAttrEntities.push(variantAttrEntity);
  //         }
  //         // ذخیره ویژگی‌های واریانت
  //         await this.productRepository.manager.save(ProductVariantAttributeEntity, variantAttrEntities);
  //         savedVariant.attributes = variantAttrEntities;
  //       }

  //       variantEntities.push(savedVariant);
  //       variantPrices.push(price);
  //     }
      
   
      
  //     savedProduct.variants = variantEntities;
  //   }

  //   return plainToInstance(ProductDto, savedProduct, { excludeExtraneousValues: true });
  // }

  async create(createProductDto: CreateProductDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    // ✅ نگهداری ID فایل‌های آپلودشده برای حذف در صورت خطا
    //const uploadedIds: number[] = [];
  
    try {
      let {
        title,
        price,
        stock,
        sku,
        thumbnail,
        images,
        description,
        categories,
        attributes,
        variants,
        discountPrice
      } = createProductDto;
  
      // ✅ ذخیره IDهای فایل‌ها برای مدیریت خطا
      // if (thumbnail) uploadedIds.push(Number(thumbnail));
      // if (images) {
      //   if (Array.isArray(images)) uploadedIds.push(...images.map(Number));
      //   else if (typeof images === "object" && images !== null && "id" in images)
      //     uploadedIds.push(Number((images as any).id));
      // }
  
      // 🔸 چک SKU تکراری
      if (sku) {
        const existSku = await queryRunner.manager.findOne(ProductEntity, { where: { sku } });
        if (existSku) throw new BadRequestException('محصولی با این شناسه کالا قبلاً ثبت شده است');
      }
  
      // 🔸 آماده‌سازی اعداد
      const toNumber = (val: any, fallback = 0): number => {
        const n = Number(val);
        return Number.isFinite(n) ? n : fallback;
      };
      const normalizedPrice = toNumber(price, 0);
      const normalizedStock = stock === undefined || stock === null ? undefined : toNumber(stock, 0);
      const normalizedDiscountPrice = toNumber(discountPrice, 0);
  
      // 🔸 ساخت slug یکتا
      let slug = slugify(title);
      const existSlug = await queryRunner.manager.findOne(ProductEntity, { where: { slug } });
      if (existSlug) slug += `-${randomId()}`;
  
      // 🔸 واکشی تصاویر
      let imagesEntities: UploadEntity[] = [];
      if (images) {
        let imageIds: number[] = [];
        if (Array.isArray(images)) imageIds = images;
        else if (typeof images === 'object' && images !== null) imageIds = [(images as any).id].filter(Boolean);
  
        if (imageIds.length > 0) {
          imagesEntities = await queryRunner.manager.find(UploadEntity, { where: { id: In(imageIds) } });
        }
      }
  
      let thumbnailEntity: UploadEntity | undefined = undefined;
      if (thumbnail) {
        const found = await queryRunner.manager.findOne(UploadEntity, { where: { id: thumbnail } });
        if (!found) throw new BadRequestException('تصویر بندانگشتی پیدا نشد');
        thumbnailEntity = found;
      }
  
      // 🔸 بررسی دسته‌بندی و ویژگی‌های مجاز
      let allowedAttributes: string[] = [];
      let allowedMetas: number[] = [];
      if (categories) {
        const categoryId = Number(categories);
        const category = await queryRunner.manager.findOne(CategoryEntity, {
          where: { id: categoryId },
          relations: { attributes: { metas: true } }
        });
        if (!category) throw new BadRequestException('دسته‌بندی پیدا نشد');
        allowedAttributes = category.attributes.map(attr => attr.slug);
        allowedMetas = category.attributes.flatMap(attr => attr.metas.map(meta => meta.id));
      }
  
      // 🔸 چک attributes اصلی محصول
      if (categories && attributes) {
        Object.entries(attributes).forEach(([attrSlug, metaId]) => {
          if (!allowedAttributes.includes(attrSlug))
            throw new BadRequestException(`ویژگی ${attrSlug} برای این دسته‌بندی مجاز نیست`);
          if (!allowedMetas.includes(Number(metaId)))
            throw new BadRequestException(`متا با id ${metaId} برای ویژگی ${attrSlug} مجاز نیست`);
        });
      }
  
      // 🔸 چک attributes و metas واریانت‌ها
      if (variants && Array.isArray(variants)) {
        for (const variant of variants) {
          const variantAttrs = variant.attributes;
          if (variantAttrs) {
            Object.entries(variantAttrs).forEach(([attrSlug, metaId]) => {
              if (!allowedAttributes.includes(attrSlug))
                throw new BadRequestException(`ویژگی ${attrSlug} برای این دسته‌بندی (در واریانت) مجاز نیست`);
              if (!allowedMetas.includes(Number(metaId)))
                throw new BadRequestException(`متا با id ${metaId} برای ویژگی ${attrSlug} (در واریانت) مجاز نیست`);
            });
          }
        }
      }
  
      // 🔸 ساخت محصول
      const newProduct = queryRunner.manager.create(ProductEntity, {
        title,
        slug,
        price: normalizedPrice,
        discountPrice: normalizedDiscountPrice,
        discount: normalizedDiscountPrice > 0,
        description,
        stock: normalizedStock,
        sku: sku ?? "",
        thumbnail: thumbnailEntity,
        images: imagesEntities,
        isVariant: variants?.length ? (variants?.length > 0 ? true : false ) : false,
      });
  
      // 🔸 دسته‌بندی‌ها
      if (categories) {
        const categoriesFounded = await queryRunner.manager.find(CategoryEntity, { where: { id: categories } });
        newProduct.categories = categoriesFounded;
      }
  
      // 🔸 ذخیره محصول
      const savedProduct = await queryRunner.manager.save(ProductEntity, newProduct);
  
      // 🔸 ذخیره attributes محصول
      if (attributes) {
        const attributeSlugs = Object.keys(attributes);
        const attributeEntities = await queryRunner.manager.find(AttributeEntity, { where: { slug: In(attributeSlugs) } });
  
        const productAttributes = attributeEntities.map(attrEntity =>
          queryRunner.manager.create(ProductAttributeEntity, {
            attribute: attrEntity,
            product: savedProduct,
            attributeMeta: { id: Number(attributes[attrEntity.slug]) }
          })
        );
  
        await queryRunner.manager.save(ProductAttributeEntity, productAttributes);
        savedProduct.attributes = productAttributes;
      }
  
      // 🔸 ذخیره variants
      if (variants && Array.isArray(variants)) {


        // add images to uploadedIds for delete if create product fail
        // for (const variant of variants) {
        //   const { images } = variant;
        //   images?.map(uploadedId=>{
        //     uploadedIds.push(uploadedId);
        //   });
        // }


        const variantRepo = queryRunner.manager.getRepository(ProductVariantEntity);
  
        const variantSkus = variants.map(v => (v?.sku ?? '').trim()).filter(s => !!s);
        if (variantSkus.length > 0) {
          const duplicateInRequest = variantSkus.find((s, idx) => variantSkus.indexOf(s) !== idx);
          if (duplicateInRequest)
            throw new BadRequestException(`SKU واریانت تکراری در ورودی: ${duplicateInRequest}`);
  
          const [existInProducts, existInVariants] = await Promise.all([
            queryRunner.manager.findOne(ProductEntity, { where: { sku: In(variantSkus) } }),
            variantRepo.findOne({ where: { sku: In(variantSkus) } })
          ]);
  
          if (existInProducts || existInVariants)
            throw new BadRequestException('شناسه کالای یکی از واریانت‌ها قبلاً ثبت شده است');
        }
  
        const variantEntities: ProductVariantEntity[] = [];
  
        for (const variant of variants) {
          const { attributes: variantAttrs, price, stock, sku, discountPrice, images } = variant;
          const vPrice = toNumber(price, 0);
          const vStock = stock === undefined || stock === null ? undefined : toNumber(stock, 0);
          const vDiscountPrice = toNumber(discountPrice, 0);
  
          const variantEntity = queryRunner.manager.create(ProductVariantEntity, {
            product: savedProduct,
            price: vPrice,
            stock: vStock,
            sku,
            discount: vDiscountPrice > 0,
            discountPrice: vDiscountPrice,
          });
  
          const savedVariant = await queryRunner.manager.save(ProductVariantEntity, variantEntity);
  
          // تصاویر واریانت
          if (images) {
            let variantImageIds: number[] = [];
            if (Array.isArray(images)) variantImageIds = images;
            else if (typeof images === 'object' && images !== null)
              variantImageIds = [(images as any).id || 0].filter(id => id > 0);
  
            if (variantImageIds.length > 0) {
              const variantImages = await queryRunner.manager.find(UploadEntity, { where: { id: In(variantImageIds) } });
              savedVariant.images = variantImages;
              await queryRunner.manager.save(ProductVariantEntity, savedVariant);
            }
          }
  
          // ویژگی‌های واریانت
          if (variantAttrs) {
            const variantAttrEntities: ProductVariantAttributeEntity[] = [];
            for (const [attrSlug, metaId] of Object.entries(variantAttrs)) {
              const attrEntity = await queryRunner.manager.findOne(AttributeEntity, { where: { slug: attrSlug } });
              if (!attrEntity) continue;
              const variantAttrEntity = queryRunner.manager.create(ProductVariantAttributeEntity, {
                variant: savedVariant,
                attribute: attrEntity,
                attributeMeta: { id: Number(metaId) }
              });
              variantAttrEntities.push(variantAttrEntity);
            }
            await queryRunner.manager.save(ProductVariantAttributeEntity, variantAttrEntities);
            savedVariant.attributes = variantAttrEntities;
          }
  
          variantEntities.push(savedVariant);
        }
  
        savedProduct.variants = variantEntities;
      }
  
      // ✅ commit نهایی
      await queryRunner.commitTransaction();
  
      return plainToInstance(ProductDto, savedProduct, { excludeExtraneousValues: true });
  
    } catch (error) {
      // ⚠️ اگر هر خطایی خورد، فایل‌های آپلودشده حذف می‌شن
      // for (const id of uploadedIds) {
      //   try {
      //     await this.uploadService.remove(id);
      //   } catch (removeErr) {
      //     console.error(`❌ خطا در حذف فایل آپلود شده با id=${id}:`, removeErr.message);
      //   }
      // }
  
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  
  



  async findAll(paginationDto: PaginationDto, attributeFilters: Record<string, any>) {
    const { limit, page, skip } = paginationSolver(paginationDto);
  
    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'category')
      .leftJoinAndSelect('category.attributes', 'categoryAttribute')
      .leftJoinAndSelect('product.thumbnail', 'thumbnail')
      .leftJoinAndSelect('product.variants', 'variant')
      .leftJoinAndSelect('variant.attributes', 'variantAttribute')
      .leftJoinAndSelect('variantAttribute.attribute', 'variantAttr')
      .leftJoinAndSelect('variantAttribute.attributeMeta', 'variantAttrMeta')
      .leftJoinAndSelect('variant.images', 'variantImages')
      .leftJoinAndSelect('product.attributes', 'productAttribute')
      .leftJoinAndSelect('productAttribute.attribute', 'productAttributeEntity')
      .leftJoinAndSelect('productAttribute.attributeMeta', 'productAttributeMeta')
      .orderBy('product.id', 'DESC')
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
        'images',
        'thumbnail',
      ],
    });



    //console.log('product' , product?.variants[0].images)

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

    return {
      product : plainToInstance(ProductDto, product, { excludeExtraneousValues: true })
    }

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
      isVariant,
      attributes,
      variants,
      discount,
      discountPrice
    } = updateProductDto;

    // --- چک تکراری بودن SKU ---
    if (sku) {
      const existSku = await this.productRepository.findOne({ where: { sku } });
      if (existSku && existSku.id !== id) {
        throw new BadRequestException('شناسه کالا تکراری است');
      }
    }

    // پیدا کردن محصول
    const product = await this.productRepository.findOne({
      where: { id },
      relations: [
        'thumbnail',
        'images',
        'attributes',
        'variants',
        'variants.attributes'
      ]
    });
    if (!product) {
      throw new NotFoundException('محصول پیدا نشد');
    }

   
    // --- check thumbnail and remove old thumbnail ---
    // ذخیره id قبلی thumbnail
    const oldThumbnailId = product.thumbnail?.id;

    // به‌روزرسانی thumbnail
    if (thumbnail) {
      const foundThumb = await this.uploadRepository.findOneBy({ id: thumbnail });
      if (!foundThumb) {
        throw new BadRequestException('تصویر بندانگشتی پیدا نشد');
      }
      product.thumbnail = foundThumb;
    }

    // به‌روزرسانی فیلدهای ساده
    if (title !== undefined) product.title = title;
    if (slug !== undefined) product.slug = slug;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (sku !== undefined) product.sku = sku;
    if (description !== undefined) product.description = description;
    if (isVariant !== undefined) product.isVariant = isVariant;
    if (discount !== undefined) product.discount = discount;
    if (discountPrice !== undefined) product.discountPrice = discountPrice;

    // دسته‌بندی‌ها
    if (categories) {
      const categoriesFounded = await this.categoryRepository.findBy({ id: categories });
      product.categories = categoriesFounded;
    }

    // تصاویر
    if (images) {
      let imageIds: number[] = [];
      if (Array.isArray(images)) {
        imageIds = images;
      } else if (typeof images === 'object' && images !== null) {
        imageIds = [(images as any).id || 0].filter(id => id > 0);
      }
      
      if (imageIds.length > 0) {
        product.images = await this.uploadRepository.findBy({ id: In(imageIds) });
      }
    }

    // thumbnail
    // if (thumbnail) { // This line is removed as per the new_code
    //   const foundThumb = await this.uploadRepository.findOneBy({ id: thumbnail });
    //   if (!foundThumb) {
    //     throw new BadRequestException('تصویر بندانگشتی پیدا نشد');
    //   }
    //   product.thumbnail = foundThumb;
    // }

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
        const { attributes: variantAttrs, price, stock, sku, discountPrice, images } = variant;

        // ساخت و ذخیره واریانت
        const variantEntity = this.productRepository.manager.create(ProductVariantEntity, {
          product: product,
          price,
          stock,
          sku,
          discount: (discountPrice ?? 0) > 0 ? true : false,
          discountPrice: discountPrice ?? 0,
        });

        const savedVariant = await this.productRepository.manager.save(ProductVariantEntity, variantEntity) as ProductVariantEntity;

        // اضافه کردن تصاویر واریانت
        if (images) {
          let variantImageIds: number[] = [];
          if (Array.isArray(images)) {
            variantImageIds = images;
          } else if (typeof images === 'object' && images !== null) {
            variantImageIds = [(images as any).id || 0].filter(id => id > 0);
          }
          
          if (variantImageIds.length > 0) {
            const variantImages = await this.uploadRepository.findBy({ id: In(variantImageIds) });
            savedVariant.images = variantImages;
            await this.productRepository.manager.save(ProductVariantEntity, savedVariant);
          }
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
      
      product.variants = variantEntities;
    }

    // ذخیره نهایی محصول
    const savedProduct = await this.productRepository.save(product);

    // اگر thumbnail تغییر کرده بود، قبلی را حذف کن
    if (oldThumbnailId && oldThumbnailId !== thumbnail) {
      await this.uploadService.remove(oldThumbnailId);
    }

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
        'variants.images',
        'images',
        'thumbnail',
      ],
    });
    if (!product) {
      throw new NotFoundException('محصول پیدا نشد');
    }

    // به صورت صریح ابتدا جداول وابسته حذف شوند تا ارور FK ندهد
    const manager = this.productRepository.manager;

    // جمع آوری همه آپلودهای مرتبط (thumbnail, images محصول و تصاویر واریانت‌ها)
    const uploadIdsToDelete: number[] = [];
    if (product.thumbnail) uploadIdsToDelete.push(product.thumbnail.id);
    if (product.images && product.images.length > 0) {
      uploadIdsToDelete.push(...product.images.map(img => img.id));
    }
    if (product.variants && product.variants.length > 0) {
      for (const variant of product.variants) {
        if (variant.images && variant.images.length > 0) {
          uploadIdsToDelete.push(...variant.images.map(img => img.id));
        }
      }
    }

    // حذف ویژگی‌های واریانت‌ها
    if (product.variants && product.variants.length > 0) {
      const variantIds = product.variants.map(v => v.id);
      if (variantIds.length > 0) {
        await manager
          .createQueryBuilder()
          .delete()
          .from('product_variant_attributes')
          .where('variantId IN (:...variantIds)', { variantIds })
          .execute();
      }

      // حذف خود واریانت‌ها (رکوردهای join تصاویر ManyToMany نیز حذف می‌شوند)
      await manager
        .createQueryBuilder()
        .delete()
        .from('product_variants')
        .where('productId = :productId', { productId: product.id })
        .execute();
    }

    // حذف ویژگی‌های محصول
    await manager
      .createQueryBuilder()
      .delete()
      .from('product_attributes')
      .where('productId = :productId', { productId: product.id })
      .execute();

    // حذف رکورد محصول (و join table های تصاویر محصول)
    await this.productRepository.delete(product.id);

    // حذف فایل‌های آپلود از S3 و دیتابیس
    for (const uploadId of Array.from(new Set(uploadIdsToDelete))) {
      try {
        await this.uploadService.remove(uploadId);
      } catch (e) {
        // swallow error to ensure product deletion flow continues
      }
    }

    return { message: 'محصول با موفقیت حذف شد' };
  }
}
