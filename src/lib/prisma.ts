import { PrismaClient } from '@prisma/client';

// Next.js開発環境でのホットリロード時に複数インスタンスが生成されるのを防ぐ
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient({});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
