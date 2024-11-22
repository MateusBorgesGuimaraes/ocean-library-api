import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import { ILike, Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class NewsService {
  libraryEventsRepository: any;
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

  async uploadCoverImage(file: Express.Multer.File, id: number) {
    const news = await this.newsRepository.findOneBy({
      id: id,
    });

    if (!news) {
      throw new NotFoundException('News not found');
    }

    if (file.size < 1024) {
      throw new BadRequestException('File too small');
    }

    const fileExtension = path
      .extname(file.originalname)
      .toLowerCase()
      .substring(1);

    const fileName = `news-${id}.${fileExtension}`;
    const fileFullPath = path.resolve(process.cwd(), 'pictures', fileName);

    // talvez fazer a validacao do tipo do arquivo

    await fs.writeFile(fileFullPath, file.buffer);

    news.coverImage = fileName;

    await this.newsRepository.save(news);
    return news;
  }
}
