import { Injectable } from '@nestjs/common';
import { CreateLibraryEventDto } from './dto/create-library-event.dto';
import { UpdateLibraryEventDto } from './dto/update-library-event.dto';

@Injectable()
export class LibraryEventsService {
  create(createLibraryEventDto: CreateLibraryEventDto) {
    return 'This action adds a new libraryEvent';
  }

  findAll() {
    return `This action returns all libraryEvents`;
  }

  findOne(id: number) {
    return `This action returns a #${id} libraryEvent`;
  }

  update(id: number, updateLibraryEventDto: UpdateLibraryEventDto) {
    return `This action updates a #${id} libraryEvent`;
  }

  remove(id: number) {
    return `This action removes a #${id} libraryEvent`;
  }
}
