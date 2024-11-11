import { Type, Transform } from 'class-transformer';
import { IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  title: string;

  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  author: string;

  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  publisher: string;

  @IsNumber()
  @Min(1900)
  @Type(() => Number)
  year: number;

  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  genre: string;
}
