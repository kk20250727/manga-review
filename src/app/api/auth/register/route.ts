import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * ユーザー登録API
 * 
 * 新規ユーザーの登録処理を行い、以下の機能を提供：
 * - 入力値のバリデーション
 * - パスワードのハッシュ化
 * - 重複チェック（メールアドレス、ユーザー名）
 * - ユーザー情報のデータベース保存
 */

export async function POST(request: NextRequest) {
  try {
    // リクエストボディからユーザー情報を取得
    const { email, username, password, bio } = await request.json();

    // 必須項目のバリデーション
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'Email, username, and password are required' },
        { status: 400 }
      );
    }

    // パスワードの長さチェック（最低8文字）
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // メールアドレスの形式チェック（簡易版）
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // ユーザー名の長さチェック（3-20文字）
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 20 characters' },
        { status: 400 }
      );
    }

    // 既存ユーザーの重複チェック
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      } else {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 409 }
        );
      }
    }

    // パスワードのハッシュ化（セキュリティ向上）
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 新規ユーザーの作成
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: hashedPassword,
        bio: bio || null,
        avatar: null,
      },
      // パスワードは返却しない（セキュリティ）
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        avatar: true,
        createdAt: true,
      }
    });

    // 成功時はユーザー情報を返却（パスワードは含まない）
    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: newUser 
      },
      { status: 201 }
    );

  } catch (error: any) {
    // エラーログの出力
    console.error('User registration error:', error);
    
    // データベースエラーの場合
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 409 }
      );
    }

    // その他のエラー
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
