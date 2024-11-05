import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LibraryEventsService } from './library-events.service';
import { CreateLibraryEventDto } from './dto/create-library-event.dto';
import { UpdateLibraryEventDto } from './dto/update-library-event.dto';

@Controller('library-events')
export class LibraryEventsController {
  constructor(private readonly libraryEventsService: LibraryEventsService) {}

  @Post()
  create(@Body() createLibraryEventDto: CreateLibraryEventDto) {
    return this.libraryEventsService.create(createLibraryEventDto);
  }

  @Get()
  findAll() {
    return this.libraryEventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.libraryEventsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLibraryEventDto: UpdateLibraryEventDto,
  ) {
    return this.libraryEventsService.update(+id, updateLibraryEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.libraryEventsService.remove(+id);
  }
}
