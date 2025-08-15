import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * 認証ヘルパー関数
 * 
 * JWTトークンの検証とユーザー情報の抽出：
 * - HTTPOnlyクッキーからトークンを取得
 * - JWTの署名と有効期限を検証
 * - ユーザーIDとユーザー情報を返却
 * 
 * このモジュールは、APIルートでJWT認証を行う際の
 * 共通処理を提供します。セキュリティを重視し、
 * トークンの有効性を厳密にチェックします。
 */

// 認証結果の型定義
interface AuthResult {
  success: boolean;
  userId?: number;
  user?: any;
  error?: string;
}

/**
 * リクエストからJWTトークンを検証し、ユーザー情報を返却
 * @param request NextRequestオブジェクト
 * @returns 認証結果（成功時はユーザーIDとユーザー情報、失敗時はエラーメッセージ）
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // JWTシークレットキーの取得
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set');
      return {
        success: false,
        error: 'Server configuration error'
      };
    }

    // クッキーからトークンを取得
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return {
        success: false,
        error: 'No authentication token provided'
      };
    }

    // JWTトークンの検証
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // トークンの有効性チェック
    if (!decoded || !decoded.userId) {
      return {
        success: false,
        error: 'Invalid token format'
      };
    }

    // 有効期限のチェック
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return {
        success: false,
        error: 'Token expired'
      };
    }

    // 成功時はユーザーIDとユーザー情報を返却
    return {
      success: true,
      userId: decoded.userId,
      user: {
        id: decoded.userId,
        username: decoded.username,
        email: decoded.email
      }
    };

  } catch (error: any) {
    // エラーの種類に応じて適切なメッセージを返却
    if (error.name === 'JsonWebTokenError') {
      return {
        success: false,
        error: 'Invalid token signature'
      };
    } else if (error.name === 'TokenExpiredError') {
      return {
        success: false,
        error: 'Token expired'
      };
    } else {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }
}

/**
 * リクエストからユーザーIDのみを抽出（軽量な認証チェック）
 * @param request NextRequestオブジェクト
 * @returns ユーザーID（認証失敗時はnull）
 */
export async function getUserId(request: NextRequest): Promise<number | null> {
  const authResult = await verifyAuth(request);
  return authResult.success ? authResult.userId || null : null;
}

/**
 * リクエストからユーザー情報を抽出
 * @param request NextRequestオブジェクト
 * @returns ユーザー情報（認証失敗時はnull）
 */
export async function getUser(request: NextRequest): Promise<any | null> {
  const authResult = await verifyAuth(request);
  return authResult.success ? authResult.user || null : null;
}
