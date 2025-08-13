import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest, // 💡 ここを 'Request' から 'NextRequest' に変更しました
  context: { params: { id: string } }
) {
  try {
    const id = Number(context.params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const series = await prisma.series.findUnique({
      where: { id },
      include: {
        volumes: {
          orderBy: { volumeNumber: 'asc' },
        },
        creators: {
          include: {
            creator: true,
          },
        },
        aliases: true,
      },
    });

    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    return NextResponse.json(series);
  } catch (error) {
    console.error('Failed to fetch series:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}