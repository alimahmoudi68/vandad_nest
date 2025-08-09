import { IsString, IsInt, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateEpisodeDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsNumber()
  price: number;

  @IsString()
  @IsOptional()
  time: string;

  @IsDateString()
  date: string;

  @IsInt()
  courseId: number;
}
