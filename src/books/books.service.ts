import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Repository } from 'typeorm';

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

  findAll() {
    return `This action returns all books`;
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
}
