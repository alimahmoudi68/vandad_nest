import { UserEntity } from "src/modules/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { BlogEntity } from "./blog.entity";

@Entity("blog_comments")
export class BlogCommentEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ nullable: false, length: 500 })
    content: string;

    @Column({ nullable: false , default: false})  
    accepted: boolean;

    @ManyToOne(()=>BlogCommentEntity , (comment)=>comment.childs , {nullable : true})
    parent: BlogCommentEntity;

    @OneToMany(()=>BlogCommentEntity , (comment)=>comment.parent)
    childs: BlogCommentEntity[]

    @ManyToOne(()=>UserEntity , (user)=>user.comments , {onDelete : "CASCADE"}) 
    user: UserEntity;

    @ManyToOne(()=>BlogEntity, (blog)=>blog.comments , {onDelete : "CASCADE"})
    blog: BlogEntity;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}