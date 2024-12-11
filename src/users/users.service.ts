import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ILike, Repository } from 'typeorm';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/auth/config/jwt.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const passwordHash = await this.hashingService.hash(
        createUserDto.password,
      );

      const userData = {
        name: createUserDto.name,
        email: createUserDto.email,
        passwordHash,
        permissions: createUserDto.permissions,
      };

      const newUser = this.userRepository.create(userData);
      await this.userRepository.save(newUser);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const accessToken = await this.jwtService.signAsync(
        {
          sub: newUser.id,
          email: newUser.email,
        },
        {
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
          secret: this.jwtConfiguration.secret,
          expiresIn: this.jwtConfiguration.jwtTtl,
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _, ...result } = newUser;

      return {
        ...result,
        accessToken,
      };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Usuario ja existe');
      }
      throw error;
    }
  }

  async findAll() {
    const users = await this.userRepository.find({
      order: {
        id: 'desc',
      },
    });

    if (users.length === 0) {
      throw new NotFoundException('Users not found');
    }

    const usersWithoutPassword = users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      return result;
    });

    return usersWithoutPassword;
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user;

    return result;
  }

  async findByEmail(email: string) {
    const users = await this.userRepository.find({
      where: {
        email: ILike(`%${email}%`),
      },
      select: ['id', 'name', 'email', 'permissions', 'createdAt', 'updatedAt'],
      order: {
        email: 'ASC',
      },
      take: 10,
    });

    if (users.length === 0) {
      throw new NotFoundException('Nenhum usuário encontrado com este email');
    }

    return {
      total: users.length,
      users: users,
    };
  }
}
