import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from 'src/loans/entities/loan.entity';
import { User } from './entities/user.entity';
import { LibraryEvent } from 'src/library-events/entities/library-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User]), Loan, LibraryEvent],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
