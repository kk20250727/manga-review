/**
 * お気に入りページ
 * 
 * ユーザーがお気に入りに追加したシリーズ一覧を表示：
 * - 認証状態のチェック
 * - お気に入りシリーズの一覧表示
 * - お気に入りからの削除機能
 * - レスポンシブデザイン
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import FavoriteButton from '@/components/FavoriteButton';

// お気に入りシリーズの型定義
interface FavoriteSeries {
  id: number;
  title: string;
  englishTitle?: string;
  romajiTitle?: string;
  description?: string;
  coverImageUrl?: string;
  publisherName?: string;
  status?: string;
  ageRating?: string;
  volumes: any[];
  genres: Array<{
    id: number;
    name: string;
    color?: string;
    icon?: string;
  }>;
}

// お気に入りアイテムの型定義
interface FavoriteItem {
  id: number;
  series: FavoriteSeries;
  addedAt: string;
}

/**
 * お気に入りページ
 * 
 * ユーザーがお気に入りに登録したシリーズの一覧表示：
 * - お気に入りシリーズのグリッド表示
 * - シリーズ情報（タイトル、説明、画像）
 * - お気に入りからの削除機能
 * - シリーズ詳細ページへのリンク
 * - 未認証ユーザーのログインページリダイレクト
 * 
 * このページは、ユーザーが自分のお気に入りシリーズを
 * 管理し、簡単にアクセスできるようにします。
 */
export default function FavoritesPage() {
  // 状態管理
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // フックの使用
  const { user } = useAuth();
  const router = useRouter();

  // コンポーネントマウント時にお気に入り一覧を取得
  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else if (!user && !loading) {
      // 未ログイン時はログインページにリダイレクト
      router.push('/auth/login');
    }
  }, [user]);

  /**
   * お気に入り一覧の取得
   * ログインユーザーのお気に入りシリーズをAPIから取得
   */
  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/favorites?userId=${user?.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.items || []);
      } else {
        throw new Error('Failed to fetch favorites');
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  /**
   * お気に入りからの削除処理
   * 削除後、一覧を再取得して表示を更新
   */
  const handleRemoveFavorite = async (favoriteId: number) => {
    try {
      const response = await fetch(`/api/favorites?id=${favoriteId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // 削除成功時は一覧から該当アイテムを除去
        setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      } else {
        throw new Error('Failed to remove favorite');
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      setError('Failed to remove favorite');
    }
  };

  // ローディング状態の表示
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading favorites...</p>
        </div>
      </div>
    );
  }

  // 未ログイン状態の表示
  if (!user) {
    return null; // リダイレクト中
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
          <p className="text-gray-600">
            Your personal collection of favorite manga series
          </p>
        </div>

        {/* エラーメッセージの表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* お気に入り一覧 */}
        {favorites.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* シリーズ画像 */}
                <div className="aspect-[3/4] bg-gray-200 overflow-hidden">
                  {favorite.series.coverImageUrl ? (
                    <Image
                      src={favorite.series.coverImageUrl}
                      alt={favorite.series.title}
                      width={300}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* シリーズ情報 */}
                <div className="p-6">
                  {/* タイトル */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    <Link href={`/series/${favorite.series.id}`} className="hover:text-blue-600">
                      {favorite.series.title}
                    </Link>
                  </h3>

                  {/* 英語タイトルとローマ字タイトル */}
                  {favorite.series.englishTitle && (
                    <p className="text-gray-600 mb-1">{favorite.series.englishTitle}</p>
                  )}
                  {favorite.series.romajiTitle && (
                    <p className="text-gray-500 mb-2">{favorite.series.romajiTitle}</p>
                  )}

                  {/* 出版社とステータス */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    {favorite.series.publisherName && (
                      <span>{favorite.series.publisherName}</span>
                    )}
                    {favorite.series.status && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        favorite.series.status === '連載中' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {favorite.series.status}
                      </span>
                    )}
                  </div>

                  {/* ジャンルタグ */}
                  {favorite.series.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {favorite.series.genres.slice(0, 3).map((genre) => (
                        <span
                          key={genre.id}
                          className="px-2 py-1 text-xs rounded-full text-white"
                          style={{ backgroundColor: genre.color || '#6B7280' }}
                        >
                          {genre.icon} {genre.name}
                        </span>
                      ))}
                      {favorite.series.genres.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
                          +{favorite.series.genres.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* 巻数情報 */}
                  {favorite.series.volumes.length > 0 && (
                    <p className="text-sm text-gray-600 mb-4">
                      {favorite.series.volumes.length} volume{favorite.series.volumes.length !== 1 ? 's' : ''}
                    </p>
                  )}

                  {/* アクションボタン */}
                  <div className="flex gap-2">
                    <Link
                      href={`/series/${favorite.series.id}`}
                      className="flex-1 bg-blue-600 text-white text-center px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleRemoveFavorite(favorite.id)}
                      className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove from favorites"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* 追加日時 */}
                  <p className="text-xs text-gray-400 mt-3">
                    Added {new Date(favorite.addedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* お気に入りが0件の場合の表示 */
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💔</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No favorites yet</h3>
            <p className="text-gray-500 mb-6">
              Start building your manga collection by adding series to your favorites
            </p>
            <div className="space-x-4">
              <Link
                href="/search"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Discover Manga
              </Link>
              <Link
                href="/admin/series"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Browse Series
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
