import { Column, CreateDateColumn, Entity , JoinTable , ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { CategoryEntity } from "src/modules/categories/entities/category.entity";
import { UserEntity } from "src/modules/users/entities/user.entity";
import { UploadEntity } from 'src/modules/upload/entities/upload.entity';
import { ProductAttributeEntity } from './product-attribute.entity';
import {ProductVariantEntity} from './product-variant.entity';


@Entity("products")
export class ProductEntity {

    @PrimaryGeneratedColumn('increment')
    id: number

    @Column({nullable: false , length : 100})
    title: string

    @Column({ unique: true })
    slug: string;

    @Column({nullable: true , type : "text"})
    description: string

    @Column({nullable: false})
    price: number

    @Column({nullable: false})
    minPrice: number

    @Column({nullable: false})
    maxPrice: number

    @Column({ nullable: true })
    stock?: number;
  
    @Column({ nullable: true })
    sku?: string;

    @Column({ default: false })
    isVariant: boolean;

    @Column({ default: false })
    discount: boolean;

    @Column({ default: 0, type: 'int' })
    discountPrice: number;


    @ManyToOne(() => UploadEntity, { nullable: true })
    thumbnail: UploadEntity;

    @ManyToMany(() => UploadEntity)
    @JoinTable()
    images: UploadEntity[];


    @ManyToMany(()=>CategoryEntity , (categoty)=>categoty.products)
    @JoinTable({
        name: "product_categories" ,
        joinColumn: {name: "product_id" , referencedColumnName: "id"} ,
        inverseJoinColumn: {name : "category_id" , referencedColumnName : "id"}
    })
    categories: CategoryEntity[]


    //bookmark
    @ManyToMany(()=>UserEntity , (user)=>user.bookmarks)
    @JoinTable({
        name: "bookmarks" ,
        joinColumn: {name: "product_id" , referencedColumnName: "id"} ,
        inverseJoinColumn: {name : "user_id" , referencedColumnName : "id"}
    })
    userBookmarks: UserEntity[]


    @OneToMany(() => ProductAttributeEntity, attr => attr.product, { cascade: true })
    attributes: ProductAttributeEntity[];


    @OneToMany(() => ProductVariantEntity, variant => variant.product, {
        cascade: true,
    })
    variants: ProductVariantEntity[];


    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

}

