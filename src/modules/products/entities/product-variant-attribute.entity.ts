// src/modules/products/entities/product-variant-attribute.entity.ts
import {
    Entity, PrimaryGeneratedColumn, Column,
    ManyToOne
} from 'typeorm';

import { ProductVariantEntity } from './product-variant.entity';
import { AttributeEntity } from 'src/modules/attribute/entities/attribute.entity';
import { AttributeMetaEntity } from 'src/modules/attribute/entities/attribute-meta.entity';

@Entity('product_variant_attributes')
export class ProductVariantAttributeEntity {
@PrimaryGeneratedColumn()
id: number;

@ManyToOne(() => ProductVariantEntity, variant => variant.attributes, { onDelete: 'CASCADE' })
variant: ProductVariantEntity;

@ManyToOne(() => AttributeEntity)
attribute: AttributeEntity;

@ManyToOne(() => AttributeMetaEntity, { nullable: true })
attributeMeta?: AttributeMetaEntity;

@Column({ type: 'varchar', nullable: true })
value?: string; // برای ویژگی‌های داینامیک
}
  