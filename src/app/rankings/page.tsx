/**
 * ランキングページ
 * 
 * 様々なカテゴリのランキングを表示：
 * - 人気シリーズランキング（お気に入り数、レビュー数）
 * - 評価ランキング（平均評価、レビュー数）
 * - 人気投稿ランキング（いいね数、コメント数）
 * - 新着シリーズランキング
 * - ジャンル別ランキング
 * 
 * このページは、ユーザーが人気のコンテンツを
 * 発見し、トレンドを把握できるようにします。
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// 型定義
interface Series {
  id: number;
  title: string;
  englishTitle?: string;
  description: string;
  coverImageUrl?: string;
  publisherName: string;
  status: string;
  averageRating: number;
  reviewCount: number;
  favoriteCount: number;
  genres: { name: string }[];
}

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  user: {
    username: string;
  };
  series?: {
    id: number;
    title: string;
    englishTitle?: string;
  };
  _count: {
    comments: number;
    likes: number;
  };
}

export default function RankingsPage() {
  // 状態管理
  const [popularSeries, setPopularSeries] = useState<Series[]>([]);
  const [topRatedSeries, setTopRatedSeries] = useState<Series[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [newSeries, setNewSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('popular');

  // データ取得処理
  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setIsLoading(true);
        
        // 並行でデータを取得
        const [popularRes, topRatedRes, postsRes, newSeriesRes] = await Promise.all([
          fetch('/api/rankings/series/popular'),
          fetch('/api/rankings/series/top-rated'),
          fetch('/api/rankings/posts/popular'),
          fetch('/api/rankings/series/new')
        ]);

        if (popularRes.ok) {
          const data = await popularRes.json();
          setPopularSeries(data.items || []);
        }

        if (topRatedRes.ok) {
          const data = await topRatedRes.json();
          setTopRatedSeries(data.items || []);
        }

        if (postsRes.ok) {
          const data = await postsRes.json();
          setPopularPosts(data.items || []);
        }

        if (newSeriesRes.ok) {
          const data = await newSeriesRes.json();
          setNewSeries(data.items || []);
        }
      } catch (error) {
        console.error('Failed to fetch rankings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();
  }, []);

  // ローディング状態の表示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">ランキングを読み込み中...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ページヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Manga Rankings
          </h1>
          <p className="text-xl text-gray-600">
            人気のシリーズ、高評価作品、トレンド投稿をチェック
          </p>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('popular')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'popular'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                人気シリーズ
              </button>
              <button
                onClick={() => setActiveTab('top-rated')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'top-rated'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                高評価作品
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'posts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                人気投稿
              </button>
              <button
                onClick={() => setActiveTab('new')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'new'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                新着シリーズ
              </button>
            </nav>
          </div>

          {/* タブコンテンツ */}
          <div className="p-6">
            {/* 人気シリーズタブ */}
            {activeTab === 'popular' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  人気シリーズランキング
                </h2>
                <div className="space-y-4">
                  {popularSeries.map((series, index) => (
                    <div key={series.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      {/* ランキング順位 */}
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {index + 1}
                      </div>
                      
                      {/* シリーズ画像 */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-20 bg-gray-200 rounded overflow-hidden">
                          {series.coverImageUrl ? (
                            <Image
                              src={series.coverImageUrl}
                              alt={series.title}
                              width={64}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* シリーズ情報 */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/series/${series.id}`}
                          className="block group"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {series.englishTitle || series.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {series.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{series.publisherName}</span>
                          <span>•</span>
                          <span>{series.status}</span>
                          {series.genres.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{series.genres[0].name}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* 統計情報 */}
                      <div className="flex-shrink-0 text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="font-semibold">{series.averageRating.toFixed(1)}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          <div>❤️ {series.favoriteCount}</div>
                          <div>💬 {series.reviewCount}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 高評価作品タブ */}
            {activeTab === 'top-rated' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  高評価作品ランキング
                </h2>
                <div className="space-y-4">
                  {topRatedSeries.map((series, index) => (
                    <div key={series.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      {/* ランキング順位 */}
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {index + 1}
                      </div>
                      
                      {/* シリーズ画像 */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-20 bg-gray-200 rounded overflow-hidden">
                          {series.coverImageUrl ? (
                            <Image
                              src={series.coverImageUrl}
                              alt={series.title}
                              width={64}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* シリーズ情報 */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/series/${series.id}`}
                          className="block group"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {series.englishTitle || series.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {series.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{series.publisherName}</span>
                          <span>•</span>
                          <span>{series.status}</span>
                          {series.genres.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{series.genres[0].name}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* 評価情報 */}
                      <div className="flex-shrink-0 text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-2xl font-bold text-purple-600">
                            {series.averageRating.toFixed(1)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          <div>レビュー {series.reviewCount}件</div>
                          <div>お気に入り {series.favoriteCount}件</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 人気投稿タブ */}
            {activeTab === 'posts' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  人気投稿ランキング
                </h2>
                <div className="space-y-4">
                  {popularPosts.map((post, index) => (
                    <div key={post.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      {/* ランキング順位 */}
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {index + 1}
                      </div>
                      
                      {/* 投稿内容 */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/forum/${post.id}`}
                          className="block group"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                            {post.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>by {post.user.username}</span>
                          <span>•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString('ja-JP')}</span>
                          <span>•</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            post.category === 'Discussion' ? 'bg-blue-100 text-blue-800' :
                            post.category === 'Review' ? 'bg-green-100 text-green-800' :
                            post.category === 'Question' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {post.category}
                          </span>
                          {post.series && (
                            <>
                              <span>•</span>
                              <Link
                                href={`/series/${post.series.id}`}
                                className="text-blue-600 hover:underline"
                              >
                                {post.series.englishTitle || post.series.title}
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* 統計情報 */}
                      <div className="flex-shrink-0 text-right">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {post._count.likes}
                        </div>
                        <div className="text-sm text-gray-500">
                          <div>👍 いいね</div>
                          <div>💬 {post._count.comments}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 新着シリーズタブ */}
            {activeTab === 'new' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  新着シリーズランキング
                </h2>
                <div className="space-y-4">
                  {newSeries.map((series, index) => (
                    <div key={series.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      {/* ランキング順位 */}
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {index + 1}
                      </div>
                      
                      {/* シリーズ画像 */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-20 bg-gray-200 rounded overflow-hidden">
                          {series.coverImageUrl ? (
                            <Image
                              src={series.coverImageUrl}
                              alt={series.title}
                              width={64}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* シリーズ情報 */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/series/${series.id}`}
                          className="block group"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {series.englishTitle || series.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {series.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{series.publisherName}</span>
                          <span>•</span>
                          <span>{series.status}</span>
                          {series.genres.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{series.genres[0].name}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* 新着情報 */}
                      <div className="flex-shrink-0 text-right">
                        <div className="text-sm text-red-600 font-semibold mb-1">
                          NEW!
                        </div>
                        <div className="text-sm text-gray-500">
                          <div>評価 {series.averageRating.toFixed(1)}</div>
                          <div>レビュー {series.reviewCount}件</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
