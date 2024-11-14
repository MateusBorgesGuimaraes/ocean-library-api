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
  PENDING = 'pending',
  PICKED_UP = 'picked_up',
  RETURNED = 'returned',
  RENEWED = 'renewed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
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
