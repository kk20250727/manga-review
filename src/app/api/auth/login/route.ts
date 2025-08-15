import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * ユーザーログインAPI
 * 
 * 既存ユーザーのログイン処理を行い、以下の機能を提供：
 * - ユーザー認証（メールアドレス/ユーザー名 + パスワード）
 * - パスワードの検証
 * - JWTトークンの生成
 * - セッション情報の管理
 */

export async function POST(request: NextRequest) {
  try {
    // リクエストボディからログイン情報を取得
    const { identifier, password } = await request.json();

    // 必須項目のバリデーション
    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email/username and password are required' },
        { status: 400 }
      );
    }

    // ユーザーの検索（メールアドレスまたはユーザー名で検索）
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { username: identifier.toLowerCase() }
        ]
      }
    });

    // ユーザーが存在しない場合
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // パスワードの検証
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // JWTトークンの生成（セッション管理）
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        username: user.username 
      },
      jwtSecret,
      { expiresIn: '7d' } // 7日間有効
    );

    // レスポンスヘッダーにトークンを設定
    const response = NextResponse.json(
      { 
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          bio: user.bio,
          avatar: user.avatar,
        },
        token: token
      },
      { status: 200 }
    );

    // HTTPOnlyクッキーにトークンを設定（セキュリティ向上）
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7日間
      path: '/'
    });

    return response;

  } catch (error: any) {
    // エラーログの出力
    console.error('User login error:', error);
    
    // その他のエラー
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
