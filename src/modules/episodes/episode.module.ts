import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EpisodeEntity } from './entities/episode.entity';
import { EpisodeService } from './episode.service';
import { EpisodeController } from './episode.controller';
import { CourseEntity } from '../courses/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EpisodeEntity, CourseEntity])],
  providers: [EpisodeService],
  controllers: [EpisodeController],
})
export class EpisodeModule {}
