import { CreateLibraryEventDto } from './create-library-event.dto';

export class LibraryEventDto extends CreateLibraryEventDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}
