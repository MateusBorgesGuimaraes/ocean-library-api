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

    const loadData = await this.loanRepository.save(loan);

    const cleanLoan = {
      id: loadData.id,
      status: loadData.status,
      requestDate: loadData.requestDate,
      dueDate: loadData.dueDate,
      book: {
        id: loadData.book.id,
        title: loadData.book.title,
        author: loadData.book.author,
      },
      user: {
        id: loadData.user.id,
        name: loadData.user.name,
        email: loadData.user.email,
      },
      renewalCount: loadData.renewalCount,
      pickupDate: loadData.pickupDate,
      returnDate: loadData.returnDate,
    };

    return cleanLoan as Loan;
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

    const loadData = await this.loanRepository.save(loan);

    const cleanLoan = {
      id: loadData.id,
      status: loadData.status,
      requestDate: loadData.requestDate,
      dueDate: loadData.dueDate,
      book: {
        id: loadData.book.id,
        title: loadData.book.title,
        author: loadData.book.author,
      },
      user: {
        id: loadData.user.id,
        name: loadData.user.name,
        email: loadData.user.email,
      },
      renewalCount: loadData.renewalCount,
      pickupDate: loadData.pickupDate,
      returnDate: loadData.returnDate,
    };

    return cleanLoan as Loan;
  }

  async deleteLoan(loanId: number, tokenPayload: TokenPayloadDto) {
    const loan = await this.loanRepository.findOne({
      where: { id: loanId },
      relations: ['book', 'user'],
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    const applicantPermissions = await this.userRepository.findOne({
      where: { id: tokenPayload.sub },
      select: ['id', 'permissions'],
    });

    if (
      loan.user.id !== tokenPayload.sub &&
      !applicantPermissions.permissions.includes(RoutePolicies.admin) &&
      !applicantPermissions.permissions.includes(RoutePolicies.librarian)
    ) {
      throw new ForbiddenException(
        'You are not authorized to delete this loan',
      );
    }

    if (loan.status !== LoanStatus.PENDING) {
      throw new BadRequestException('Can only delete pending loans');
    }

    const book = loan.book;
    book.quantity += 1;
    book.availability = true;
    await this.bookRepository.save(book);

    await this.loanRepository.remove(loan);

    return {
      message: 'Loan deleted successfully',
      loan: {
        id: loan.id,
        book: {
          id: loan.book.id,
        },
        user: {
          id: loan.user.id,
        },
      },
    };
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

    const pickUpLoan = await this.loanRepository.save(loan);

    const cleanLoan = {
      id: pickUpLoan.id,
      status: pickUpLoan.status,
      requestDate: pickUpLoan.requestDate,
      dueDate: pickUpLoan.dueDate,
      book: {
        id: pickUpLoan.book.id,
        title: pickUpLoan.book.title,
        author: pickUpLoan.book.author,
      },
      user: {
        id: pickUpLoan.user.id,
        name: pickUpLoan.user.name,
        email: pickUpLoan.user.email,
      },
      renewalCount: pickUpLoan.renewalCount,
      pickupDate: pickUpLoan.pickupDate,
      returnDate: pickUpLoan.returnDate,
    };

    return cleanLoan as Loan;
  }

  async renewLoan(
    loanId: number,
    tokenPayload: TokenPayloadDto,
  ): Promise<Loan> {
    const loan = await this.getLoanById(loanId, tokenPayload);

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    if (loan.status !== LoanStatus.PICKED_UP) {
      throw new BadRequestException('Can only renew active loans');
    }

    if (loan.renewalCount >= 1) {
      throw new BadRequestException('Maximum renewal limit reached');
    }

    loan.renewalCount += 1;
    loan.status = LoanStatus.RENEWED;
    loan.dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const renewLoan = await this.loanRepository.save(loan);

    const cleanLoan = {
      id: renewLoan.id,
      status: renewLoan.status,
      requestDate: renewLoan.requestDate,
      dueDate: renewLoan.dueDate,
      book: {
        id: renewLoan.book.id,
        title: renewLoan.book.title,
        author: renewLoan.book.author,
      },
      user: {
        id: renewLoan.user.id,
        name: renewLoan.user.name,
        email: renewLoan.user.email,
      },
      renewalCount: renewLoan.renewalCount,
      pickupDate: renewLoan.pickupDate,
      returnDate: renewLoan.returnDate,
    };

    return cleanLoan as Loan;
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

    const returnLoan = await this.loanRepository.save(loan);

    const cleanLoan = {
      id: returnLoan.id,
      status: returnLoan.status,
      requestDate: returnLoan.requestDate,
      dueDate: returnLoan.dueDate,
      book: {
        id: returnLoan.book.id,
        title: returnLoan.book.title,
        author: returnLoan.book.author,
      },
      user: {
        id: returnLoan.user.id,
        name: returnLoan.user.name,
        email: returnLoan.user.email,
      },
      renewalCount: returnLoan.renewalCount,
      pickupDate: returnLoan.pickupDate,
      returnDate: returnLoan.returnDate,
    };

    return cleanLoan as Loan;
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
      select: ['id', 'permissions'],
    });

    if (
      userId !== tokenPayload.sub &&
      !applicantPermissions.permissions.includes(RoutePolicies.admin) &&
      !applicantPermissions.permissions.includes(RoutePolicies.librarian)
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

    if (loans.length === 0) {
      throw new NotFoundException('No loans found for this user');
    }

    const cleanLoans = loans.map((loan) => {
      return {
        id: loan.id,
        status: loan.status,
        requestDate: loan.requestDate,
        dueDate: loan.dueDate,
        book: {
          id: loan.book.id,
          title: loan.book.title,
          author: loan.book.author,
        },
        user: {
          id: loan.user.id,
          name: loan.user.name,
          email: loan.user.email,
        },
        renewalCount: loan.renewalCount,
        pickupDate: loan.pickupDate,
        returnDate: loan.returnDate,
      };
    });

    return {
      data: cleanLoans,
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

    if (loans.length === 0) {
      throw new NotFoundException('No loans found');
    }

    const cleanLoans = loans.map((loan) => {
      return {
        id: loan.id,
        status: loan.status,
        requestDate: loan.requestDate,
        dueDate: loan.dueDate,
        book: {
          id: loan.book.id,
          title: loan.book.title,
          author: loan.book.author,
        },
        user: {
          id: loan.user.id,
          name: loan.user.name,
          email: loan.user.email,
        },
        renewalCount: loan.renewalCount,
        pickupDate: loan.pickupDate,
        returnDate: loan.returnDate,
      };
    });

    return {
      data: cleanLoans,
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
      select: ['id', 'permissions'],
    });

    if (
      loan.user.id !== tokenPayload.sub &&
      !applicantPermissions.permissions.includes(RoutePolicies.admin) &&
      !applicantPermissions.permissions.includes(RoutePolicies.librarian)
    ) {
      throw new ForbiddenException('You are not the owner of this loan');
    }

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    const cleanLoan = {
      id: loan.id,
      status: loan.status,
      requestDate: loan.requestDate,
      dueDate: loan.dueDate,
      book: {
        id: loan.book.id,
        title: loan.book.title,
        cover: loan.book.cover,
        publisher: loan.book.publisher,
        year: loan.book.year,
        quantity: loan.book.quantity,
        availability: loan.book.availability,
        author: loan.book.author,
      },
      user: {
        id: loan.user.id,
        name: loan.user.name,
        email: loan.user.email,
      },
      renewalCount: loan.renewalCount,
      pickupDate: loan.pickupDate,
      returnDate: loan.returnDate,
    };

    return cleanLoan;
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

  async getAverageLoanDuration() {
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

  async getUserLoansByEmail(
    email: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const query = this.loanRepository
      .createQueryBuilder('loan')
      .leftJoinAndSelect('loan.user', 'user')
      .leftJoinAndSelect('loan.book', 'book')
      .where('user.email = :email', { email });

    const [loans, total] = await query
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    if (!loans || loans.length === 0) {
      throw new NotFoundException('No loans found for this user');
    }

    const cleanLoans = loans.map((loan) => {
      return {
        id: loan.id,
        status: loan.status,
        requestDate: loan.requestDate,
        dueDate: loan.dueDate,
        book: {
          id: loan.book.id,
          title: loan.book.title,
          author: loan.book.author,
        },
        user: {
          id: loan.user.id,
          name: loan.user.name,
          email: loan.user.email,
        },
        renewalCount: loan.renewalCount,
        pickupDate: loan.pickupDate,
        returnDate: loan.returnDate,
      };
    });

    return {
      data: cleanLoans,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
