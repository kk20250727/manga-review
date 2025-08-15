/**
 * サイト概要統計API
 * 
 * ホーム画面で表示する統計情報：
 * - 総シリーズ数
 * - 総ユーザー数
 * - 総レビュー数
 * - 総投稿数
 * - 人気ジャンル
 * - 最近のアクティビティ
 * 
 * このAPIは、サイトの規模と
 * 活気を示す統計情報を提供します。
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // 並行で統計情報を取得
    const [
      totalSeries,
      totalUsers,
      totalReviews,
      totalPosts,
      popularGenres,
      recentActivity
    ] = await Promise.all([
      // 総シリーズ数
      prisma.series.count(),
      
      // 総ユーザー数
      prisma.user.count(),
      
      // 総レビュー数
      prisma.review.count(),
      
      // 総投稿数
      prisma.forumPost.count(),
      
      // 人気ジャンル（シリーズ数順）
      prisma.genre.findMany({
        include: {
          _count: {
            select: {
              seriesGenres: true,
            },
          },
        },
        orderBy: {
          seriesGenres: {
            _count: 'desc',
          },
        },
        take: 5,
      }),
      
      // 最近のアクティビティ
      prisma.review.findMany({
        include: {
          series: {
            select: {
              id: true,
              title: true,
              englishTitle: true,
            },
          },
          user: {
            select: {
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      }),
    ]);

    // レスポンスデータを整形
    const stats = {
      overview: {
        totalSeries,
        totalUsers,
        totalReviews,
        totalPosts,
      },
      popularGenres: popularGenres.map(g => ({
        id: g.id,
        name: g.name,
        seriesCount: g._count.seriesGenres,
        color: g.color || '#3B82F6',
        icon: g.icon || '📚',
      })),
      recentActivity: recentActivity.map(r => ({
        id: r.id,
        type: 'review',
        series: r.series,
        user: r.user,
        rating: r.rating,
        createdAt: r.createdAt,
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('統計情報取得エラー:', error);
    return NextResponse.json(
      { error: '統計情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}
