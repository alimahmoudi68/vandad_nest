import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { CourseEntity } from '../../courses/entities/course.entity';

@Entity('episodes')
export class EpisodeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({nullable: true})
  content: string;

  @Column()
  price: number;

  @Column({nullable: true})
  time: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ nullable: true, type: 'int' })
  duration?: number;

  @ManyToOne(() => CourseEntity, course => course.episodes, { onDelete: 'CASCADE' })
  course: CourseEntity;
}
