import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { RoutePolicies } from 'src/auth/enum/route-policies.enum';
import { AuthAndPolicyGuard } from 'src/auth/guards/auth-and-policy.guard';
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.socialMedia)
  @UseGuards(AuthAndPolicyGuard)
  create(@Body() createNewsDto: CreateNewsDto) {
    return this.newsService.create(createNewsDto);
  }

  @Get()
  findAll(
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
  ) {
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      throw new BadRequestException('Invalid page or limit parameters');
    }

    return this.newsService.findAll(+page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(+id);
  }

  @Get('search/title')
  @SetRoutePolicy(RoutePolicies.socialMedia, RoutePolicies.admin)
  @UseGuards(AuthAndPolicyGuard)
  async getEventByTitle(@Query('title') title: string) {
    return this.newsService.getNewsByTitle(title);
  }

  @Patch(':id')
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.socialMedia)
  @UseGuards(AuthAndPolicyGuard)
  update(@Param('id') id: string, @Body() updateNewsDto: UpdateNewsDto) {
    return this.newsService.update(+id, updateNewsDto);
  }

  @Delete(':id')
  @SetRoutePolicy(RoutePolicies.admin, RoutePolicies.socialMedia)
  @UseGuards(AuthAndPolicyGuard)
  remove(@Param('id') id: string) {
    return this.newsService.remove(+id);
  }
}
