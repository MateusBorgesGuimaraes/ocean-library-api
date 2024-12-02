import { Module } from '@nestjs/common';
import { EditorChoicesService } from './editor-choices.service';
import { EditorChoicesController } from './editor-choices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from 'src/books/entities/book.entity';
import { EditorChoice } from './entities/editor-choice.entity';
import { LibraryEvent } from 'src/library-events/entities/library-event.entity';
import { News } from 'src/news/entities/news.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EditorChoice, Book, LibraryEvent, News])],
  controllers: [EditorChoicesController],
  providers: [EditorChoicesService],
})
export class EditorChoicesModule {}
