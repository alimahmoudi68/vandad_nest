import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
  JoinTable,
  ManyToOne,
} from 'typeorm';

import { AddressEntity } from '../../address/entities/address.entity';
import { TicketEntity } from '../../tickets/entities/ticket.entity';
import { ProfileEntity } from './profile.entity';
import { BlogEntity } from 'src/modules/blog/entities/blog.entity';
import { BlogCommentEntity } from 'src/modules/blog/entities/blogComment.entity';
import { UploadEntity } from 'src/modules/upload/entities/upload.entity';


@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: true, length: 30 }) // می تونه نال باشه
  firstName: string;

  @Column({ nullable: true, length: 30 })
  lastName: string;

  @Column({ unique: true, length: 11, nullable: true }) //  باید یونیک باشه
  phone: string;

  @Column({ nullable: true, length: 200 })
  about: string;

  @Column({ default: false })
  active: boolean;

  @Column({ default: false })
  isAdmin: boolean;

  @OneToMany(() => AddressEntity, (address) => address.user)
  addresses: AddressEntity[];

  @OneToMany(() => TicketEntity, (ticket) => ticket.user)
  tickets: TicketEntity[];


  // blog
  @OneToMany(()=>BlogEntity , (blog)=> blog.author)
  blogs: BlogEntity[];

  // blog likes
  @ManyToMany(()=>BlogEntity , (blog)=> blog.likedUsers)
  @JoinTable({
      name: "blog_likes" ,
      joinColumn: {name: "user_id" , referencedColumnName: "id"} ,
      inverseJoinColumn: {name : "blog_id" , referencedColumnName : "id"}
  })
  likedBlogs: BlogEntity[];

  @OneToMany(()=>BlogCommentEntity , (blogCommet)=>blogCommet.user)
  comments: BlogCommentEntity[];

  @ManyToOne(() => UploadEntity, { nullable: true })
  avatar: UploadEntity;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(()=>ProfileEntity , (profile)=>profile.user)
  profile: ProfileEntity;
}
