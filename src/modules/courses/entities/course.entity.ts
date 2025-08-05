import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';

import { CourseCatEntity } from 'src/modules/course-cats/entities/course-cat.entity';
import { EpisodeEntity } from '../../episodes/entities/episode.entity';
import { UploadEntity } from 'src/modules/upload/entities/upload.entity';
import { CourseCommentEntity } from './courseComment.entity';


@Entity('courses')
export class CourseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: false, unique: true })
  slug: string;

  @Column({})
  keywords_meta: string;

  @Column({})
  description_meta: string;

  @ManyToOne(() => UploadEntity, { nullable: true , onDelete: 'SET NULL', onUpdate: 'CASCADE'})
  image: UploadEntity;

  @Column({ nullable: true })
  content?: string;

  @OneToMany(() => EpisodeEntity, episode => episode.course, { cascade: true })
  episodes: EpisodeEntity[];

  @ManyToMany(() => CourseCatEntity, (courseCategory) => courseCategory.courses)
  @JoinTable({
    name: 'course_categories',
    joinColumn: { name: 'course_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: CourseCatEntity[];

  @OneToMany(() => CourseCommentEntity, (courseComment) => courseComment.course)
  comments: CourseCommentEntity[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  upated_at: Date;
}


