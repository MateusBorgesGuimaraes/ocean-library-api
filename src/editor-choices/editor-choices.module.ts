import { Module } from '@nestjs/common';
import { EditorChoicesService } from './editor-choices.service';
import { EditorChoicesController } from './editor-choices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from 'src/books/entities/book.entity';
import { EditorChoice } from './entities/editor-choice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EditorChoice, Book])],
  controllers: [EditorChoicesController],
  providers: [EditorChoicesService],
})
export class EditorChoicesModule {}
