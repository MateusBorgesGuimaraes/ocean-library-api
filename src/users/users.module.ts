import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from 'src/loans/entities/loan.entity';
import { Request } from 'src/requests/entities/request.entity';
import { User } from './entities/user.entity';
import { LibraryEventRegistration } from 'src/library-events/entities/library-event-registrations.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, LibraryEventRegistration]),
    Loan,
    Request,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
