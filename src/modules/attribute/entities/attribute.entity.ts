// src/modules/attribute/entities/attribute.entity.ts
import {
    Entity, Column, PrimaryGeneratedColumn,
    CreateDateColumn, UpdateDateColumn, OneToMany,
    ManyToMany,
    JoinTable
  } from 'typeorm';
  import { AttributeMetaEntity } from './attribute-meta.entity';
  import { CategoryEntity } from '../../categories/entities/category.entity';
  
  @Entity('attributes')
  export class AttributeEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    title: string;
  
    @Column({ unique: true })
    slug: string;
  
    @Column({ default: false })
    isDynamic: boolean;
  
    @OneToMany(() => AttributeMetaEntity, meta => meta.attribute)
    metas: AttributeMetaEntity[];

    @ManyToMany(() => CategoryEntity, category => category.attributes)
    @JoinTable({
      name: "cat_attr" ,
      joinColumn: {name: "attribute_id" , referencedColumnName: "id"} ,
      inverseJoinColumn: {name : "category_id" , referencedColumnName : "id"}
    })
    categories: CategoryEntity[];
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }

