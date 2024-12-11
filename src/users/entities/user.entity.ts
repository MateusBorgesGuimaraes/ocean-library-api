import { IsEmail } from 'class-validator';
import { RoutePolicies } from 'src/auth/enum/route-policies.enum';
import { LibraryEventRegistration } from 'src/library-events/entities/library-event-registrations.entity';
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
  @IsEmail()
  email: string;

  @Column({ length: 255 })
  passwordHash: string;

  @OneToMany(() => Loan, (loan) => loan.user, {
    cascade: true,
  })
  loans: Loan[];

  @OneToMany(
    () => LibraryEventRegistration,
    (registration) => registration.user,
    {
      cascade: true,
    },
  )
  events: LibraryEventRegistration[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'simple-array', default: [] })
  permissions: RoutePolicies[];
}
