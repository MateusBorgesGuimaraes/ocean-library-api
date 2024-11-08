import { Category } from 'src/category/entities/category.entity';
import { Loan } from 'src/loans/entities/loan.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  author: string;

  @Column({ type: 'varchar', length: 255 })
  publisher: string;

  @Column({ type: 'int' })
  year: number;

  // @Column({ default: '' })
  // cover: string;

  @Column({ type: 'varchar', length: 255 })
  isbn: string;

  @Column({ type: 'text' })
  synopsis: string;

  @Column({ default: true })
  availability: boolean;

  @ManyToOne(() => Category, (category) => category.books, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Loan, (loan) => loan.book)
  loans: Loan[];

  @Column({ type: 'int', default: 1 })
  quantidade: number;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
