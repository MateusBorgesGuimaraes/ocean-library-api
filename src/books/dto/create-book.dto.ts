import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Category } from 'src/category/entities/category.entity';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsString()
  publisher: string;

  @IsNumber()
  year: number;

  @IsString()
  @IsOptional()
  cover: string;

  @IsString()
  isbn: string;

  @IsString()
  synopsis: string;

  @IsBoolean()
  availability: boolean;

  @IsNumber()
  quantity: number;

  @IsOptional()
  category: Category;
}
