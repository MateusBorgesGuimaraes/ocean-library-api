import { IsBoolean, IsDate } from 'class-validator';
import { Book } from 'src/books/entities/book.entity';
import { User } from 'src/users/entities/user.entity';

export class CreateLoanDto {
  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;

  @IsBoolean()
  returned: boolean;

  user: User;

  book: Book;
}
