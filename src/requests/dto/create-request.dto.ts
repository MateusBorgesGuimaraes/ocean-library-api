import { IsNumber, IsString } from 'class-validator';
import { User } from 'src/users/entities/user.entity';

export class CreateRequestDto {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsString()
  publisher: string;

  @IsNumber()
  year: number;

  @IsString()
  genre: string;

  user: User;
}
