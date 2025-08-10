import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BlogStatus } from '../enum/status.enum';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { BlogCommentEntity } from './blogComment.entity';
import { BlogCatEntity } from 'src/modules/blog-cats/entities/blog-cat.entity';
import { UploadEntity } from 'src/modules/upload/entities/upload.entity';


@Entity('blog')
export class BlogEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({})
  keywords_meta: string;

  @Column({})
  description_meta: string;

  @Column({ nullable: false, unique: true })
  slug: string;
  
  @Column({ type: 'text', charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
  content: string;
  
  @ManyToOne(() => UploadEntity, { nullable: true , onDelete: 'SET NULL', onUpdate: 'CASCADE'})
  image: UploadEntity;

  @Column()
  time_study: string;

  @Column({ nullable: false, default: BlogStatus.Draft })
  status: string;

  @ManyToOne(() => UserEntity, (user) => user.blogs, { onDelete: 'SET NULL' })
  author: UserEntity;

  // blog likes
  @ManyToMany(() => UserEntity, (user) => user.likedBlogs)
  likedUsers: UserEntity[];

  @ManyToMany(() => BlogCatEntity, (blogCategory) => blogCategory.blogs)
  @JoinTable({
    name: 'blog_categories',
    joinColumn: { name: 'blog_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: BlogCatEntity[];

  @OneToMany(() => BlogCommentEntity, (blogComment) => blogComment.blog)
  comments: BlogCommentEntity[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  upated_at: Date;
}
