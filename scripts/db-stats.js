import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const [series, volumes, books] = await Promise.all([
    prisma.series.count(),
    prisma.volume.count(),
    prisma.book.count(),
  ]);
  console.log(JSON.stringify({ series, volumes, books }));
}

main().then(() => prisma.$disconnect());
