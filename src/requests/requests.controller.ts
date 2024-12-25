import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  BadRequestException,
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
  findAll(
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
  ) {
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      throw new BadRequestException('Invalid page or limit parameters');
    }
    return this.requestsService.findAll(page, limit);
  }
 
  @Delete(':id')
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.librarian)
  @UseGuards(AuthAndPolicyGuard)
  remove(@Param('id') id: string) {
    return this.requestsService.remove(+id);
  }
}
