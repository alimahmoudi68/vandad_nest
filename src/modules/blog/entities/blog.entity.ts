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

@Entity('blog')
export class BlogEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false, unique: true })
  slug: string;

  @Column({ nullable: false })
  content: string;

  @Column({ nullable: true })
  image: string;

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
