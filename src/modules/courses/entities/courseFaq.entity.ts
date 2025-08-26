import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { CourseEntity } from './course.entity';

@Entity('course_faqs')
export class CourseFaqEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question: string;

  @Column()
  answer: string;

  @ManyToOne(() => CourseEntity, (course) => course.faqs, { onDelete: 'CASCADE' })
  course: CourseEntity;
}
