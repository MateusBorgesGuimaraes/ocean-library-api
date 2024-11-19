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
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
import { RoutePolicies } from 'src/auth/enum/route-policies.enum';
import { AuthAndPolicyGuard } from 'src/auth/guards/auth-and-policy.guard';

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Get('statistics')
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.librarian)
  @UseGuards(AuthAndPolicyGuard)
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
  @UseGuards(AuthTokenGuard)
  async createLoan(
    @Body() createLoanDto: CreateLoanDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.loansService.createLoan(createLoanDto, tokenPayload);
  }

  @Get('findAll')
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.librarian)
  @UseGuards(AuthAndPolicyGuard)
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
  @SetRoutePolicy(
    RoutePolicies.admin,
    RoutePolicies.librarian,
    RoutePolicies.user,
  )
  @UseGuards(AuthAndPolicyGuard)
  async getLoanById(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    const loan = await this.loansService.getLoanById(id, tokenPayload);
    if (!loan) {
      throw new NotFoundException('Loan not found');
    }
    return loan;
  }

  @Put(':id/pickup')
  @UseGuards(AuthTokenGuard)
  async pickupBook(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    console.log('id', id);
    return this.loansService.pickupBook(id, tokenPayload);
  }

  @Put(':id/renew')
  @UseGuards(AuthTokenGuard)
  async renewLoan(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.loansService.renewLoan(id, tokenPayload);
  }

  @Put(':id/return')
  @UseGuards(AuthTokenGuard)
  async returnBook(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.loansService.returnBook(id, tokenPayload);
  }

  @Get('user/:userId')
  @SetRoutePolicy(
    RoutePolicies.admin,
    RoutePolicies.librarian,
    RoutePolicies.user,
  )
  @UseGuards(AuthAndPolicyGuard)
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
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.librarian)
  @UseGuards(AuthAndPolicyGuard)
  async getOverdueLoans(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.loansService.getOverdueLoans(page, limit);
  }

  @Get('search/email')
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.librarian)
  @UseGuards(AuthAndPolicyGuard)
  async getUserLoanByEmail(
    @Query('email') email: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    if (!email) {
      throw new NotFoundException('Email parameter is required');
    }
    return this.loansService.getUserLoansByEmail(email, tokenPayload);
  }

  @Get('directly/:bookId/:userId')
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.librarian)
  @UseGuards(AuthAndPolicyGuard)
  async getBookdirectly(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.loansService.getBookdirectly(bookId, userId);
  }
}
