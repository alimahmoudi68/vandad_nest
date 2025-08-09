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
  
    const newEpisode = this.episodeRepo.create({
      title: dto.title,
      content: dto.content,
      price: dto.price,
      time: dto.time,
      date: new Date(dto.date),  
      course,
    });

    let episode = await this.episodeRepo.save(newEpisode);
  
    return { episode };
  }

  async update(id: number, dto: UpdateEpisodeDto) {
    
    const episode = await this.episodeRepo.findOne({
      where: { id },
      relations: ['course'],
    });
  
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }
  
    // اگر courseId جدید ارسال شده، دوره را پیدا کن
    if (dto.courseId) {
      const course = await this.courseRepo.findOneBy({ id: dto.courseId });
      if (!course) {
        throw new NotFoundException('Course not found');
      }
      episode.course = course;
    }
  
    // مقادیر قابل بروزرسانی
    if (dto.title !== undefined) episode.title = dto.title;
    if (dto.content !== undefined) episode.content = dto.content;
    if (dto.price !== undefined) episode.price = dto.price;
    if (dto.date !== undefined) episode.date = new Date(dto.date);
    if (dto.time !== undefined) episode.time = dto.time;

    let episodeEdited = await this.episodeRepo.save(episode);
    return { episode : episodeEdited };
  }
  

  async remove(id: number) {
    const episode = await this.episodeRepo.findOneBy({ id });
  
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }
  
    await this.episodeRepo.remove(episode);
  
    return { message: 'Episode removed successfully' };
  }

  
}
