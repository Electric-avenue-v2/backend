import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {
  }

  async getAll(): Promise<Category[]> {
    return this.prisma.category.findMany();
  }
}
