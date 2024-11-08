import { CreateNewsDto } from './create-news.dto';

export class NewsDto extends CreateNewsDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}
