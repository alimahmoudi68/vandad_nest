// src/modules/product/entities/product-attribute.entity.ts
import {
    Entity, Column, PrimaryGeneratedColumn, ManyToOne,
    CreateDateColumn, UpdateDateColumn, OneToMany
  } from 'typeorm';
  import { ProductEntity } from './product.entity';
  import { AttributeEntity } from '../../attribute/entities/attribute.entity';
  import { AttributeMetaEntity } from '../../attribute/entities/attribute-meta.entity';
  
  @Entity("product_attributes")
  export class ProductAttributeEntity{
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => ProductEntity, product => product.attributes)
    product: ProductEntity;
  
    @ManyToOne(() => AttributeEntity)
    attribute: AttributeEntity;
  
    @ManyToOne(() => AttributeMetaEntity, { nullable: true })
    attributeMeta: AttributeMetaEntity;
  
    @Column({ nullable: true })
    value: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  