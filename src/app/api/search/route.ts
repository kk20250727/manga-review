import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 高度な検索API
 * 
 * サイト内のシリーズ情報を検索・フィルタリング：
 * - キーワード検索（タイトル、説明、出版社）
 * - ジャンル・タグによるフィルタリング
 * - 連載状況・年齢制限によるフィルタリング
 * - 並び替え機能（タイトル、評価、巻数）
 * - ページネーション対応
 * 
 * このAPIは、フロントエンドの検索機能を支える中核的なエンドポイントです。
 * 複数の検索条件を組み合わせて、ユーザーのニーズに合った
 * シリーズ情報を効率的に取得できます。
 */

export async function GET(request: NextRequest) {
  try {
    // URLパラメータから検索条件を取得
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const genres = searchParams.get('genres') || '';
    const tags = searchParams.get('tags') || '';
    const status = searchParams.get('status') || '';
    const ageRating = searchParams.get('ageRating') || '';
    const sortBy = searchParams.get('sortBy') || 'relevance'; // relevance, title, rating, volumeCount
    const order = searchParams.get('order') || 'desc'; // asc, desc
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // 検索条件を構築
    const where: any = {};

    // キーワード検索
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { englishTitle: { contains: q, mode: 'insensitive' } },
        { romajiTitle: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { publisherName: { contains: q, mode: 'insensitive' } },
        { aliases: { some: { alias: { contains: q, mode: 'insensitive' } } } }
      ];
    }

    // ジャンルフィルター
    if (genres) {
      const genreIds = genres.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (genreIds.length > 0) {
        where.seriesGenres = {
          some: {
            genreId: { in: genreIds }
          }
        };
      }
    }

    // タグフィルター
    if (tags) {
      const tagIds = tags.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (tagIds.length > 0) {
        where.seriesTags = {
          some: {
            tagId: { in: tagIds }
          }
        };
      }
    }

    // 連載状況フィルター
    if (status) {
      const statusList = status.split(',').map(s => s.trim()).filter(s => s);
      if (statusList.length > 0) {
        where.status = { in: statusList };
      }
    }

    // 年齢制限フィルター
    if (ageRating) {
      const ratingList = ageRating.split(',').map(r => r.trim()).filter(r => r);
      if (ratingList.length > 0) {
        where.ageRating = { in: ratingList };
      }
    }

    // 並び替え条件を構築
    let orderBy: any = {};
    if (sortBy === 'title') {
      orderBy.title = order === 'asc' ? 'asc' : 'desc';
    } else if (sortBy === 'rating') {
      orderBy.reviews = {
        _avg: {
          rating: order === 'asc' ? 'asc' : 'desc'
        }
      };
    } else if (sortBy === 'volumeCount') {
      orderBy.volumes = {
        _count: order === 'asc' ? 'asc' : 'desc'
      };
    } else {
      // デフォルト：関連性順（キーワードマッチ度）
      if (q) {
        // キーワードが指定されている場合は、タイトルマッチを優先
        orderBy.title = 'asc';
      } else {
        // キーワードがない場合は、最新順
        orderBy.createdAt = 'desc';
      }
    }

    // 総件数を取得
    const total = await prisma.series.count({ where });

    // シリーズ情報を取得
    const series = await prisma.series.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        // 巻数情報
        _count: {
          select: {
            volumes: true,
            reviews: true
          }
        },
        // ジャンル情報
        seriesGenres: {
          include: {
            genre: {
              select: {
                id: true,
                name: true,
                color: true,
                icon: true
              }
            }
          }
        },
        // タグ情報
        seriesTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                category: true
              }
            }
          }
        },
        // レビュー情報（平均評価計算用）
        reviews: {
          select: {
            rating: true
          }
        }
      }
    });

    // レスポンスデータを整形
    const formattedSeries = series.map(item => {
      // 平均評価を計算
      const avgRating = item.reviews.length > 0
        ? item.reviews.reduce((sum, review) => sum + review.rating, 0) / item.reviews.length
        : 0;

      // ジャンル情報を整形
      const genres = item.seriesGenres.map(sg => ({
        id: sg.genre.id,
        name: sg.genre.name,
        color: sg.genre.color,
        icon: sg.genre.icon
      }));

      // タグ情報を整形
      const tags = item.seriesTags.map(st => ({
        id: st.tag.id,
        name: st.tag.name,
        category: st.tag.category
      }));

      return {
        id: item.id,
        title: item.title,
        englishTitle: item.englishTitle,
        romajiTitle: item.romajiTitle,
        description: item.description,
        coverImageUrl: item.coverImageUrl,
        publisherName: item.publisherName,
        status: item.status,
        ageRating: item.ageRating,
        startDate: item.startDate,
        endDate: item.endDate,
        volumeCount: item._count.volumes,
        reviewCount: item._count.reviews,
        averageRating: Math.round(avgRating * 10) / 10, // 小数点第1位まで
        genres,
        tags,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };
    });

    // 成功時は検索結果をJSON形式で返却
    return NextResponse.json({
      items: formattedSeries,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      query: q,
      filters: {
        genres: genres ? genres.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [],
        tags: tags ? tags.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [],
        status: status ? status.split(',').map(s => s.trim()).filter(s => s) : [],
        ageRating: ageRating ? ageRating.split(',').map(r => r.trim()).filter(r => r) : []
      },
      sortBy,
      order
    });

  } catch (error: any) {
    // エラーが発生した場合のログ出力とエラーレスポンス
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
