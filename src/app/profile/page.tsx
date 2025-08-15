/**
 * ユーザープロフィールページ
 * 
 * ユーザーの詳細情報を表示・管理：
 * - 基本プロフィール情報（ユーザー名、メール、登録日）
 * - 統計情報（レビュー数、お気に入り数、フォロー数）
 * - お気に入りシリーズ一覧
 * - レビュー履歴
 * - プロフィール編集機能
 * - アカウント設定
 * 
 * このページは、ユーザーが自分の活動履歴を確認し、
 * プロフィール情報を管理できる個人ダッシュボードとして機能します。
 * タブ形式で情報を整理し、使いやすいUIを提供します。
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// ユーザー統計情報の型定義
interface UserStats {
  reviewCount: number;
  favoriteCount: number;
  followingCount: number;
  followerCount: number;
  totalRating: number;
  averageRating: number;
}

// レビュー履歴の型定義
interface ReviewHistory {
  id: number;
  seriesId: number;
  seriesTitle: string;
  seriesCoverImageUrl?: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  // 認証コンテキストとルーター
  const { user, logout } = useAuth();
  const router = useRouter();

  // 状態管理
  const [stats, setStats] = useState<UserStats | null>(null);
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState<ReviewHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, favorites, reviews, settings
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    avatarUrl: ''
  });

  // コンポーネントマウント時の処理
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    fetchUserData();
    setEditForm({
      username: user.username || '',
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || ''
    });
  }, [user, router]);

  /**
   * ユーザーデータの取得
   * 統計情報、お気に入り、レビュー履歴を並行で取得
   */
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // 並行でデータを取得
      const [statsRes, favoritesRes, reviewsRes] = await Promise.all([
        fetch('/api/users/stats'),
        fetch('/api/favorites'),
        fetch('/api/reviews?userId=' + user?.id)
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (favoritesRes.ok) {
        const favoritesData = await favoritesRes.json();
        setFavorites(favoritesData.items || []);
      }

      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * プロフィール編集の保存
   */
  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setIsEditing(false);
        // プロフィール更新後の処理（必要に応じて）
        fetchUserData();
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  /**
   * ログアウト処理
   */
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // ローディング状態の表示
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  // ユーザーが存在しない場合
  if (!user) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-start space-x-6">
          {/* アバター */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.username}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* ユーザー情報 */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
                <p className="text-gray-600 mt-1">{user.email}</p>
                {user.bio && (
                  <p className="text-gray-700 mt-3">{user.bio}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              {/* アクションボタン */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* プロフィール編集フォーム */}
            {isEditing && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      value={editForm.avatarUrl}
                      onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.reviewCount}</div>
            <div className="text-sm text-gray-600">Reviews</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.favoriteCount}</div>
            <div className="text-sm text-gray-600">Favorites</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.followingCount}</div>
            <div className="text-sm text-gray-600">Following</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.averageRating.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </div>
        </div>
      )}

      {/* タブナビゲーション */}
      <div className="bg-white border rounded-lg mb-6">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'favorites', label: 'Favorites', icon: '❤️' },
              { id: 'reviews', label: 'Reviews', icon: '⭐' },
              { id: 'settings', label: 'Settings', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* タブコンテンツ */}
        <div className="p-6">
          {/* 概要タブ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Activity Overview</h3>
              
              {/* 最近のアクティビティ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 最近のお気に入り */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Recent Favorites</h4>
                  <div className="space-y-2">
                    {favorites.slice(0, 3).map((favorite) => (
                      <div key={favorite.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                        <div className="w-10 h-14 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          {favorite.series?.coverImageUrl ? (
                            <Image
                              src={favorite.series.coverImageUrl}
                              alt={favorite.series.title}
                              width={40}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {favorite.series?.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            Added {new Date(favorite.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 最近のレビュー */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Recent Reviews</h4>
                  <div className="space-y-2">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="p-2 bg-gray-50 rounded">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {review.seriesTitle}
                          </p>
                          <span className="text-sm text-yellow-600">★ {review.rating}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* お気に入りタブ */}
          {activeTab === 'favorites' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Favorite Series</h3>
              {favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map((favorite) => (
                    <div key={favorite.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="w-full h-48 bg-gray-200">
                        {favorite.series?.coverImageUrl ? (
                          <Image
                            src={favorite.series.coverImageUrl}
                            alt={favorite.series.title}
                            width={300}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          <Link href={`/series/${favorite.seriesId}`} className="hover:text-blue-600">
                            {favorite.series?.title}
                          </Link>
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Added {new Date(favorite.createdAt).toLocaleDateString()}
                        </p>
                        <button
                          onClick={() => {
                            // お気に入りから削除処理
                          }}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove from favorites
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No favorite series yet.</p>
                  <Link href="/search" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
                    Discover new series
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* レビュータブ */}
          {activeTab === 'reviews' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Review History</h3>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            <Link href={`/series/${review.seriesId}`} className="hover:text-blue-600">
                              {review.seriesTitle}
                            </Link>
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                            <span className="text-yellow-600">★ {review.rating}/5</span>
                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                            {review.updatedAt !== review.createdAt && (
                              <span className="text-xs">(edited)</span>
                            )}
                          </div>
                          {review.comment && (
                            <p className="text-gray-700">{review.comment}</p>
                          )}
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-700">
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reviews yet.</p>
                  <Link href="/search" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
                    Start reviewing series
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 設定タブ */}
          {activeTab === 'settings' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Settings</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Password Change</h4>
                  <div className="max-w-md space-y-3">
                    <input
                      type="password"
                      placeholder="Current password"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Change Password
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Notification Preferences</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-700">Email notifications for new releases</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-700">Weekly digest of favorite series updates</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Privacy Settings</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-700">Make profile public</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-700">Show reading activity to others</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
