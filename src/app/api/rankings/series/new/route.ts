/**
 * 新着シリーズランキングAPI
 * 
 * 作成日時と評価に基づく新着シリーズランキング：
 * - 最近追加されたシリーズ
 * - 初期評価による並び替え
 * - 新着度と評価のバランス
 * - ページネーション対応
 * 
 * このAPIは、新しく追加された
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
    const timeRange = searchParams.get('timeRange') || 'month'; // week, month, quarter

    // 時間範囲の条件を設定
    let timeFilter = {};
    if (timeRange === 'week') {
      timeFilter = {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      };
    } else if (timeRange === 'month') {
      timeFilter = {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      };
    } else if (timeRange === 'quarter') {
      timeFilter = {
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      };
    }

    // 条件に合うシリーズの総件数を取得
    const totalSeries = await prisma.series.count({
      where: timeFilter,
    });

    // 新着シリーズを取得
    const series = await prisma.series.findMany({
      where: timeFilter,
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
        createdAt: 'desc',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 新着度と評価のバランスで並び替え
    const sortedSeries = series.sort((a, b) => {
      // 新着度スコア（日付が新しいほど高い）
      const daysA = (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const daysB = (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      
      // 新着度スコア（0-1の範囲）
      const recencyScoreA = Math.max(0, 1 - daysA / 30); // 30日で0になる
      const recencyScoreB = Math.max(0, 1 - daysB / 30);
      
      // 評価スコア（0-1の範囲）
      const ratingScoreA = 0.8; // TODO: 実際のレビューデータから計算
      const ratingScoreB = 0.8;
      
      // 総合スコア（新着度70%、評価30%）
      const totalScoreA = recencyScoreA * 0.7 + ratingScoreA * 0.3;
      const totalScoreB = recencyScoreB * 0.7 + ratingScoreB * 0.3;
      
      return totalScoreB - totalScoreA;
    });

    // レスポンスデータを整形
    const formattedSeries = sortedSeries.map(s => ({
      id: s.id,
      title: s.title,
      englishTitle: s.englishTitle,
      description: s.description,
      coverImageUrl: s.coverImageUrl,
      publisherName: s.publisherName,
      status: s.status,
      averageRating: 4.0, // TODO: 実際のレビューデータから計算
      reviewCount: s._count.reviews || 0,
      favoriteCount: s._count.favorites || 0,
      genres: s.seriesGenres.map((sg: any) => ({ name: sg.genre.name })),
      createdAt: s.createdAt,
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
      timeRange,
    });
  } catch (error) {
    console.error('新着シリーズランキング取得エラー:', error);
    return NextResponse.json(
      { error: 'ランキングの取得に失敗しました' },
      { status: 500 }
    );
  }
}
