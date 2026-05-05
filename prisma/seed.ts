import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { categories, Category } from './data/categories';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error('DATABASE_URL is not set');
}

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString })
});

const toSlug = (name: string): string => slugify(name, { lower: true, strict: true });

async function insertCategoriesRecursive(cats: Category[], parentId?: string): Promise<void> {
	const currentLevel = cats.filter(c => c.parentId === parentId);

	if (currentLevel.length === 0) return;

	await prisma.category.createMany({
		data: currentLevel.map(cat => ({
			id: cat.id,
			name: cat.name,
			slug: toSlug(cat.name),
			icon: cat.icon ?? null,
			parentId: cat.parentId ?? null
		})),
		skipDuplicates: true
	});

	for (const cat of currentLevel) {
		await insertCategoriesRecursive(cats, cat.id);
	}
}

(async (): Promise<void> => {
	await insertCategoriesRecursive(categories);
	console.log('All categories inserted successfully!');
})()
	.catch(e => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => {
		void prisma.$disconnect();
	});
