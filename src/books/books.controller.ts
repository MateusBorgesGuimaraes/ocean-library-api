import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  // BadRequestException,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { SearchBookDto } from './dto/search-book.dto';
// import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
import { RoutePolicies } from 'src/auth/enum/route-policies.enum';
import { AuthAndPolicyGuard } from 'src/auth/guards/auth-and-policy.guard';
import { FileInterceptor } from '@nestjs/platform-express';
// import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
// import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  // @UseGuards(AuthTokenGuard)
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.stockController)
  @UseGuards(AuthAndPolicyGuard)
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  // @UseGuards(AuthTokenGuard)
  @UseGuards(AuthAndPolicyGuard)
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.stockController)
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload-cover/:id')
  async uploadCover(
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
    return this.booksService.uploadCover(file, +id);
  }

  @Get('latest')
  getLatestBooks() {
    return this.booksService.getLastEight();
  }

  @Get('search')
  searchBooks(@Query() searchDto: SearchBookDto) {
    return this.booksService.searchBooks(searchDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(+id);
  }

  @Patch(':id')
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.stockController)
  @UseGuards(AuthAndPolicyGuard)
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(+id, updateBookDto);
  }

  @Delete(':id')
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.stockController)
  @UseGuards(AuthAndPolicyGuard)
  remove(@Param('id') id: string) {
    return this.booksService.remove(+id);
  }
}
