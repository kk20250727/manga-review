/**
 * フォーラム投稿コメントAPI
 * 
 * フォーラム投稿へのコメント機能：
 * - GET: 投稿のコメント一覧取得
 * - POST: 新規コメントの投稿
 * 
 * このAPIは、フォーラム投稿に対する
 * コメントの表示と投稿機能を提供します。
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

// GET: コメント一覧の取得
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const postId = parseInt(context.params.id);
    
    if (isNaN(postId)) {
      return NextResponse.json(
        { error: '無効な投稿IDです' },
        { status: 400 }
      );
    }

    // URLパラメータからページネーション情報を取得
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // 投稿の存在確認
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }
      );
    }

    // コメントを取得
    const comments = await prisma.forumComment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        [sortBy]: order,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 総コメント数を取得
    const totalComments = await prisma.forumComment.count({
      where: { postId },
    });

    // 総ページ数を計算
    const totalPages = Math.ceil(totalComments / pageSize);

    return NextResponse.json({
      items: comments,
      total: totalComments,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
  } catch (error) {
    console.error('コメント取得エラー:', error);
    return NextResponse.json(
      { error: 'コメントの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST: 新規コメントの投稿
export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // 認証チェック
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const postId = parseInt(context.params.id);
    if (isNaN(postId)) {
      return NextResponse.json(
        { error: '無効な投稿IDです' },
        { status: 400 }
      );
    }

    const { content } = await request.json();

    // 必須項目のバリデーション
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'コメント内容は必須です' },
        { status: 400 }
      );
    }

    // 投稿の存在確認
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }
      );
    }

    // 新規コメントを作成
    const comment = await prisma.forumComment.create({
      data: {
        content: content.trim(),
        postId,
        userId: authResult.user!.id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('コメント投稿エラー:', error);
    return NextResponse.json(
      { error: 'コメントの投稿に失敗しました' },
      { status: 500 }
    );
  }
}
