import { UserEntity } from "src/modules/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CourseEntity } from "./course.entity";

@Entity("course_comments")
export class CourseCommentEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ nullable: false, length: 500 })
    content: string;

    @Column({ nullable: false , default: false})  
    accepted: boolean;

    @ManyToOne(()=>CourseCommentEntity , (comment)=>comment.childs , {nullable : true})
    parent: CourseCommentEntity;

    @OneToMany(()=>CourseCommentEntity , (comment)=>comment.parent)
    childs: CourseCommentEntity[]

    @ManyToOne(()=>UserEntity , (user)=>user.comments , {onDelete : "CASCADE"}) 
    user: UserEntity;

    @ManyToOne(()=>CourseEntity, (course)=>course.comments , {onDelete : "CASCADE"})
    course: CourseEntity;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}