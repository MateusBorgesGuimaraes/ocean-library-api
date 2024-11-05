import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Loan } from 'src/loans/entities/loan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book]), Loan],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
