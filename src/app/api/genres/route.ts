import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * ジャンル情報を管理するAPI
 * 
 * GET: ジャンル一覧の取得（検索・フィルタリング対応）
 * - 全ジャンルの取得
 * - 名前による検索
 * - シリーズ数による並び替え
 */

export async function GET(request: NextRequest) {
  try {
    // URLパラメータから検索条件を取得
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const sortBy = searchParams.get('sortBy') || 'name'; // name, seriesCount
    const order = searchParams.get('order') || 'asc'; // asc, desc

    // 検索条件を構築
    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }

    // 並び替え条件を構築
    let orderBy: any = {};
    if (sortBy === 'seriesCount') {
      // シリーズ数で並び替え（集計クエリが必要）
      orderBy = { seriesGenres: { _count: order === 'asc' ? 'asc' : 'desc' } };
    } else {
      // 名前で並び替え
      orderBy = { name: order === 'asc' ? 'asc' : 'desc' };
    }

    // ジャンル情報を取得（シリーズ数も含む）
    const genres = await prisma.genre.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: {
            seriesGenres: true
          }
        }
      }
    });

    // レスポンスデータを整形
    const formattedGenres = genres.map(genre => ({
      id: genre.id,
      name: genre.name,
      description: genre.description,
      color: genre.color,
      icon: genre.icon,
      seriesCount: genre._count.seriesGenres,
      createdAt: genre.createdAt
    }));

    // 成功時はジャンル一覧をJSON形式で返却
    return NextResponse.json({
      items: formattedGenres,
      total: formattedGenres.length,
      query: q,
      sortBy,
      order
    });

  } catch (error: any) {
    // エラーが発生した場合のログ出力とエラーレスポンス
    console.error('Failed to fetch genres:', error);
    return NextResponse.json(
      { error: 'Failed to fetch genres' },
      { status: 500 }
    );
  }
}
