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
  UseGuards,
} from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { LoanStatus } from './entities/loan.entity';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@UseGuards(AuthTokenGuard)
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Get('statistics')
  async getLoanStatistics() {
    console.log('Accessing statistics endpoint');
    try {
      const stats = await this.loansService.getLoanStatistics();
      console.log('Statistics retrieved:', stats);
      return stats;
    } catch (error) {
      console.error('Statistics error:', error);
      throw new BadRequestException(`Statistics error: ${error.message}`);
    }
  }

  @Post()
  async createLoan(
    @Body() createLoanDto: CreateLoanDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.loansService.createLoan(createLoanDto, tokenPayload);
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
  async pickupBook(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    console.log('id', id);
    return this.loansService.pickupBook(id, tokenPayload);
  }

  @Put(':id/renew')
  async renewLoan(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.loansService.renewLoan(id, tokenPayload);
  }

  @Put(':id/return')
  async returnBook(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.loansService.returnBook(id, tokenPayload);
  }

  @Get('user/:userId')
  async getUserLoans(
    @Param('userId', ParseIntPipe) userId: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Query('status') status?: LoanStatus,
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
  ) {
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    return this.loansService.getUserLoans(
      userId,
      tokenPayload,
      status,
      page,
      limit,
    );
  }

  @Get('status/overdue')
  async getOverdueLoans(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.loansService.getOverdueLoans(page, limit);
  }

  @Get('directly/:bookId/:userId')
  async getBookdirectly(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.loansService.getBookdirectly(bookId, userId);
  }
}
