import { LibraryEvent } from 'src/library-events/entities/library-event.entity';
import { Loan } from 'src/loans/entities/loan.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ length: 255 })
  passwordHash: string;

  @Column({ default: 'user' })
  role: string;

  @OneToMany(() => Loan, (loan) => loan.user)
  loans: Loan[];

  @OneToMany(() => LibraryEvent, (event) => event.user)
  events: LibraryEvent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
