/**
 * 人気シリーズランキングAPI
 * 
 * お気に入り数とレビュー数に基づく人気シリーズランキング：
 * - お気に入り数の多い順
 * - レビュー数が多い順
 * - 総合人気度スコアによる並び替え
 * - ページネーション対応
 * 
 * このAPIは、ユーザーの関心が高い
 * シリーズを発見するためのランキングを提供します。
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const sortBy = searchParams.get('sortBy') || 'popularity'; // popularity, favorites, reviews

    // 総件数を取得
    const totalSeries = await prisma.series.count();

    let series;
    
    if (sortBy === 'favorites') {
      // お気に入り数順
      series = await prisma.series.findMany({
        include: {
          seriesGenres: {
            include: {
              genre: {
                select: {
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              reviews: true,
              favorites: true,
            },
          },
        },
        orderBy: {
          favorites: {
            _count: 'desc',
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
    } else if (sortBy === 'reviews') {
      // レビュー数順
      series = await prisma.series.findMany({
        include: {
          seriesGenres: {
            include: {
              genre: {
                select: {
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              reviews: true,
              favorites: true,
            },
          },
        },
        orderBy: {
          reviews: {
            _count: 'desc',
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
    } else {
      // 総合人気度順（お気に入り数 + レビュー数 * 0.5）
      series = await prisma.series.findMany({
        include: {
          seriesGenres: {
            include: {
              genre: {
                select: {
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              reviews: true,
              favorites: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      // 総合人気度スコアを計算して並び替え
      series = series.sort((a, b) => {
        const scoreA = (a._count.favorites || 0) + (a._count.reviews || 0) * 0.5;
        const scoreB = (b._count.favorites || 0) + (b._count.reviews || 0) * 0.5;
        return scoreB - scoreA;
      });
    }

    // レスポンスデータを整形
    const formattedSeries = series.map(s => ({
      id: s.id,
      title: s.title,
      englishTitle: s.englishTitle,
      description: s.description,
      coverImageUrl: s.coverImageUrl,
      publisherName: s.publisherName,
      status: s.status,
      averageRating: 0, // TODO: レビューテーブルから計算する必要があります
      reviewCount: s._count.reviews || 0,
      favoriteCount: s._count.favorites || 0,
      genres: s.seriesGenres.map(sg => ({ name: sg.genre.name })),
    }));

    const totalPages = Math.ceil(totalSeries / pageSize);

    return NextResponse.json({
      items: formattedSeries,
      total: totalSeries,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      sortBy,
    });
  } catch (error) {
    console.error('人気シリーズランキング取得エラー:', error);
    return NextResponse.json(
      { error: 'ランキングの取得に失敗しました' },
      { status: 500 }
    );
  }
}
