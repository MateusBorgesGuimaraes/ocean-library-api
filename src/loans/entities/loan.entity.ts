import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Book } from 'src/books/entities/book.entity';

export enum LoanStatus {
  PENDING = 'pending', // Initial state when loan is created
  PICKED_UP = 'picked_up', // Book has been picked up
  RETURNED = 'returned', // Book has been returned
  RENEWED = 'renewed', // Loan has been renewed
  CANCELLED = 'cancelled', // Loan was cancelled (not picked up in time)
  OVERDUE = 'overdue', // Loan is past due date
}

@Entity()
export class Loan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.loans, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Book, (book) => book.loans, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @Column({
    type: 'enum',
    enum: LoanStatus,
    default: LoanStatus.PENDING,
  })
  status: LoanStatus;

  @Column({ type: 'timestamp' })
  requestDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  pickupDate: Date;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  returnDate: Date;

  @Column({ type: 'int', default: 0 })
  renewalCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
