import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AttributeEntity } from './entities/attribute.entity';
import { AttributeMetaEntity } from './entities/attribute-meta.entity';
import {CreateAttributeMetaDto} from './dto/create-attributeMeta.dto';
import {UpdateAttributeMetaDto} from './dto/update-attributeMeta.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { paginationSolver } from 'src/utils/common/paginationSolver';


@Injectable()
export class AttributeMetaService {

    constructor(
        @InjectRepository(AttributeEntity)
        private readonly attributeRepo: Repository<AttributeEntity>,
        @InjectRepository(AttributeMetaEntity)
        private readonly attributeMetaRepo: Repository<AttributeMetaEntity>
    ){}

    async create(createDto: CreateAttributeMetaDto) {
        const {title, slug, attribute:attributeId} = createDto;

        const attribute = await this.attributeRepo.findOne({ where: { id: attributeId } });
        if (!attribute) throw new NotFoundException('اتربیوتی با این ایدی یافت نشد');


        let newAttributeMeta = this.attributeMetaRepo.create({
            title,
            slug,
            attribute ,
        });
        return await this.attributeMetaRepo.save(newAttributeMeta);
    }

    async findAll(paginationDto: PaginationDto) {
        const {limit , page , skip} = paginationSolver(paginationDto);

        const [attributeMetas , count] = await this.attributeMetaRepo.findAndCount({
            relations:{
                attribute: true,
            },
            select:{
                id: true,
                title: true,
                slug: true,
                attribute:{
                    id: true,
                    title: true,
                    slug: true,
                    isDynamic: true
                }
            },
            skip , 
            take: limit, 
            order: {id: "DESC"}
        });
      
        return{
            attributeMetas ,
            pagination: {
                count,
                page,
                limit,
            },
        }
    }

    async findOne(id: number) {
        const attributeMeta =  await this.attributeMetaRepo.findOne({
            where: {id},
            relations:{
                attribute:true
            }
        });
        if(!attributeMeta){
        throw new NotFoundException('اتربیوت متا یافت نشد');
        }
        return attributeMeta;
    }

    async update(id: number, updateAttributeMetaDto: UpdateAttributeMetaDto) {
        const attributeMeta = await this.attributeMetaRepo.findOne({
            where:{
                id
            },
            relations:{
                attribute: true
            }
        });
        if(!attributeMeta){
            throw new NotFoundException("ویژگی مورد نظر یافت نشد");
        }
        const { title, slug, attribute:attributeId } = updateAttributeMetaDto;

        if (slug && slug !== attributeMeta.slug) {
            const existing = await this.attributeMetaRepo.findOne({ where: { slug } });
            if (existing) {
            throw new ConflictException('اتربیوت متا با این اسلاگ قبلاً ثبت شده است.');
            }
            attributeMeta.slug = slug;
        }
        if (title !== undefined) attributeMeta.title = title;
        if (attributeId !== undefined && attributeId !== attributeMeta.attribute.id) {
            const attribute = await this.attributeRepo.findOneBy({id});
            if(!attribute){
                throw new NotFoundException("ویژگی مورد نظر یافت نشد");
            }
            attributeMeta.attribute = attribute
        }
        await this.attributeMetaRepo.save(attributeMeta);
        return attributeMeta;
    }

    async remove(id: number) {
        const attributeMeta = await this.attributeMetaRepo.findOne({
          where: { id },
        });    
        if (!attributeMeta) {
          throw new NotFoundException('اتربیوت متای مورد نظر یافت نشد');
        }
        await this.attributeMetaRepo.delete(id);
        return { message: 'اتربیوت متا با موفقیت حذف شد' };
    }
} 