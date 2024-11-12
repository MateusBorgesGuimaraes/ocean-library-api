import { IsNotEmpty } from 'class-validator';

export class CreateLoanDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  bookId: number;
}
