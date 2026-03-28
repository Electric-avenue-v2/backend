import { AttributeType, PrismaClient } from '@prisma/client';
import { categories } from './data/categories';

const prisma = new PrismaClient();

(async () => {
  // await prisma.category.createMany({
    // data: categories,
    // skipDuplicates: true,
  // });

  const category = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
    },
  });
  console.log(`✅ Category created: ${category.name} (ID: ${category.id})`);

  // 2. Створюємо атрибути (напр. Колір та Об'єм)
  const colorAttr = await prisma.attribute.create({
    data: {
      name: 'Color',
      slug: 'color',
      type: AttributeType.SELECT,
    },
  });

  const storageAttr = await prisma.attribute.create({
    data: {
      name: 'Storage',
      slug: 'storage',
      type: AttributeType.SELECT,
    },
  });

  // 3. Створюємо значення для цих атрибутів
  const redColor = await prisma.attributeValue.create({
    data: {
      value: 'Red',
      attributeId: colorAttr.id,
    },
  });

  const blueColor = await prisma.attributeValue.create({
    data: {
      value: 'Blue',
      attributeId: colorAttr.id,
    },
  });

  const storage128 = await prisma.attributeValue.create({
    data: {
      value: '128GB',
      attributeId: storageAttr.id,
    },
  });

  const storage256 = await prisma.attributeValue.create({
    data: {
      value: '256GB',
      attributeId: storageAttr.id,
    },
  });

  console.log('\n--- COPY THESE IDS FOR YOUR GRAPHQL MUTATION ---');
  console.log(`CategoryID: ${category.id}`);
  console.log(`AttributeValue RED: ${redColor.id}`);
  console.log(`AttributeValue BLUE: ${blueColor.id}`);
  console.log(`AttributeValue 128GB: ${storage128.id}`);
  console.log(`AttributeValue 256GB: ${storage256.id}`);
  console.log('--------------------------------------------------\n');
})()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });