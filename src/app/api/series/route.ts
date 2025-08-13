import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') || '20')));

  const where = q
    ? {
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
        ],
      }
    : {};

  const [total, series] = await Promise.all([
    prisma.series.count({ where }),
    prisma.series.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        volumes: {
          orderBy: { volumeNumber: 'asc' },
        },
        creators: {
          include: {
            creator: true,
          },
        },
      },
    }),
  ]);

  return NextResponse.json({ total, page, pageSize, items: series });
}
