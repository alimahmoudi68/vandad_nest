import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { CourseEntity } from '../../courses/entities/course.entity';

@Entity('episodes')
export class EpisodeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'int' })
  duration?: number;

  @ManyToOne(() => CourseEntity, course => course.episodes, { onDelete: 'CASCADE' })
  course: CourseEntity;
}
