import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EditorChoice } from './entities/editor-choice.entity';
import { Book } from 'src/books/entities/book.entity';

@Injectable()
export class EditorChoicesService {
  constructor(
    @InjectRepository(EditorChoice)
    private editorChoicesRepository: Repository<EditorChoice>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) {}

  async addEditorChoice(bookId: number): Promise<EditorChoice> {
    const activeChoicesCount = await this.editorChoicesRepository.count({
      where: { isActive: true },
    });

    if (activeChoicesCount >= 8) {
      throw new BadRequestException('Maximum of 8 editor choices allowed');
    }

    const book = await this.bookRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new BadRequestException('Book not found');
    }

    const editorChoice = this.editorChoicesRepository.create({
      book,
      isActive: true,
      displayOrder: activeChoicesCount + 1,
    });

    return this.editorChoicesRepository.save(editorChoice);
  }

  async removeEditorChoice(bookId: number): Promise<void> {
    const editorChoice = await this.editorChoicesRepository.findOne({
      where: { book: { id: bookId }, isActive: true },
    });

    if (!editorChoice) {
      throw new BadRequestException('Editor choice not found');
    }

    editorChoice.isActive = false;
    await this.editorChoicesRepository.save(editorChoice);

    await this.reorderEditorChoices();
  }

  async getActiveEditorChoices(): Promise<EditorChoice[]> {
    return this.editorChoicesRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  private async reorderEditorChoices(): Promise<void> {
    const activeChoices = await this.editorChoicesRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });

    activeChoices.forEach((choice, index) => {
      choice.displayOrder = index + 1;
    });

    await this.editorChoicesRepository.save(activeChoices);
  }

  async updateDisplayOrder(
    bookId: number,
    newOrder: number,
  ): Promise<EditorChoice> {
    const editorChoice = await this.editorChoicesRepository.findOne({
      where: { book: { id: bookId }, isActive: true },
    });

    if (!editorChoice) {
      throw new BadRequestException('Editor choice not found');
    }

    const activeChoices = await this.editorChoicesRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });

    const filteredChoices = activeChoices.filter(
      (choice) => choice.id !== editorChoice.id,
    );

    filteredChoices.splice(newOrder - 1, 0, editorChoice);

    filteredChoices.forEach((choice, index) => {
      choice.displayOrder = index + 1;
    });

    await this.editorChoicesRepository.save(filteredChoices);

    return editorChoice;
  }
}
