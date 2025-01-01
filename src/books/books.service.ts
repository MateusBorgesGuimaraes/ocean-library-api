import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Repository } from 'typeorm';
import { SearchBookDto } from './dto/search-book.dto';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async create(createBookDto: CreateBookDto) {
    try {
      const book = this.bookRepository.create(createBookDto);
      const result = await this.bookRepository.save(book);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (book) return book;
    throw new NotFoundException('Book not found');
  }

  async getLastTen() {
    const books = await this.bookRepository.find({
      take: 10,
      order: { createdAt: 'DESC' },
    });

    if (!books || books.length === 0) {
      throw new NotFoundException('Books not found');
    }

    return books;
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    const book = await this.bookRepository.findOneBy({ id });
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    book.title = updateBookDto?.title ?? book.title;
    book.author = updateBookDto?.author ?? book.author;
    book.publisher = updateBookDto?.publisher ?? book.publisher;
    book.year = updateBookDto?.year ?? book.year;
    book.isbn = updateBookDto?.isbn ?? book.isbn;
    book.synopsis = updateBookDto?.synopsis ?? book.synopsis;
    book.availability = updateBookDto?.availability ?? book.availability;
    book.quantity = updateBookDto?.quantity ?? book.quantity;
    return this.bookRepository.save(book);
  }

  async remove(id: number) {
    const book = await this.findOne(id);
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return this.bookRepository.remove(book);
  }

  async searchBooks(searchDto: SearchBookDto) {
    const queryBuilder = this.bookRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.category', 'category')
      .skip((searchDto.page - 1) * searchDto.limit)
      .take(searchDto.limit);

    if (searchDto.title) {
      queryBuilder.andWhere('LOWER(book.title) LIKE LOWER(:title)', {
        title: `%${searchDto.title}%`,
      });
    }

    if (searchDto.author) {
      queryBuilder.andWhere('LOWER(book.author) LIKE LOWER(:author)', {
        author: `%${searchDto.author}%`,
      });
    }

    if (searchDto.publisher) {
      queryBuilder.andWhere('LOWER(book.publisher) LIKE LOWER(:publisher)', {
        publisher: `%${searchDto.publisher}%`,
      });
    }

    if (searchDto.categoryId) {
      queryBuilder.andWhere('category.id = :categoryId', {
        categoryId: searchDto.categoryId,
      });
    }

    if (searchDto.availability) {
      queryBuilder.andWhere('book.availability = :availability', {
        availability: searchDto.availability,
      });
    }

    const [books, total] = await queryBuilder.getManyAndCount();

    return {
      data: books,
      meta: {
        page: searchDto.page,
        limit: searchDto.limit,
        total,
        totalPages: Math.ceil(total / searchDto.limit),
      },
    };
  }

  async searchBooksSimple(searchDto: SearchBookDto) {
    const queryBuilder = this.bookRepository
      .createQueryBuilder('book')
      .select(['book.id', 'book.title'])
      .leftJoin('book.category', 'category')
      .skip((searchDto.page - 1) * searchDto.limit)
      .take(searchDto.limit);

    if (searchDto.title) {
      queryBuilder.andWhere('LOWER(book.title) LIKE LOWER(:title)', {
        title: `%${searchDto.title}%`,
      });
    }

    if (searchDto.author) {
      queryBuilder.andWhere('LOWER(book.author) LIKE LOWER(:author)', {
        author: `%${searchDto.author}%`,
      });
    }

    if (searchDto.publisher) {
      queryBuilder.andWhere('LOWER(book.publisher) LIKE LOWER(:publisher)', {
        publisher: `%${searchDto.publisher}%`,
      });
    }

    if (searchDto.categoryId) {
      queryBuilder.andWhere('category.id = :categoryId', {
        categoryId: searchDto.categoryId,
      });
    }

    if (searchDto.availability) {
      queryBuilder.andWhere('book.availability = :availability', {
        availability: searchDto.availability,
      });
    }

    const [books, total] = await queryBuilder.getManyAndCount();

    return {
      data: books,
      meta: {
        page: searchDto.page,
        limit: searchDto.limit,
        total,
        totalPages: Math.ceil(total / searchDto.limit),
      },
    };
  }

  async uploadCover(file: Express.Multer.File, id: number) {
    const book = await this.bookRepository.findOneBy({
      id: id,
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (file.size < 1024) {
      throw new BadRequestException('File too small');
    }

    const fileExtension = path
      .extname(file.originalname)
      .toLowerCase()
      .substring(1);

    const fileName = `book-${id}.${fileExtension}`;
    const fileFullPath = path.resolve(process.cwd(), 'pictures', fileName);

    // talvez fazer a validacao do tipo do arquivo

    await fs.writeFile(fileFullPath, file.buffer);

    book.cover = fileName;

    await this.bookRepository.save(book);
    return book;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [books, total] = await this.bookRepository.findAndCount({
      skip,
      take: limit,
      relations: ['category'],
      order: {
        id: 'DESC',
      },
    });

    return {
      data: books,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
