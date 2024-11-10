import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LibraryEventRegistration } from './library-event-registrations.entity';

@Entity()
export class LibraryEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ length: 255, nullable: true })
  banner: string;

  @Column({ type: 'int' })
  seats: number;

  @OneToMany(
    () => LibraryEventRegistration,
    (registration) => registration.event,
  )
  registrations: LibraryEventRegistration[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
