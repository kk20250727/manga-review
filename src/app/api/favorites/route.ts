import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * お気に入り機能を管理するAPI
 * 
 * GET: ユーザーのお気に入りシリーズ一覧を取得
 * POST: シリーズをお気に入りに追加
 * DELETE: お気に入りから削除
 */

// GET: お気に入り一覧の取得
export async function GET(request: NextRequest) {
  try {
    // URLパラメータからユーザーIDを取得
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // ユーザーのお気に入りシリーズを取得
    const favorites = await prisma.favorite.findMany({
      where: { userId: Number(userId) },
      include: {
        series: {
          include: {
            volumes: {
              orderBy: { volumeNumber: 'asc' },
              take: 1 // 最初の巻のみ取得
            },
            seriesGenres: {
              include: {
                genre: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // レスポンスデータを整形
    const formattedFavorites = favorites.map(favorite => ({
      id: favorite.id,
      series: {
        id: favorite.series.id,
        title: favorite.series.title,
        englishTitle: favorite.series.englishTitle,
        romajiTitle: favorite.series.romajiTitle,
        description: favorite.series.description,
        coverImageUrl: favorite.series.coverImageUrl,
        publisherName: favorite.series.publisherName,
        status: favorite.series.status,
        ageRating: favorite.series.ageRating,
        volumes: favorite.series.volumes,
        genres: favorite.series.seriesGenres.map(sg => ({
          id: sg.genre.id,
          name: sg.genre.name,
          color: sg.genre.color,
          icon: sg.genre.icon
        }))
      },
      addedAt: favorite.createdAt
    }));

    // 成功時はお気に入り一覧をJSON形式で返却
    return NextResponse.json({
      items: formattedFavorites,
      total: formattedFavorites.length
    });

  } catch (error: any) {
    // エラーが発生した場合のログ出力とエラーレスポンス
    console.error('Failed to fetch favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// POST: お気に入りの追加
export async function POST(request: NextRequest) {
  try {
    // リクエストボディからお気に入り情報を取得
    const { userId, seriesId } = await request.json();

    // 必須項目のバリデーション
    if (!userId || !seriesId) {
      return NextResponse.json(
        { error: 'User ID and Series ID are required' },
        { status: 400 }
      );
    }

    // 既存のお気に入りをチェック
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_seriesId: {
          userId: Number(userId),
          seriesId: Number(seriesId)
        }
      }
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Series is already in favorites' },
        { status: 409 }
      );
    }

    // お気に入りを作成
    const newFavorite = await prisma.favorite.create({
      data: {
        userId: Number(userId),
        seriesId: Number(seriesId)
      },
      include: {
        series: {
          select: {
            id: true,
            title: true,
            coverImageUrl: true
          }
        }
      }
    });

    // 成功時は作成されたお気に入りをJSON形式で返却
    return NextResponse.json(
      { 
        message: 'Added to favorites successfully',
        favorite: newFavorite 
      },
      { status: 201 }
    );

  } catch (error: any) {
    // エラーが発生した場合のログ出力とエラーレスポンス
    console.error('Failed to add favorite:', error);
    
    // データベースエラーの場合
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Series is already in favorites' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

// DELETE: お気に入りの削除
export async function DELETE(request: NextRequest) {
  try {
    // URLパラメータからお気に入りIDを取得
    const { searchParams } = new URL(request.url);
    const favoriteId = searchParams.get('id');

    if (!favoriteId) {
      return NextResponse.json(
        { error: 'Favorite ID is required' },
        { status: 400 }
      );
    }

    // お気に入りを削除
    await prisma.favorite.delete({
      where: { id: Number(favoriteId) }
    });

    // 成功時は削除完了メッセージを返却
    return NextResponse.json(
      { message: 'Removed from favorites successfully' },
      { status: 200 }
    );

  } catch (error: any) {
    // エラーが発生した場合のログ出力とエラーレスポンス
    console.error('Failed to remove favorite:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}
