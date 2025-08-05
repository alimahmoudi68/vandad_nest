import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EpisodeEntity } from './entities/episode.entity';
import { Repository } from 'typeorm';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { CourseEntity } from '../courses/entities/course.entity';
import { UpdateEpisodeDto } from './dto/update-episode.dto';

@Injectable()
export class EpisodeService {
  constructor(
    @InjectRepository(EpisodeEntity)
    private episodeRepo: Repository<EpisodeEntity>,
    @InjectRepository(CourseEntity)
    private courseRepo: Repository<CourseEntity>,
  ) {}

  async create(dto: CreateEpisodeDto) {
    const course = await this.courseRepo.findOneBy({ id: dto.courseId });
    if (!course) throw new NotFoundException('Course not found');

    const episode = this.episodeRepo.create({
      title: dto.title,
      duration: dto.duration,
      course,
    });

    return this.episodeRepo.save(episode);
  }

  async update(id: number, dto: UpdateEpisodeDto) {
    const episode = await this.episodeRepo.findOneBy({ id });
    if (!episode) throw new NotFoundException('Episode not found');

    Object.assign(episode, dto);
    return this.episodeRepo.save(episode);
  }

  async remove(id: number) {
    const episode = await this.episodeRepo.findOneBy({ id });
    if (!episode) throw new NotFoundException('Episode not found');

    return this.episodeRepo.remove(episode);
  }
}
