import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

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
}
