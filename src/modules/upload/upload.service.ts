import { Injectable } from '@nestjs/common';
import { UploadDto } from './dto/upload.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadEntity } from './entities/upload.entity';
import { Repository } from 'typeorm';
import { S3Service } from '../s3/s3.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationSolver } from 'src/utils/common/paginationSolver';
import {getCurrentYearMonth} from 'src/utils/common/getCurrentYearMonth';


@Injectable()
export class UploadService {

  constructor(
    @InjectRepository(UploadEntity)
    private uploadRepositpry: Repository<UploadEntity>,
    private s3Service: S3Service
  ) {}


  async create(file: Express.Multer.File) {
    const bucket = process.env.S3_BUCKET_NAME;
    const { Key } = await this.s3Service.uploadFile(file , getCurrentYearMonth());
    const newUpload = this.uploadRepositpry.create({
      title: file.originalname,
      bucket ,
      location: Key,
      alt: file.originalname
    });
    const saved = await this.uploadRepositpry.save(newUpload);
    return { upload: saved };
  }

  
  async findAll(paginationDto: PaginationDto) {
    const {limit , page , skip} = paginationSolver(paginationDto);
    const [uploads , count] = await this.uploadRepositpry.findAndCount({
      skip,
      take: limit,
    });
    return {
      uploads,
      pagination: {
        count,
        page,
        limit,
      }
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} upload`;
  }

  update(id: number, uploadDto: UploadDto) {
    return `This action updates a #${id} upload`;
  }

  async remove(id: number) {
    // پیدا کردن رکورد آپلود
    const upload = await this.uploadRepositpry.findOneBy({ id });
    if (!upload) {
      throw new Error('فایل مورد نظر پیدا نشد');
    }

    // حذف فایل از S3
    // فرض بر این است که location شامل مسیر کامل فایل در S3 است (مثلاً products/123456.png)
    await this.s3Service.deleteFile(upload.location);

    // حذف رکورد از دیتابیس
    await this.uploadRepositpry.delete(id);

    return { message: 'فایل و رکورد با موفقیت حذف شدند' };
  }
}
