import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { LibraryEventsService } from './library-events.service';
import { CreateLibraryEventDto } from './dto/create-library-event.dto';
import { UpdateLibraryEventDto } from './dto/update-library-event.dto';
import { RegisterEventDto } from './dto/register-event.dto';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@Controller('library-events')
export class LibraryEventsController {
  constructor(private readonly libraryEventsService: LibraryEventsService) {}

  @Post()
  @UseGuards(AuthTokenGuard)
  create(@Body() createLibraryEventDto: CreateLibraryEventDto) {
    return this.libraryEventsService.create(createLibraryEventDto);
  }

  @Post(':id/register')
  @UseGuards(AuthTokenGuard)
  registerForEvent(
    @Param('id') id: string,
    @Body() registerDto: RegisterEventDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.libraryEventsService.registerForEvent(
      +id,
      registerDto,
      tokenPayload,
    );
  }

  @Get()
  findAll() {
    return this.libraryEventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.libraryEventsService.findOne(+id);
  }

  @Get(':id/registrations')
  @UseGuards(AuthTokenGuard)
  getEventRegistrations(@Param('id') id: string) {
    return this.libraryEventsService.getEventRegistrations(+id);
  }

  @Get('user/:userId/events')
  @UseGuards(AuthTokenGuard)
  async getUserEvents(
    @Param('userId', ParseIntPipe) userId: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.libraryEventsService.getUserEvents(userId, tokenPayload);
  }

  @Patch(':id')
  @UseGuards(AuthTokenGuard)
  update(
    @Param('id') id: string,
    @Body() updateLibraryEventDto: UpdateLibraryEventDto,
  ) {
    return this.libraryEventsService.update(+id, updateLibraryEventDto);
  }

  @Delete(':id')
  @UseGuards(AuthTokenGuard)
  remove(@Param('id') id: string) {
    return this.libraryEventsService.remove(+id);
  }

  @Delete(':eventId/registrations/:userId')
  @UseGuards(AuthTokenGuard)
  cancelRegistration(
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.libraryEventsService.cancelRegistration(
      +eventId,
      +userId,
      tokenPayload,
    );
  }
}
