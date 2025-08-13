import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const seriesId = searchParams.get('seriesId');
    const volumeId = searchParams.get('volumeId');

    const where: any = {};
    if (seriesId) where.seriesId = Number(seriesId);
    if (volumeId) where.volumeId = Number(volumeId);

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ items: reviews });
  } catch (error: any) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { rating, comment, nickname, seriesId, volumeId } = await req.json();

    if (!rating || (seriesId === undefined && volumeId === undefined)) {
      return NextResponse.json({ error: 'Rating and either seriesId or volumeId are required' }, { status: 400 });
    }

    const newReview = await prisma.review.create({
      data: {
        rating,
        comment,
        nickname,
        seriesId: seriesId ? Number(seriesId) : null,
        volumeId: volumeId ? Number(volumeId) : null,
      },
    });

    return NextResponse.json({ item: newReview }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
