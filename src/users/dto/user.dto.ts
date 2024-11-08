import { LoanDto } from 'src/loans/dto/loan.dto';
import { CreateUserDto } from './create-user.dto';
import { LibraryEventDto } from 'src/library-events/dto/library-event.dto';
import { NewsDto } from 'src/news/dto/news.dto';
import { RequestDto } from 'src/requests/dto/request.dto';

export class UserDto extends CreateUserDto {
  id: number;
  loans: LoanDto[];
  events: LibraryEventDto[];
  news: NewsDto[];
  requests: RequestDto[];
  createdAt: Date;
  updatedAt: Date;
}
