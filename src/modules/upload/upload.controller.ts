import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Version, Query } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadDto } from './dto/upload.dto';
import { Auth } from '../auth/entities/auth.entity';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { ResponseFormatInterceptor } from 'src/interceptors/responseFormat.interceptor';
import { ApiConsumes } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/common/enums/swagger-consumes.enum';
import { UploadFileS3 } from 'src/common/interceptors/uploadFile.interceptor';
import { PaginationDto } from 'src/common/dto/pagination.dto';


// @AuthDecorator()
@UseInterceptors(ResponseFormatInterceptor)
@Controller('admin/uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @ApiConsumes(SwaggerConsumes.MultipartData)
  @Version('1')
  @UseInterceptors(UploadFileS3("file"))
  create(
    @UploadedFile(new ParseFilePipe({
      validators : [
        new MaxFileSizeValidator({maxSize : 10*1024*1024}),
        new FileTypeValidator({fileType : "image/(png|jpg|jpeg|webp)"})
      ]
    })) file: Express.Multer.File 
  ) {
    return this.uploadService.create(file);
  }

  @Get()
  @ApiConsumes(SwaggerConsumes.MultipartData)
  @Version('1')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.uploadService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiConsumes(SwaggerConsumes.MultipartData)
  @Version('1')
  findOne(@Param('id') id: string) {
    return this.uploadService.findOne(+id);
  }

  @Patch(':id')
  @ApiConsumes(SwaggerConsumes.MultipartData)
  @Version('1')
  update(@Param('id') id: string, @Body() uploadDto: UploadDto) {
    return this.uploadService.update(+id, uploadDto);
  }

  @Delete(':id')
  @ApiConsumes(SwaggerConsumes.MultipartData)
  @Version('1')
  remove(@Param('id') id: string) {
    return this.uploadService.remove(+id);
  }
}
