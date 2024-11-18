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
  findAll() {
    return this.newsService.findAll();
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
