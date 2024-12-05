import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
import { RoutePolicies } from 'src/auth/enum/route-policies.enum';
import { AuthAndPolicyGuard } from 'src/auth/guards/auth-and-policy.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.librarian)
  @UseGuards(AuthAndPolicyGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.librarian)
  @UseGuards(AuthAndPolicyGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Get('search/email')
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.librarian)
  @UseGuards(AuthAndPolicyGuard)
  async findByEmail(@Query('email') email: string) {
    if (!email) {
      throw new NotFoundException('Email parameter is required');
    }
    return this.usersService.findByEmail(email);
  }
}
