import { IsString, MaxLength, IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttributeDto {
  @IsString({ message: 'عنوان باید یک رشته باشد.' })
  @MaxLength(100, { message: 'عنوان نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.' })
  title: string;

  @IsString({ message: 'اسلاگ باید یک رشته باشد.' })
  @MaxLength(100, { message: 'اسلاگ نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.' })
  slug: string;

  @ApiProperty({
    description: 'آیا این ویژگی داینامیک است یا خیر؟',
    default: false,
    example: true,
  })
  @IsBoolean({ message: 'فیلد isDynamic باید از نوع بولین باشد.' })
  @IsNotEmpty({ message: 'فیلد isDynamic اجباری است.' })
  isDynamic: boolean;
} 