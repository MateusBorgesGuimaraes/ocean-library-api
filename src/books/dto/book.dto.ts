import { CreateBookDto } from './create-book.dto';

export class BookDto extends CreateBookDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}
