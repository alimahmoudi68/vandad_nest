import { ProductEntity } from "src/modules/products/entities/product.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { AttributeEntity } from '../../attribute/entities/attribute.entity';



@Entity("categories")
export class CategoryEntity {
    
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column({nullable: false , length : 100})
    title: string

    @Column({ nullable: false , length : 100 , unique: true })
    slug: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @ManyToOne(()=>CategoryEntity , (cat)=>cat.childs , {nullable : true})
    parent: CategoryEntity

    @OneToMany(()=>CategoryEntity , (cat)=>cat.parent)
    childs: CategoryEntity[];

    @ManyToMany(() => AttributeEntity, attribute => attribute.categories)
    attributes: AttributeEntity[];


    @ManyToMany(()=>ProductEntity , (product)=>product.categories)
    products: ProductEntity[];

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
    
}
