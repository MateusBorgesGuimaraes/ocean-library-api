import { CreateLoanDto } from './create-loan.dto';

export class LoanDto extends CreateLoanDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}
