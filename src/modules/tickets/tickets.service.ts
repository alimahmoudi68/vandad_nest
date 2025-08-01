import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketEntity } from './entities/ticket.entity';
import { IsNull, Repository } from 'typeorm';
import { UserService } from '../users/users.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(TicketEntity)
    private readonly ticketRepository: Repository<TicketEntity>,
    private readonly userService: UserService,
  ) {}

  async create(createTicketDto: CreateTicketDto) {
    const { title, description, userId, parentId } = createTicketDto;

    const user = await this.userService.findOne(userId);

    let ticketParent = await this.ticketRepository.findOne({
      where: {
        id: parentId,
      },
      relations: ['parent'],
    });

    if (parentId && !ticketParent) {
      throw new BadRequestException('تیکت پدر یافت نشد');
    }

    if (parentId && ticketParent && ticketParent.parent !== null) {
      throw new BadRequestException(
        'تیکت پدر نامعتبر است (خودش تیکت فرزند است)',
      );
    }

    let newTicket = this.ticketRepository.create({
      title,
      description,
      user,
      parent: ticketParent || undefined,
    });
    return await this.ticketRepository.save(newTicket);
  }

  async findAll(page: number, limit: number) {
    const take = limit;
    const skip = (page - 1) * limit;

    return await this.ticketRepository.find({
      where: {
        parent: IsNull(),
      },
      relations: ['childs'], // اضافه کردن رابطه برای گرفتن فرزندان
      skip,
      take,
    });

    // روش کوئری بیلدر
    // return await this.ticketRepository
    //   .createQueryBuilder('ticket')
    //   .leftJoinAndSelect('ticket.childs', 'childs')
    //   .where('ticket.parent IS NULL')
    //   .skip(skip)
    //   .take(take)
    //   .getMany();
  }

  async findOne(id: number) {
    let ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['childs'],
    });
    if (!ticket) {
      throw new NotFoundException('آدرس یافت نشد');
    }
    return ticket;
  }

  update(id: number, updateTicketDto: UpdateTicketDto) {
    return `This action updates a #${id} ticket`;
  }

  remove(id: number) {
    return `This action removes a #${id} ticket`;
  }
}
