import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { LibraryEvent } from './library-event.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('library_event_registrations')
export class LibraryEventRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LibraryEvent, (event) => event.registrations)
  event: LibraryEvent;

  @ManyToOne(() => User)
  user: User;

  @Column({ default: false })
  attended: boolean;

  @CreateDateColumn()
  registeredAt: Date;
}
