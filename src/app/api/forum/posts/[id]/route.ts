/**
 * フォーラム投稿詳細API
 * 
 * 個別のフォーラム投稿の取得・更新・削除：
 * - GET: 投稿詳細の取得（コメント数、いいね数を含む）
 * - PUT: 投稿の更新（作成者のみ）
 * - DELETE: 投稿の削除（作成者のみ）
 * 
 * このAPIは、フォーラム投稿の詳細表示と
 * 投稿の管理機能を提供します。
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

const prisma = new PrismaClient();

// GET: 投稿詳細の取得
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

    // 投稿詳細を取得（関連データを含む）
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        series: {
          select: {
            id: true,
            title: true,
            englishTitle: true,
          },
        },
        tags: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }
      );
    }

    // タグ名の配列に変換
    const tags = post.tags.map(tag => tag.name);

    // レスポンスデータを整形
    const responseData = {
      ...post,
      tags,
      tags: undefined, // 元のtagsフィールドを削除
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('投稿詳細取得エラー:', error);
    return NextResponse.json(
      { error: '投稿の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// PUT: 投稿の更新
export async function PUT(
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

    const { title, content, category, tags, seriesId } = await request.json();

    // 必須項目のバリデーション
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'タイトル、内容、カテゴリは必須です' },
        { status: 400 }
      );
    }

    // 投稿の存在確認と作成者チェック
    const existingPost = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }
      );
    }

    if (existingPost.userId !== authResult.user!.id) {
      return NextResponse.json(
        { error: '投稿の編集権限がありません' },
        { status: 403 }
      );
    }

    // タグの処理
    let tagIds: number[] = [];
    if (tags && tags.length > 0) {
      // 既存のタグを検索または作成
      const tagOperations = tags.map(async (tagName: string) => {
        const existingTag = await prisma.tag.findFirst({
          where: { name: tagName },
        });
        
        if (existingTag) {
          return existingTag.id;
        } else {
          const newTag = await prisma.tag.create({
            data: { name: tagName },
          });
          return newTag.id;
        }
      });
      
      tagIds = await Promise.all(tagOperations);
    }

    // 投稿を更新
    const updatedPost = await prisma.forumPost.update({
      where: { id: postId },
      data: {
        title: title.trim(),
        content: content.trim(),
        category,
        seriesId: seriesId || null,
        updatedAt: new Date(),
        tags: {
          set: [], // 既存のタグをクリア
          connect: tagIds.map(id => ({ id })), // 新しいタグを接続
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        series: {
          select: {
            id: true,
            title: true,
            englishTitle: true,
          },
        },
        tags: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    // タグ名の配列に変換
    const tags = updatedPost.tags.map(tag => tag.name);

    // レスポンスデータを整形
    const responseData = {
      ...updatedPost,
      tags,
      tags: undefined, // 元のtagsフィールドを削除
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('投稿更新エラー:', error);
    return NextResponse.json(
      { error: '投稿の更新に失敗しました' },
      { status: 500 }
    );
  }
}

// DELETE: 投稿の削除
export async function DELETE(
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

    // 投稿の存在確認と作成者チェック
    const existingPost = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: '投稿が見つかりません' },
        { status: 404 }
      );
    }

    if (existingPost.userId !== authResult.user!.id) {
      return NextResponse.json(
        { error: '投稿の削除権限がありません' },
        { status: 403 }
      );
    }

    // 投稿を削除（関連するコメント、いいね、タグも自動的に削除される）
    await prisma.forumPost.delete({
      where: { id: postId },
    });

    return NextResponse.json({ message: '投稿が削除されました' });
  } catch (error) {
    console.error('投稿削除エラー:', error);
    return NextResponse.json(
      { error: '投稿の削除に失敗しました' },
      { status: 500 }
    );
  }
}
