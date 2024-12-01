import { Book } from 'src/books/entities/book.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('editor_choices')
export class EditorChoice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Book, { eager: true })
  book: Book;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;
}
