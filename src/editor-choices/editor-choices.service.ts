import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EditorChoice } from './entities/editor-choice.entity';
import { Book } from 'src/books/entities/book.entity';
import { News } from 'src/news/entities/news.entity';
import { LibraryEvent } from 'src/library-events/entities/library-event.entity';
import { FeaturedType } from './enum/featured-type.enum';
import { LibraryEventsService } from 'src/library-events/library-events.service';

@Injectable()
export class EditorChoicesService {
  private readonly MAX_FEATURED_LIMITS = {
    [FeaturedType.BOOK]: 10,
    [FeaturedType.NEWS]: 3,
    [FeaturedType.EVENT]: 3,
  };
  constructor(
    @InjectRepository(EditorChoice)
    private editorChoicesRepository: Repository<EditorChoice>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(News)
    private newsRepository: Repository<News>,
    @InjectRepository(LibraryEvent)
    private libraryEventRepository: Repository<News>,
    private libraryEventsService: LibraryEventsService,
  ) {}

  async addEditorChoice(
    type: FeaturedType,
    contentId: number,
  ): Promise<EditorChoice> {
    const activeChoicesCount = await this.countActiveFeaturedByType(type);
    const maxLimit = this.MAX_FEATURED_LIMITS[type];

    if (activeChoicesCount >= maxLimit) {
      throw new BadRequestException(
        `Maximum of 10 ${maxLimit} featured choices allowed`,
      );
    }

    let content;
    switch (type) {
      case FeaturedType.BOOK:
        content = await this.bookRepository.findOne({
          where: { id: contentId },
        });
        break;
      case FeaturedType.NEWS:
        content = await this.newsRepository.findOne({
          where: { id: contentId },
        });
        break;
      case FeaturedType.EVENT:
        content = await this.libraryEventRepository.findOne({
          where: { id: contentId },
        });
        break;
      default:
        throw new BadRequestException('Invalid content type');
    }

    if (!content) {
      throw new BadRequestException(`${type} not found`);
    }

    const featuredContent = this.editorChoicesRepository.create({
      type,
      [type]: content,
      isActive: true,
      displayOrder: activeChoicesCount + 1,
    });

    return this.editorChoicesRepository.save(featuredContent);
  }

  async removeEditorChoice(id: number): Promise<void> {
    const featuredContent = await this.editorChoicesRepository.findOne({
      where: { id, isActive: true },
    });

    if (!featuredContent) {
      throw new BadRequestException('Featured content not found');
    }

    featuredContent.isActive = false;
    await this.editorChoicesRepository.save(featuredContent);

    await this.reorderFeaturedContent(featuredContent.type);
  }

  async getActiveEditorChoices(type: FeaturedType): Promise<EditorChoice[]> {
    return this.editorChoicesRepository.find({
      where: {
        type,
        isActive: true,
      },
      order: { displayOrder: 'ASC' },
    });
  }

  private async reorderFeaturedContent(type: FeaturedType): Promise<void> {
    const activeChoices = await this.editorChoicesRepository.find({
      where: {
        type,
        isActive: true,
      },
      order: { displayOrder: 'ASC' },
    });

    activeChoices.forEach((choice, index) => {
      choice.displayOrder = index + 1;
    });

    await this.editorChoicesRepository.save(activeChoices);
  }

  private async countActiveFeaturedByType(type: FeaturedType): Promise<number> {
    return this.editorChoicesRepository.count({
      where: {
        type,
        isActive: true,
      },
    });
  }

  async updateDisplayOrder(
    id: number,
    newOrder: number,
  ): Promise<EditorChoice> {
    const featuredContent = await this.editorChoicesRepository.findOne({
      where: { id, isActive: true },
    });

    if (!featuredContent) {
      throw new BadRequestException('Featured content not found');
    }

    const activeChoices = await this.editorChoicesRepository.find({
      where: {
        type: featuredContent.type,
        isActive: true,
      },
      order: { displayOrder: 'ASC' },
    });

    const filteredChoices = activeChoices.filter(
      (choice) => choice.id !== featuredContent.id,
    );

    filteredChoices.splice(newOrder - 1, 0, featuredContent);

    filteredChoices.forEach((choice, index) => {
      choice.displayOrder = index + 1;
    });

    await this.editorChoicesRepository.save(filteredChoices);

    return featuredContent;
  }

  async getAllEditorChoicesContent(): Promise<{
    books: EditorChoice[];
    news: EditorChoice[];
    events: EditorChoice[];
  }> {
    const featuredBooks = await this.getActiveEditorChoices(FeaturedType.BOOK);

    const featuredNews = await this.getActiveEditorChoices(FeaturedType.NEWS);

    const featuredEvents = await this.getActiveEditorChoices(
      FeaturedType.EVENT,
    );

    return {
      books: featuredBooks,
      news: featuredNews,
      events: featuredEvents,
    };
  }

  async getAllEditorChoicesContentSimplified(): Promise<{
    books: Book[];
    news: News[];
    events: Array<
      LibraryEvent & { availableSeats: number; registeredUsers: number }
    >;
  }> {
    const fullContent = await this.getAllEditorChoicesContent();

    const eventsWithSeatsInfo = await Promise.all(
      fullContent.events.map(async (choice) => {
        const event = choice.event;

        // Use the libraryEventsService method to get registrations
        // You'll need to inject this service in the constructor
        const eventDetails = await this.libraryEventsService.findOne(event.id);

        return {
          ...event,
          availableSeats: eventDetails.availableSeats,
          registeredUsers: eventDetails.registrations,
        };
      }),
    );

    return {
      books: fullContent.books.map((choice) => choice.book),
      news: fullContent.news.map((choice) => choice.news),
      events: eventsWithSeatsInfo,
    };
  }
}
