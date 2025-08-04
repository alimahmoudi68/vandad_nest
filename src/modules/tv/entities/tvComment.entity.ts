import { UserEntity } from "src/modules/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TvEntity } from "./tv.entity";

@Entity("tv_comments")
export class TvCommentEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ nullable: false, length: 500 })
    content: string;

    @Column({ nullable: false , default: false})  
    accepted: boolean;

    @ManyToOne(()=>TvCommentEntity , (comment)=>comment.childs , {nullable : true})
    parent: TvCommentEntity;

    @OneToMany(()=>TvCommentEntity , (comment)=>comment.parent)
    childs: TvCommentEntity[]

    @ManyToOne(()=>UserEntity , (user)=>user.comments , {onDelete : "CASCADE"}) 
    user: UserEntity;

    @ManyToOne(()=>TvEntity, (tv)=>tv.comments , {onDelete : "CASCADE"})
    tv: TvEntity;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}