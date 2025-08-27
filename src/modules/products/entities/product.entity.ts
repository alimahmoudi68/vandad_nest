import { Column, CreateDateColumn, Entity , JoinTable , ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { CategoryEntity } from "src/modules/categories/entities/category.entity";
import { UploadEntity } from 'src/modules/upload/entities/upload.entity';


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


    @Column({ nullable: true })
    stock?: number;
  
    @Column({ nullable: true })
    sku?: string;


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


    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

}

