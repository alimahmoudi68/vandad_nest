import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateEpisodeDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsInt()
  duration?: number;

  @IsInt()
  courseId: number;
}
