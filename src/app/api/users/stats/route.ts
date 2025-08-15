import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

/**
 * ユーザー統計情報API
 * 
 * 認証されたユーザーの統計情報を取得：
 * - レビュー数
 * - お気に入りシリーズ数
 * - フォロー中のユーザー数
 * - フォロワー数
 * - 総評価点数
 * - 平均評価
 * 
 * このAPIは、ユーザープロフィールページで表示される
 * 統計情報を提供します。複数のデータベーステーブルから
 * 並行で情報を取得し、パフォーマンスを最適化しています。
 */

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authResult.userId;

    // 並行で統計情報を取得
    const [
      reviewCount,
      favoriteCount,
      followingCount,
      followerCount,
      totalRating
    ] = await Promise.all([
      // レビュー数
      prisma.review.count({
        where: { userId }
      }),
      
      // お気に入りシリーズ数
      prisma.favorite.count({
        where: { userId }
      }),
      
      // フォロー中のユーザー数
      prisma.follow.count({
        where: { followerId: userId }
      }),
      
      // フォロワー数
      prisma.follow.count({
        where: { followingId: userId }
      }),
      
      // 総評価点数
      prisma.review.aggregate({
        where: { userId },
        _sum: { rating: true }
      })
    ]);

    // 平均評価を計算
    const averageRating = reviewCount > 0 
      ? (totalRating._sum.rating || 0) / reviewCount 
      : 0;

    // 成功時は統計情報をJSON形式で返却
    return NextResponse.json({
      reviewCount,
      favoriteCount,
      followingCount,
      followerCount,
      totalRating: totalRating._sum.rating || 0,
      averageRating: Math.round(averageRating * 10) / 10 // 小数点第1位まで
    });

  } catch (error: any) {
    // エラーが発生した場合のログ出力とエラーレスポンス
    console.error('Failed to fetch user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
