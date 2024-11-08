import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { User } from 'src/users/entities/user.entity';

export class CreateLibraryEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDate()
  date: Date;

  @IsString()
  location: string;

  @IsString()
  @IsOptional()
  banner: string;

  @IsNumber()
  seats: number;

  @IsOptional()
  user: User;
}
