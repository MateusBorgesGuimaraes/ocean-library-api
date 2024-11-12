import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Put,
  NotFoundException,
} from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { LoanStatus } from './entities/loan.entity';

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  async createLoan(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.createLoan(createLoanDto);
  }

  @Get()
  async getAllLoans(
    @Query('status') status?: LoanStatus,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.loansService.getAllLoans(status, page, limit);
  }

  @Get(':id')
  async getLoanById(@Param('id', ParseIntPipe) id: number) {
    const loan = await this.loansService.getLoanById(id);
    if (!loan) {
      throw new NotFoundException('Loan not found');
    }
    return loan;
  }

  // @Put(':id/pickup')
  // async pickupBook(@Param('id', ParseIntPipe) id: number) {
  //   return this.loansService.pickupBook(id);
  // }

  @Put(':id/renew')
  async renewLoan(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.renewLoan(id);
  }

  @Put(':id/return')
  async returnBook(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.returnBook(id);
  }

  // @Get('user/:userId')
  // async getUserLoans(
  //   @Param('userId', ParseIntPipe) userId: number,
  //   @Query('status') status?: LoanStatus,
  //   @Query('page', ParseIntPipe) page: number = 1,
  //   @Query('limit', ParseIntPipe) limit: number = 10,
  // ) {
  //   return this.loansService.getUserLoans(userId, status, page, limit);
  // }

  @Get('status/overdue')
  async getOverdueLoans(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.loansService.getOverdueLoans(page, limit);
  }
}
