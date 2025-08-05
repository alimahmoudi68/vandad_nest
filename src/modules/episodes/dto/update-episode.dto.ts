import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateEpisodeDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsInt()
  duration?: number;
}
