import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * レビュー情報を管理するAPI
 * 
 * GET: シリーズまたは巻に紐づくレビュー一覧を取得
 * POST: 新しいレビューを作成（シリーズまたは巻のいずれかに紐づけ）
 */

// GET: レビュー一覧の取得
export async function GET(req: NextRequest) {
  try {
    // URLパラメータからシリーズIDまたは巻IDを取得
    const { searchParams } = new URL(req.url);
    const seriesId = searchParams.get('seriesId');
    const volumeId = searchParams.get('volumeId');

    // 検索条件を構築（シリーズIDまたは巻IDのいずれかが指定されている場合）
    const where: any = {};
    if (seriesId) where.seriesId = Number(seriesId);
    if (volumeId) where.volumeId = Number(volumeId);

    // Prismaを使用してレビューを取得（作成日時順で降順）
    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // 成功時はレビュー一覧をJSON形式で返却（フロントエンドの期待する形式に合わせてitemsプロパティでラップ）
    return NextResponse.json({ items: reviews });
  } catch (error: any) {
    // エラーが発生した場合のログ出力とエラーレスポンス
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST: 新しいレビューの作成
export async function POST(req: NextRequest) {
  try {
    // リクエストボディからレビュー情報を取得
    const { rating, comment, nickname, seriesId, volumeId } = await req.json();

    // 必須項目のバリデーション
    // rating（評価）は必須、seriesIdまたはvolumeIdのいずれかは必須
    if (!rating || (seriesId === undefined && volumeId === undefined)) {
      return NextResponse.json({ 
        error: 'Rating and either seriesId or volumeId are required' 
      }, { status: 400 });
    }

    // Prismaを使用して新しいレビューを作成
    const newReview = await prisma.review.create({
      data: {
        rating: Number(rating),        // 評価（数値に変換）
        comment: comment || '',        // コメント（空文字の場合は空文字を設定）
        nickname: nickname || '',      // ニックネーム（空文字の場合は空文字を設定）
        seriesId: seriesId ? Number(seriesId) : null,  // シリーズID（数値に変換、undefinedの場合はnull）
        volumeId: volumeId ? Number(volumeId) : null,  // 巻ID（数値に変換、undefinedの場合はnull）
      },
    });

    // 成功時は作成されたレビューをJSON形式で返却（フロントエンドの期待する形式に合わせてitemプロパティでラップ）
    return NextResponse.json({ item: newReview }, { status: 201 });
  } catch (error: any) {
    // エラーが発生した場合のログ出力とエラーレスポンス
    console.error('Failed to create review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
