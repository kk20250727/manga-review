/**
 * お気に入りボタンコンポーネント
 * 
 * シリーズをお気に入りに追加・削除する機能を提供：
 * - お気に入り状態の表示
 * - 追加・削除の切り替え
 * - アニメーション効果
 * - 認証状態の確認
 * - エラーハンドリング
 * 
 * このコンポーネントは、シリーズ詳細ページや
 * シリーズ一覧で使用され、ユーザーが簡単に
 * お気に入り管理を行えるようにします。
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface FavoriteButtonProps {
  seriesId: number;
  seriesTitle: string;
  className?: string;
}

export default function FavoriteButton({ seriesId, seriesTitle, className = '' }: FavoriteButtonProps) {
  // 状態管理
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteId, setFavoriteId] = useState<number | null>(null);

  // 認証フックの使用
  const { user } = useAuth();

  // コンポーネントマウント時にお気に入り状態をチェック
  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [user, seriesId]);

  /**
   * お気に入り状態の確認
   * ユーザーがログインしている場合、現在のシリーズがお気に入りに含まれているかチェック
   */
  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/favorites?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        const favorite = data.items.find((item: any) => item.series.id === seriesId);
        if (favorite) {
          setIsFavorite(true);
          setFavoriteId(favorite.id);
        }
      }
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  };

  /**
   * お気に入りの追加・削除処理
   * 現在の状態に応じて追加または削除を実行
   */
  const toggleFavorite = async () => {
    if (!user) {
      // 未ログイン時はログインページにリダイレクト
      window.location.href = '/auth/login';
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorite && favoriteId) {
        // お気に入りから削除
        const response = await fetch(`/api/favorites?id=${favoriteId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setIsFavorite(false);
          setFavoriteId(null);
        } else {
          throw new Error('Failed to remove from favorites');
        }
      } else {
        // お気に入りに追加
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user.id,
            seriesId: seriesId
          })
        });

        if (response.ok) {
          const data = await response.json();
          setIsFavorite(true);
          setFavoriteId(data.favorite.id);
        } else {
          throw new Error('Failed to add to favorites');
        }
      }
    } catch (error) {
      console.error('Favorite toggle error:', error);
      // エラー時は元の状態に戻す
      setIsFavorite(!isFavorite);
    } finally {
      setIsLoading(false);
    }
  };

  // ログインしていない場合の表示
  if (!user) {
    return (
      <button
        onClick={() => window.location.href = '/auth/login'}
        className={`flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${className}`}
        title="Login to add to favorites"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span>Add to Favorites</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        isFavorite
          ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg transform scale-105'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
      } ${className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {/* ハートアイコン（塗りつぶし状態で切り替え） */}
      <svg 
        className={`w-5 h-5 transition-all duration-200 ${
          isFavorite ? 'text-white' : 'text-gray-600'
        }`} 
        fill={isFavorite ? 'currentColor' : 'none'} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>

      {/* ボタンテキスト */}
      <span className="font-medium">
        {isLoading 
          ? (isFavorite ? 'Removing...' : 'Adding...')
          : (isFavorite ? 'In Favorites' : 'Add to Favorites')
        }
      </span>

      {/* ローディングインジケーター */}
      {isLoading && (
        <svg className="animate-spin w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
    </button>
  );
}
