import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from './entities/request.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
  ) {}

  async create(createRequestDto: CreateRequestDto) {
    const request = this.requestRepository.create(createRequestDto);
    const result = await this.requestRepository.save(request);
    return result;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [requests, total] = await this.requestRepository.findAndCount({
      skip,
      take: limit,
    });

    return {
      data: requests,
      meta: {
        currentPage: page,
        totalItems: total,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async remove(id: number) {
    const request = await this.requestRepository.findOneBy({ id });
    if (!request) {
      throw new NotFoundException('Request not found');
    }
    return this.requestRepository.remove(request);
  }
}
