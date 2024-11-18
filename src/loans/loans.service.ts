import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLoanDto } from './dto/create-loan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Loan, LoanStatus } from './entities/loan.entity';
import { Book } from 'src/books/entities/book.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { RoutePolicies } from 'src/auth/enum/route-policies.enum';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createLoan(
    createLoanDto: CreateLoanDto,
    tokenPayload: TokenPayloadDto,
  ): Promise<Loan> {
    const book = await this.bookRepository.findOne({
      where: { id: createLoanDto.bookId },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (!book.availability || book.quantity < 1) {
      throw new NotFoundException('Book not available for laon');
    }

    const user = await this.userRepository.findOne({
      where: { id: createLoanDto.userId },
    });

    // const applicantPermissions = await this.userRepository.findOne({
    //   where: { id: tokenPayload.sub },
    //   select: ['id', 'permitions'],
    // });

    // if (!user || !applicantPermissions) {
    //   throw new NotFoundException('User not found');
    // }

    // if (
    //   user.id !== tokenPayload.sub &&
    //   !applicantPermissions.permitions.includes(RoutePolicies.admin) &&
    //   !applicantPermissions.permitions.includes(RoutePolicies.librarian)
    // ) {
    //   throw new ForbiddenException('Cannot create loan for another user');
    // }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id !== tokenPayload.sub) {
      throw new ForbiddenException('Cannot create loan for another user');
    }

    const hasOverdueBooks = await this.loanRepository.findOne({
      where: {
        user: { id: user.id },
        status: LoanStatus.OVERDUE,
      },
    });

    if (hasOverdueBooks) {
      throw new BadRequestException(
        'Cannot create new loan while having overdue books',
      );
    }

    const loan = this.loanRepository.create({
      user,
      book,
      status: LoanStatus.PENDING,
      requestDate: new Date(),
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    book.quantity -= 1;
    book.availability = book.quantity > 0;
    await this.bookRepository.save(book);

    return this.loanRepository.save(loan);
  }

  async getBookdirectly(bookId: number, userId: number): Promise<Loan> {
    const book = await this.bookRepository.findOne({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const loan = this.loanRepository.create({
      user,
      book,
      status: LoanStatus.PICKED_UP,
      requestDate: new Date(),
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return this.loanRepository.save(loan);
  }

  async pickupBook(
    loanId: number,
    tokenPayload: TokenPayloadDto,
  ): Promise<Loan> {
    const loan = await this.getLoanById(loanId, tokenPayload);

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    if (loan.status !== LoanStatus.PENDING) {
      throw new BadRequestException('Can only pick up active loans');
    }

    loan.status = LoanStatus.PICKED_UP;
    loan.pickupDate = new Date();

    return this.loanRepository.save(loan);
  }

  async renewLoan(
    loanId: number,
    tokenPayload: TokenPayloadDto,
  ): Promise<Loan> {
    const loan = await this.getLoanById(loanId, tokenPayload);

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    // const applicantPermissions = await this.userRepository.findOne({
    //   where: { id: tokenPayload.sub },
    //   select: ['id', 'permitions'],
    // });

    // if (
    //   loan.user.id !== tokenPayload.sub &&
    //   !applicantPermissions.permitions.includes(RoutePolicies.admin) &&
    //   !applicantPermissions.permitions.includes(RoutePolicies.librarian)
    // ) {
    //   throw new ForbiddenException('You are not the owner of this loan');
    // }

    if (loan.status !== LoanStatus.PICKED_UP) {
      throw new BadRequestException('Can only renew active loans');
    }

    if (loan.renewalCount >= 1) {
      throw new BadRequestException('Maximum renewal limit reached');
    }

    loan.renewalCount += 1;
    loan.status = LoanStatus.RENEWED;
    loan.dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    return this.loanRepository.save(loan);
  }

  async returnBook(
    loanId: number,
    tokenPayload: TokenPayloadDto,
  ): Promise<Loan> {
    const loan = await this.getLoanById(loanId, tokenPayload);

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    if (loan.status == LoanStatus.RETURNED) {
      throw new BadRequestException('Book already has benn returned');
    }

    loan.status = LoanStatus.RETURNED;
    loan.returnDate = new Date();

    const book = loan.book;
    book.quantity += 1;
    book.availability = true;

    await this.bookRepository.save(book);

    return this.loanRepository.save(loan);
  }

  async checkOverdueBooks() {
    const activeLoans = await this.loanRepository.find({
      where: [{ status: LoanStatus.PICKED_UP }, { status: LoanStatus.RENEWED }],
    });

    const now = new Date();
    for (const loan of activeLoans) {
      if (loan.dueDate < now) {
        loan.status = LoanStatus.OVERDUE;
        await this.loanRepository.save(loan);
      }
    }
  }

  async getUserLoans(
    userId: number,
    tokenPayload: TokenPayloadDto,
    status?: LoanStatus,
    page: number = 1,
    limit: number = 10,
  ) {
    const applicantPermissions = await this.userRepository.findOne({
      where: { id: tokenPayload.sub },
      select: ['id', 'permitions'],
    });

    if (
      userId !== tokenPayload.sub &&
      !applicantPermissions.permitions.includes(RoutePolicies.admin) &&
      !applicantPermissions.permitions.includes(RoutePolicies.librarian)
    ) {
      throw new ForbiddenException('You are not the owner of this loan');
    }

    const query = this.loanRepository
      .createQueryBuilder('loan')
      .leftJoinAndSelect('loan.book', 'book')
      .leftJoinAndSelect('loan.user', 'user')
      .where('user.id = :userId', { userId });

    if (status) {
      query.andWhere('loan.status = :status', { status });
    }

    const [loans, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: loans,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllLoans(status?: LoanStatus, page: number = 1, limit: number = 10) {
    const query = this.loanRepository
      .createQueryBuilder('loan')
      .leftJoinAndSelect('loan.book', 'book')
      .leftJoinAndSelect('loan.user', 'user');

    if (status) {
      query.where('loan.status = :status', { status });
    }

    const [loans, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: loans,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLoanById(id: number, tokenPayload: TokenPayloadDto) {
    const loan = await this.loanRepository.findOne({
      where: { id },
      relations: ['book', 'user'],
    });

    const applicantPermissions = await this.userRepository.findOne({
      where: { id: tokenPayload.sub },
      select: ['id', 'permitions'],
    });

    if (
      loan.user.id !== tokenPayload.sub &&
      !applicantPermissions.permitions.includes(RoutePolicies.admin) &&
      !applicantPermissions.permitions.includes(RoutePolicies.librarian)
    ) {
      throw new ForbiddenException('You are not the owner of this loan');
    }

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    return loan;
  }

  async getOverdueLoans(page: number = 1, limit: number = 10) {
    const query = this.loanRepository
      .createQueryBuilder('loan')
      .leftJoinAndSelect('loan.book', 'book')
      .leftJoinAndSelect('loan.user', 'user')
      .where('loan.status = :status', { status: LoanStatus.OVERDUE });

    const [loans, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: loans,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLoanStatistics() {
    console.log('passou no getLoanStatistics');
    const stats = await this.loanRepository
      .createQueryBuilder('loan')
      .select([
        'COUNT(*) as totalLoans',
        'COUNT(CASE WHEN loan.status = :overdue THEN 1 END) as overdueLoans',
        'COUNT(CASE WHEN loan.status = :active THEN 1 END) as activeLoans',
        'COUNT(CASE WHEN loan.status = :returned THEN 1 END) as returnedLoans',
      ])
      .setParameter('overdue', LoanStatus.OVERDUE)
      .setParameter('active', LoanStatus.PICKED_UP)
      .setParameter('returned', LoanStatus.RETURNED)
      .getRawOne();

    return {
      ...stats,
      averageLoanDuration: await this.getAverageLoanDuration(),
    };
  }

  private async getAverageLoanDuration() {
    console.log('passou bo getAverageLoanDuration');
    const completedLoans = await this.loanRepository.find({
      where: { status: LoanStatus.RETURNED },
      select: ['pickupDate', 'returnDate'],
    });

    if (completedLoans.length === 0) return 0;

    const totalDuration = completedLoans.reduce((sum, loan) => {
      const duration = loan.returnDate.getTime() - loan.pickupDate.getTime();
      return sum + duration;
    }, 0);

    return totalDuration / completedLoans.length / (1000 * 60 * 60 * 24);
  }
}
