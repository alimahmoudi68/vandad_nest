import { BlogEntity } from 'src/modules/blog/entities/blog.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('blog_cats')
export class BlogCatEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false, length: 100 })
  title: string;

  @Column({ nullable: false, length: 100 })
  slug: string;

  @ManyToMany(() => BlogEntity, (blog) => blog.categories)
  blogs: BlogEntity[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
