/**
 * 認証コンテキスト
 * 
 * アプリケーション全体でユーザー認証状態を管理し、以下の機能を提供：
 * - ユーザーのログイン状態の管理
 * - ログイン・ログアウト処理
 * - ユーザー情報の取得・更新
 * - 認証状態の永続化
 * - トークン管理
 * 
 * このコンテキストは、アプリケーション全体で
 * ユーザーの認証状態を管理し、認証が必要な
 * 機能へのアクセス制御を提供します。
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// ユーザー情報の型定義
export interface User {
  id: number;
  email: string;
  username: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
}

// 認証コンテキストの型定義
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, username: string, password: string, bio?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// 認証コンテキストの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 認証プロバイダーの型定義
interface AuthProviderProps {
  children: ReactNode;
}

// 認証プロバイダーコンポーネント
export function AuthProvider({ children }: AuthProviderProps) {
  // 状態管理
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // コンポーネントマウント時に認証状態をチェック
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * 認証状態のチェック
   * ローカルストレージからユーザー情報を取得し、有効性を確認
   */
  const checkAuthStatus = async () => {
    try {
      // ローカルストレージからユーザー情報を取得
      const storedUser = localStorage.getItem('manga-review-user');
      const storedToken = localStorage.getItem('manga-review-token');

      if (storedUser && storedToken) {
        // トークンの有効性をチェック（簡易版）
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth status check error:', error);
      // エラーが発生した場合は認証情報をクリア
      localStorage.removeItem('manga-review-user');
      localStorage.removeItem('manga-review-token');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ユーザーログイン処理
   * @param identifier メールアドレスまたはユーザー名
   * @param password パスワード
   * @returns ログイン結果
   */
  const login = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ログイン成功時
        setUser(data.user);
        
        // ローカルストレージにユーザー情報とトークンを保存
        localStorage.setItem('manga-review-user', JSON.stringify(data.user));
        localStorage.setItem('manga-review-token', data.token);
        
        return { success: true };
      } else {
        // ログイン失敗時
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * ユーザー登録処理
   * @param email メールアドレス
   * @param username ユーザー名
   * @param password パスワード
   * @param bio 自己紹介（オプション）
   * @returns 登録結果
   */
  const register = async (email: string, username: string, password: string, bio?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password, bio }),
      });

      const data = await response.json();

      if (response.ok) {
        // 登録成功時
        setUser(data.user);
        
        // ローカルストレージにユーザー情報を保存
        localStorage.setItem('manga-review-user', JSON.stringify(data.user));
        
        return { success: true };
      } else {
        // 登録失敗時
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  /**
   * ユーザーログアウト処理
   * 状態をクリアし、ローカルストレージから認証情報を削除
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('manga-review-user');
    localStorage.removeItem('manga-review-token');
  };

  /**
   * ユーザー情報の更新
   * @param userData 更新するユーザー情報
   */
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('manga-review-user', JSON.stringify(updatedUser));
    }
  };

  // コンテキストの値
  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 認証コンテキストを使用するためのカスタムフック
 * @returns 認証コンテキストの値
 * @throws コンテキストが提供されていない場合のエラー
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
