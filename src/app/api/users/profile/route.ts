import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

/**
 * ユーザープロフィール更新API
 * 
 * 認証されたユーザーのプロフィール情報を更新：
 * - ユーザー名の変更
 * - 自己紹介の追加・編集
 * - アバター画像URLの設定
 * - 入力値の検証
 * - 重複チェック
 * 
 * このAPIは、ユーザーが自分のプロフィール情報を
 * 安全に更新できるようにします。入力値の検証、
 * ユーザー名の重複チェック、適切なエラーハンドリング
 * を実装しています。
 */

export async function PUT(request: NextRequest) {
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

    // リクエストボディから更新データを取得
    const { username, bio, avatarUrl } = await request.json();

    // 入力値の検証
    const validationErrors = [];

    // ユーザー名の検証
    if (username !== undefined) {
      if (!username || username.trim().length === 0) {
        validationErrors.push('Username is required');
      } else if (username.trim().length < 3) {
        validationErrors.push('Username must be at least 3 characters long');
      } else if (username.trim().length > 30) {
        validationErrors.push('Username must be less than 30 characters');
      }
    }

    // 自己紹介の検証
    if (bio !== undefined && bio && bio.length > 500) {
      validationErrors.push('Bio must be less than 500 characters');
    }

    // アバターURLの検証
    if (avatarUrl !== undefined && avatarUrl) {
      try {
        new URL(avatarUrl);
      } catch {
        validationErrors.push('Invalid avatar URL format');
      }
    }

    // バリデーションエラーがある場合はエラーレスポンス
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationErrors 
        },
        { status: 400 }
      );
    }

    // ユーザー名が変更される場合、重複チェック
    if (username !== undefined && username !== authResult.user?.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: username.trim(),
          id: { not: userId }
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        );
      }
    }

    // 更新データの準備
    const updateData: any = {};
    
    if (username !== undefined) {
      updateData.username = username.trim();
    }
    
    if (bio !== undefined) {
      updateData.bio = bio ? bio.trim() : null;
    }
    
    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl || null;
    }

    // プロフィール情報を更新
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // 成功時は更新されたユーザー情報をJSON形式で返却
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error: any) {
    // エラーが発生した場合のログ出力とエラーレスポンス
    console.error('Failed to update profile:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

/**
 * ユーザープロフィール情報の取得
 * 現在のプロフィール情報を返却
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

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 成功時はユーザー情報をJSON形式で返却
    return NextResponse.json({ user });

  } catch (error: any) {
    // エラーが発生した場合のログ出力とエラーレスポンス
    console.error('Failed to fetch profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
