import { IsEmail } from 'class-validator';
// import { LibraryEvent } from 'src/library-events/entities/library-event.entity';
import { Loan } from 'src/loans/entities/loan.entity';
import { Request } from 'src/requests/entities/request.entity';

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
  @IsEmail()
  email: string;

  @Column({ length: 255 })
  passwordHash: string;

  @Column({
    type: 'varchar',
    default: 'user',
    enum: ['user', 'admin', 'librarian'],
  })
  role: string;

  @OneToMany(() => Loan, (loan) => loan.user, {
    cascade: true,
  })
  loans: Loan[];

  // @OneToMany(() => LibraryEvent, (event) => event.user, {
  //   cascade: true,
  // })
  // events: LibraryEvent[];

  @OneToMany(() => Request, (request) => request.user, {
    cascade: true,
  })
  requests: Request[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
