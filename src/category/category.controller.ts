import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
  Query,
  BadRequestException,
  // HttpCode,
  // HttpStatus,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { RoutePolicies } from 'src/auth/enum/route-policies.enum';
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
import { AuthAndPolicyGuard } from 'src/auth/guards/auth-and-policy.guard';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.stockController)
  @UseGuards(AuthAndPolicyGuard)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get('all')
  findAllWhitoutPagination() {
    return this.categoryService.findAllWhitoutPagination();
  }

  @Get()
  // @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.stockController)
  // @UseGuards(AuthAndPolicyGuard)
  findAll(
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
  ) {
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      throw new BadRequestException('Invalid page or limit parameters');
    }
    return this.categoryService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Get('name/:name')
  findByName(@Param('name') name: string) {
    return this.categoryService.findByName(name);
  }

  @Patch(':id')
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.stockController)
  @UseGuards(AuthAndPolicyGuard)
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: CreateCategoryDto,
  ) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.stockController)
  @UseGuards(AuthAndPolicyGuard)
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
