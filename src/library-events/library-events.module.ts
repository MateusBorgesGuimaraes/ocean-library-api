import { Module } from '@nestjs/common';
import { LibraryEventsService } from './library-events.service';
import { LibraryEventsController } from './library-events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibraryEvent } from './entities/library-event.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LibraryEvent]), User],
  controllers: [LibraryEventsController],
  providers: [LibraryEventsService],
})
export class LibraryEventsModule {}
