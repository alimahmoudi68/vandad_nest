// src/modules/attribute/entities/attribute-meta.entity.ts
import {
    Entity, Column, PrimaryGeneratedColumn, ManyToOne,
    CreateDateColumn, UpdateDateColumn
  } from 'typeorm';
  import { AttributeEntity } from './attribute.entity';
  
  @Entity('attribute_metas')
  export class AttributeMetaEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    title: string;
  
    @Column({ unique: true })
    slug: string;
  
    @ManyToOne(() => AttributeEntity, attr => attr.metas)
    attribute: AttributeEntity;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  