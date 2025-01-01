import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { ILike, Repository } from 'typeorm';

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

  async findAllWhitoutPagination() {
    return this.categoryRepository.find({
      order: {
        id: 'desc',
      },
    });
  }

  async findAll(page: number = 1, limit: number = 4) {
    const skip = (page - 1) * limit;
    const [requests, total] = await this.categoryRepository.findAndCount({
      skip,
      take: limit,
      order: {
        id: 'desc',
      },
    });

    return {
      data: requests,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (category) return category;

    throw new NotFoundException('Category not found');
  }

  async findByName(name: string) {
    const category = await this.categoryRepository.find({
      where: { name: ILike(`%${name}%`) },
    });
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
