import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Repository } from 'typeorm';
import { SearchBookDto } from './dto/search-book.dto';

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
    const book = await this.bookRepository.findOneBy({ id });
    if (book) return book;
    throw new NotFoundException('Book not found');
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
}
