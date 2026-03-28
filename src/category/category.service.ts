import { Injectable } from '@nestjs/common';
import { Category } from '~/category/models/category.model';
import { PrismaService } from '~/prisma/prisma.service';

@Injectable()
export class CategoryService {
	constructor(private readonly prisma: PrismaService) {}

	async getAll(): Promise<Category[]> {
		return this.prisma.category.findMany();
	}
}
