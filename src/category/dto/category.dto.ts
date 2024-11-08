import { BookDto } from 'src/books/dto/book.dto';
import { CreateCategoryDto } from './create-category.dto';

export class CategoryDto extends CreateCategoryDto {
  id: number;
  books: BookDto[];
  createdAt: Date;
  updatedAt: Date;
}
