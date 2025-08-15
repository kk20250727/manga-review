import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * タグ情報を管理するAPI
 * 
 * GET: タグ一覧の取得（検索・フィルタリング対応）
 * - 全タグの取得
 * - カテゴリ別フィルタリング
 * - 名前による検索
 * - シリーズ数による並び替え
 */

export async function GET(request: NextRequest) {
  try {
    // URLパラメータから検索条件を取得
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'name'; // name, seriesCount, category
    const order = searchParams.get('order') || 'asc'; // asc, desc

    // 検索条件を構築
    const where: any = {};
    
    // 名前による検索
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } }
      ];
    }
    
    // カテゴリによるフィルタリング
    if (category) {
      where.category = category;
    }

    // 並び替え条件を構築
    let orderBy: any = {};
    if (sortBy === 'seriesCount') {
      // シリーズ数で並び替え
      orderBy = { seriesTags: { _count: order === 'asc' ? 'asc' : 'desc' } };
    } else if (sortBy === 'category') {
      // カテゴリで並び替え
      orderBy = { category: order === 'asc' ? 'asc' : 'desc' };
    } else {
      // 名前で並び替え
      orderBy = { name: order === 'asc' ? 'asc' : 'desc' };
    }

    // タグ情報を取得（シリーズ数も含む）
    const tags = await prisma.tag.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: {
            seriesTags: true
          }
        }
      }
    });

    // レスポンスデータを整形
    const formattedTags = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      category: tag.category,
      seriesCount: tag._count.seriesTags,
      createdAt: tag.createdAt
    }));

    // カテゴリ別の統計情報を取得
    const categoryStats = await prisma.tag.groupBy({
      by: ['category'],
      _count: {
        id: true
      },
      where: category ? { category } : undefined
    });

    // 成功時はタグ一覧と統計情報をJSON形式で返却
    return NextResponse.json({
      items: formattedTags,
      total: formattedTags.length,
      query: q,
      category,
      sortBy,
      order,
      categoryStats: categoryStats.map(stat => ({
        category: stat.category,
        count: stat._count.id
      }))
    });

  } catch (error: any) {
    // エラーが発生した場合のログ出力とエラーレスポンス
    console.error('Failed to fetch tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}
