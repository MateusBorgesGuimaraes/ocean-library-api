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
  BadRequestException,
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

  @Get('findAll')
  async getAllLoans(
    @Query('status') status?: LoanStatus,
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
  ) {
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      throw new BadRequestException('Invalid page or limit parameters');
    }

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

  @Put(':id/pickup')
  async pickupBook(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.pickupBook(id);
  }

  @Put(':id/renew')
  async renewLoan(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.renewLoan(id);
  }

  @Put(':id/return')
  async returnBook(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.returnBook(id);
  }

  @Get('user/:userId')
  async getUserLoans(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('status') status?: LoanStatus,
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
  ) {
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    return this.loansService.getUserLoans(userId, status, page, limit);
  }

  @Get('status/overdue')
  async getOverdueLoans(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.loansService.getOverdueLoans(page, limit);
  }

  @Get('/statistics')
  async loanStatistics() {
    return this.loansService.getLoanStatistics();
  }
}
