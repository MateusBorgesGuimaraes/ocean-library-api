import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const userData = {
        name: createUserDto.name,
        email: createUserDto.email,
        passwordHash: createUserDto.password,
      };

      const newUser = this.userRepository.create(userData);
      await this.userRepository.save(newUser);
      return newUser;
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

    return users;
  }

  findOne(id: number) {
    const user = this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findByEmail(email: string) {
    const users = await this.userRepository.find({
      where: {
        email: ILike(`%${email}%`),
      },
      select: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
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
