import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
  ) {}

  async create(createNewsDto: CreateNewsDto) {
    try {
      const news = this.newsRepository.create(createNewsDto);
      const result = await this.newsRepository.save(news);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getNewsByTitle(title: string) {
    const news = await this.newsRepository.find({
      where: {
        title: ILike(`%${title}%`),
      },
      select: [
        'id',
        'title',
        'content',
        'tags',
        'createdAt',
        'updatedAt',
        'isActive',
        'coverImage',
      ],
      order: {
        title: 'ASC',
      },
      take: 10,
    });

    if (!news) {
      throw new NotFoundException('News not found');
    }
    return news;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    console.log('skip', skip);

    const [news, total] = await this.newsRepository.findAndCount({
      order: {
        id: 'DESC',
      },
      skip,
      take: limit,
    });

    return {
      data: news,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  findOne(id: number) {
    const news = this.newsRepository.findOneBy({ id });
    if (news) return news;

    throw new NotFoundException('News not found');
  }

  async update(id: number, updateNewsDto: UpdateNewsDto) {
    const news = await this.findOne(id);
    if (!news) {
      throw new NotFoundException('News not found');
    }
    news.title = updateNewsDto?.title ?? news.title;
    news.content = updateNewsDto?.content ?? news.content;
    news.tags = updateNewsDto?.tags ?? news.tags;
    // news.imagemCapa = updateNewsDto?.imagemCapa ?? news.imagemCapa;
    await this.newsRepository.save(news);

    return news;
  }

  async remove(id: number) {
    const news = await this.findOne(id);
    if (!news) {
      throw new NotFoundException('News not found');
    }
    return this.newsRepository.remove(news);
  }
}
