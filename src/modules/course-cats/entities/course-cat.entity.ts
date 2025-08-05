import { CourseEntity } from 'src/modules/courses/entities/course.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('course_cats')
export class CourseCatEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false, length: 100 })
  title: string;

  @Column({ nullable: false, length: 100 })
  slug: string;

  @ManyToMany(() => CourseEntity, (course) => course.categories)
  courses: CourseEntity[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
