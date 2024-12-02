import { Book } from 'src/books/entities/book.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FeaturedType } from '../enum/featured-type.enum';
import { News } from 'src/news/entities/news.entity';
import { LibraryEvent } from 'src/library-events/entities/library-event.entity';

@Entity('editor_choices')
export class EditorChoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: FeaturedType,
    default: FeaturedType.BOOK,
  })
  type: FeaturedType;

  @ManyToOne(() => Book, { eager: true, nullable: true })
  book?: Book;

  @ManyToOne(() => News, { eager: true, nullable: true })
  news?: News;

  @ManyToOne(() => LibraryEvent, { eager: true, nullable: true })
  event?: LibraryEvent;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;
}
