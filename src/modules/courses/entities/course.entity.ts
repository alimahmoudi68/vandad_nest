import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { EpisodeEntity } from "./episode.entity";

@Entity('courses')
export class CourseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => EpisodeEntity, episode => episode.course)
  episodes: EpisodeEntity[];
}

