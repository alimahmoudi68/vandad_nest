import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AttributeEntity } from './entities/attribute.entity';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationSolver } from 'src/utils/common/paginationSolver';



@Injectable()
export class AttributeService {

  constructor(
    @InjectRepository(AttributeEntity)
    private readonly attributeRepo: Repository<AttributeEntity>
  ){} 

  
  async create(createAttributeDto: CreateAttributeDto) {
    const {title, slug, isDynamic} = createAttributeDto;

    const attribute = await this.attributeRepo.findOne({ where: { slug } });
    if (attribute) {
      throw new ConflictException('ویژگی با این اسلاگ قبلاً ثبت شده است.');
    }

    let newAttribute = this.attributeRepo.create({
        title,
        slug,
        isDynamic ,
    });
    return await this.attributeRepo.save(newAttribute);
  }

  async findAll(paginationDto: PaginationDto) {
    const {limit , page , skip} = paginationSolver(paginationDto);
    
    const [attributes , count] = await this.attributeRepo.findAndCount({
        skip , 
        take: limit, 
        order: {id: "DESC"}
    });
          
    return{
        attributes ,
        pagination: {
            count,
            page,
            limit,
        },
    }
  }

  async findOne(id: number) {
    const attribute = await this.attributeRepo.findOneBy({id});
    if(!attribute){
      throw new NotFoundException("ویژگی مورد نظر یافت نشد");
    }
    return {attribute};
  }

  async update(id: number, updateAttributeDto: UpdateAttributeDto) {
    const attribute = await this.attributeRepo.findOneBy({id});
    if(!attribute){
      throw new NotFoundException("ویژگی مورد نظر یافت نشد");
    }
    const { title, slug, isDynamic } = updateAttributeDto;

    if (slug && slug !== attribute.slug) {
      const existing = await this.attributeRepo.findOne({ where: { slug } });
      if (existing) {
        throw new ConflictException('ویژگی با این اسلاگ قبلاً ثبت شده است.');
      }
      attribute.slug = slug;
    }
    if (title !== undefined) attribute.title = title;
    if (isDynamic !== undefined) attribute.isDynamic = isDynamic;
    await this.attributeRepo.save(attribute);
    return attribute;
  }

  async remove(id: number) {
    const attribute = await this.attributeRepo.findOne({
      where: { id },
    });    
    if (!attribute) {
      throw new NotFoundException('ویژگی مورد نظر یافت نشد');
    }
    await this.attributeRepo.delete(id);
    return { message: 'ویژگی با موفقیت حذف شد' };
  }
}
