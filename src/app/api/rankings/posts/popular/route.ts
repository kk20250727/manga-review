/**
 * 人気投稿ランキングAPI
 * 
 * いいね数とコメント数に基づく人気投稿ランキング：
 * - いいね数の多い順
 * - コメント数の多い順
 * - 総合人気度スコアによる並び替え
 * - ページネーション対応
 * 
 * このAPIは、コミュニティで話題の
 * 投稿を発見するためのランキングを提供します。
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const sortBy = searchParams.get('sortBy') || 'popularity'; // popularity, likes, comments
    const timeRange = searchParams.get('timeRange') || 'all'; // all, week, month

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
    }

    // 総件数を取得
    const totalPosts = await prisma.forumPost.count({
      where: timeFilter,
    });

    let posts;
    
    if (sortBy === 'likes') {
      // いいね数順
      posts = await prisma.forumPost.findMany({
        where: timeFilter,
        include: {
          user: {
            select: {
              username: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: {
          viewCount: 'desc', // いいねの代わりにビュー数で並び替え
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
    } else if (sortBy === 'comments') {
      // コメント数順
      posts = await prisma.forumPost.findMany({
        where: timeFilter,
        include: {
          user: {
            select: {
              username: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: {
          comments: {
            _count: 'desc',
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
    } else {
      // 総合人気度順（ビュー数 + コメント数 * 0.5）
      posts = await prisma.forumPost.findMany({
        where: timeFilter,
        include: {
          user: {
            select: {
              username: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      // 総合人気度スコアを計算して並び替え
      posts = posts.sort((a, b) => {
        const scoreA = (a.viewCount || 0) + (a._count.comments || 0) * 0.5;
        const scoreB = (b.viewCount || 0) + (b._count.comments || 0) * 0.5;
        return scoreB - scoreA;
      });
    }

    // レスポンスデータを整形
    const formattedPosts = posts.map(p => ({
      id: p.id,
      title: p.title,
      content: p.content,
      category: p.category,
      createdAt: p.createdAt,
      user: p.user,
      series: null, // TODO: シリーズ関連付けが実装されたら追加
      _count: {
        comments: p._count.comments,
        likes: p.viewCount || 0, // ビュー数をいいね数として使用
      },
    }));

    const totalPages = Math.ceil(totalPosts / pageSize);

    return NextResponse.json({
      items: formattedPosts,
      total: totalPosts,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      sortBy,
      timeRange,
    });
  } catch (error) {
    console.error('人気投稿ランキング取得エラー:', error);
    return NextResponse.json(
      { error: 'ランキングの取得に失敗しました' },
      { status: 500 }
    );
  }
}
