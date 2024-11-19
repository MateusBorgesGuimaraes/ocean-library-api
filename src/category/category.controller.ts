import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
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

  @Get()
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.stockController)
  @UseGuards(AuthAndPolicyGuard)
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
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

  // ta retronando estranho
  @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.stockController)
  @UseGuards(AuthAndPolicyGuard)
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
