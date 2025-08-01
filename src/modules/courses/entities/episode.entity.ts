import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import {CourseEntity} from './course.entity';

@Entity('episodes')
export class EpisodeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => CourseEntity, course => course.episodes)
  course: CourseEntity;
}