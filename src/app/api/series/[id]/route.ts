import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * シリーズ詳細情報を取得するAPI
 * 
 * 指定されたIDのシリーズ情報、巻一覧、著者情報、別名タイトルを
 * リレーション付きで取得し、フロントエンドで表示可能な形式で返却
 */
export async function GET(
  request: NextRequest, // 💡 ここを 'Request' から 'NextRequest' に変更しました
  context: { params: { id: string } }
) {
  try {
    // URLパラメータからシリーズIDを取得し、数値に変換
    const id = Number(context.params.id);
    
    // IDが数値でない場合のバリデーション
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Prismaを使用してシリーズ情報を取得（リレーション付き）
    const series = await prisma.series.findUnique({
      where: { id },
      include: {
        // 巻一覧を巻番号順で取得
        volumes: {
          orderBy: { volumeNumber: 'asc' },
        },
        // 著者情報を取得（役割と名前を含む）
        creators: {
          include: {
            creator: true, // Creatorテーブルの詳細情報
          },
        },
        // 別名タイトルを取得
        aliases: true,
      },
    });

    // シリーズが存在しない場合のエラーハンドリング
    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    // 成功時はシリーズ情報をJSON形式で返却
    return NextResponse.json(series);
  } catch (error) {
    // 予期しないエラーが発生した場合のログ出力とエラーレスポンス
    console.error('Failed to fetch series:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}