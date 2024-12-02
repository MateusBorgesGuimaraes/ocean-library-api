import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { EditorChoicesService } from './editor-choices.service';
import { EditorChoice } from './entities/editor-choice.entity';
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
import { RoutePolicies } from 'src/auth/enum/route-policies.enum';
import { AuthAndPolicyGuard } from 'src/auth/guards/auth-and-policy.guard';
import { FeaturedType } from './enum/featured-type.enum';
import { Book } from 'src/books/entities/book.entity';
import { News } from 'src/news/entities/news.entity';
import { LibraryEvent } from 'src/library-events/entities/library-event.entity';

@Controller('editor-choices')
export class EditorChoicesController {
  constructor(private readonly editorChoicesService: EditorChoicesService) {}

  @Post(':type/:contentId')
  @SetRoutePolicy(RoutePolicies.librarian, RoutePolicies.admin)
  @UseGuards(AuthAndPolicyGuard)
  async addEditorChoice(
    @Param('type') type: FeaturedType,
    @Param('contentId', ParseIntPipe) contentId: number,
  ): Promise<EditorChoice> {
    return this.editorChoicesService.addEditorChoice(type, contentId);
  }

  @Get(':type')
  async getActiveEditorChoices(
    @Param('type') type: FeaturedType,
  ): Promise<EditorChoice[]> {
    return this.editorChoicesService.getActiveEditorChoices(type);
  }

  @Get()
  async getAllEditorChoicesContent(): Promise<{
    books: Book[];
    news: News[];
    events: LibraryEvent[];
  }> {
    return this.editorChoicesService.getAllEditorChoicesContentSimplified();
  }

  @Delete(':id')
  @SetRoutePolicy(RoutePolicies.librarian, RoutePolicies.admin)
  @UseGuards(AuthAndPolicyGuard)
  async removeEditorChoice(
    @Param('bookId', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.editorChoicesService.removeEditorChoice(id);
  }

  @Put(':id/order/:newOrder')
  @SetRoutePolicy(RoutePolicies.librarian, RoutePolicies.admin)
  @UseGuards(AuthAndPolicyGuard)
  async updateDisplayOrder(
    @Param('id', ParseIntPipe) id: number,
    @Param('newOrder', ParseIntPipe) newOrder: number,
  ): Promise<EditorChoice> {
    return this.editorChoicesService.updateDisplayOrder(id, newOrder);
  }
}
