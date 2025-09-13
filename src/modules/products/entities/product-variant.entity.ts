// src/modules/products/entities/product-variant.entity.ts
import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, Unique, ManyToMany, JoinTable
  } from 'typeorm';
  import { ProductEntity } from './product.entity';
  import { ProductVariantAttributeEntity } from './product-variant-attribute.entity';
  import { UploadEntity } from 'src/modules/upload/entities/upload.entity';
  
  @Entity('product_variants')
  @Unique(['sku']) // برای یکتا بودن SKU
  export class ProductVariantEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => ProductEntity, product => product.variants, { onDelete: 'CASCADE' })
    product: ProductEntity;
  
    @Column({ nullable: true })
    sku: string;
  
    @Column('decimal', { precision: 10, scale: 2 })
    price: number;
  
  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ default: false })
  discount: boolean;

  @Column({ default: 0, type: 'int' })
  discountPrice: number;

  @ManyToMany(() => UploadEntity)
  @JoinTable()
  images: UploadEntity[];

  @OneToMany(() => ProductVariantAttributeEntity, attr => attr.variant, {
    cascade: true,
    eager: true // در صورت نیاز
  })
  attributes: ProductVariantAttributeEntity[];
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  