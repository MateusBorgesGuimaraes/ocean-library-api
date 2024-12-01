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

@Controller('editor-choices')
export class EditorChoicesController {
  constructor(private readonly editorChoicesService: EditorChoicesService) {}

  @Post(':bookId')
  @SetRoutePolicy(RoutePolicies.librarian, RoutePolicies.admin)
  @UseGuards(AuthAndPolicyGuard)
  async addEditorChoice(
    @Param('bookId', ParseIntPipe) bookId: number,
  ): Promise<EditorChoice> {
    return this.editorChoicesService.addEditorChoice(bookId);
  }

  @Delete(':bookId')
  @SetRoutePolicy(RoutePolicies.librarian, RoutePolicies.admin)
  @UseGuards(AuthAndPolicyGuard)
  async removeEditorChoice(
    @Param('bookId', ParseIntPipe) bookId: number,
  ): Promise<void> {
    return this.editorChoicesService.removeEditorChoice(bookId);
  }

  @Get()
  async getActiveEditorChoices(): Promise<EditorChoice[]> {
    return this.editorChoicesService.getActiveEditorChoices();
  }

  @Put(':bookId/order/:newOrder')
  @SetRoutePolicy(RoutePolicies.librarian, RoutePolicies.admin)
  @UseGuards(AuthAndPolicyGuard)
  async updateDisplayOrder(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Param('newOrder', ParseIntPipe) newOrder: number,
  ): Promise<EditorChoice> {
    return this.editorChoicesService.updateDisplayOrder(bookId, newOrder);
  }
}
