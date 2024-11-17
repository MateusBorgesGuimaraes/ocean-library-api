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
import { RoutePolicies } from 'src/auth/enum/route-policies.enum';
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
import { AuthAndPolicyGuard } from 'src/auth/guards/auth-and-policy.guard';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @UseGuards(AuthTokenGuard)
  create(@Body() createRequestDto: CreateRequestDto) {
    return this.requestsService.create(createRequestDto);
  }

  @Get()
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.librarian)
  @UseGuards(AuthAndPolicyGuard)
  findAll() {
    return this.requestsService.findAll();
  }

  @Delete(':id')
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.librarian)
  @UseGuards(AuthAndPolicyGuard)
  remove(@Param('id') id: string) {
    return this.requestsService.remove(+id);
  }
}
