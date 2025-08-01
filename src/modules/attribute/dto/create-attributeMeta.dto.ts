import { IsString, MaxLength, IsInt, Min } from 'class-validator';

export class CreateAttributeMetaDto {
  @IsString({ message: 'عنوان باید یک رشته باشد.' })
  @MaxLength(100, { message: 'عنوان نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.' })
  title: string;

  @IsString({ message: 'اسلاگ باید یک رشته باشد.' })
  @MaxLength(100, { message: 'اسلاگ نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.' })
  slug: string;

  @IsInt({ message: 'آیدی ویژگی باید یک عدد صحیح باشد.' })
  @Min(1, { message: 'آیدی ویژگی باید بزرگتر از صفر باشد.' })
  attributeId: number;
} 