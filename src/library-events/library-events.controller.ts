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
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { LibraryEventsService } from './library-events.service';
import { CreateLibraryEventDto } from './dto/create-library-event.dto';
import { UpdateLibraryEventDto } from './dto/update-library-event.dto';
import { RegisterEventDto } from './dto/register-event.dto';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
import { RoutePolicies } from 'src/auth/enum/route-policies.enum';
import { AuthAndPolicyGuard } from 'src/auth/guards/auth-and-policy.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('library-events')
export class LibraryEventsController {
  constructor(private readonly libraryEventsService: LibraryEventsService) {}

  @Post()
  @SetRoutePolicy(RoutePolicies.socialMedia, RoutePolicies.admin)
  @UseGuards(AuthAndPolicyGuard)
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

  @UseGuards(AuthAndPolicyGuard)
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.socialMedia)
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload-banner/:id')
  async uploadBanner(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /jpg|jpeg|png/g })
        .addMaxSizeValidator({ maxSize: 5 * (1024 * 1024) })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    return this.libraryEventsService.uploadBanner(file, +id);
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
  @SetRoutePolicy(
    RoutePolicies.librarian,
    RoutePolicies.admin,
    RoutePolicies.socialMedia,
  )
  @UseGuards(AuthAndPolicyGuard)
  getEventRegistrations(@Param('id') id: string) {
    return this.libraryEventsService.getEventRegistrations(+id);
  }

  @Get('search/title')
  @SetRoutePolicy(RoutePolicies.socialMedia, RoutePolicies.admin)
  @UseGuards(AuthAndPolicyGuard)
  async getEventByTitle(@Query('title') title: string) {
    return this.libraryEventsService.getEventByTitle(title);
  }

  @Get('user/:userId/events')
  @SetRoutePolicy(
    RoutePolicies.librarian,
    RoutePolicies.admin,
    RoutePolicies.user,
    RoutePolicies.socialMedia,
  )
  @UseGuards(AuthAndPolicyGuard)
  async getUserEvents(
    @Param('userId', ParseIntPipe) userId: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.libraryEventsService.getUserEvents(userId, tokenPayload);
  }

  @Patch(':id')
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.socialMedia)
  @UseGuards(AuthAndPolicyGuard)
  update(
    @Param('id') id: string,
    @Body() updateLibraryEventDto: UpdateLibraryEventDto,
  ) {
    return this.libraryEventsService.update(+id, updateLibraryEventDto);
  }

  @Delete(':id')
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.socialMedia)
  @UseGuards(AuthAndPolicyGuard)
  remove(@Param('id') id: string) {
    return this.libraryEventsService.remove(+id);
  }

  @Delete(':eventId/registrations/:userId')
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.user)
  @UseGuards(AuthAndPolicyGuard)
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
