import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const category = this.categoryRepository.create(createCategoryDto);
      const result = await this.categoryRepository.save(category);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    const category = await this.categoryRepository.find({
      order: {
        id: 'desc',
      },
    });

    return category;
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (category) return category;

    throw new NotFoundException('Category not found');
  }

  async update(id: number, updateCategoryDto: CreateCategoryDto) {
    const category = await this.findOne(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    Object.assign(category, updateCategoryDto);

    return this.categoryRepository.save(category);
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return this.categoryRepository.remove(category);
  }
}
