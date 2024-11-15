import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  create(@Body() createRequestDto: CreateRequestDto) {
    return this.requestsService.create(createRequestDto);
  }

  @Get()
  @UseGuards(AuthTokenGuard)
  findAll() {
    return this.requestsService.findAll();
  }

  @Delete(':id')
  @UseGuards(AuthTokenGuard)
  remove(@Param('id') id: string) {
    return this.requestsService.remove(+id);
  }
}
