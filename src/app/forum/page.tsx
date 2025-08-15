/**
 * フォーラムメインページ
 * 
 * コミュニティ機能のメインページ：
 * - シリーズ別ディスカッション一覧
 * - 人気の投稿・新着投稿
 * - フォーラム検索機能
 * - 新規投稿作成
 * - カテゴリ別フィルタリング
 * 
 * このページは、ユーザーがマンガについて議論し、情報を共有できる
 * コミュニティハブとして機能します。投稿の検索、閲覧、作成が可能です。
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

// フォーラム投稿の型定義
interface ForumPost {
  id: number;
  title: string;
  content: string;
  author: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
  series?: {
    id: number;
    title: string;
    coverImageUrl?: string;
  };
  category: string;
  commentCount: number;
  likeCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

// シリーズ別フォーラムの型定義
interface SeriesForum {
  seriesId: number;
  seriesTitle: string;
  seriesCoverImageUrl?: string;
  postCount: number;
  lastPost?: {
    title: string;
    author: string;
    createdAt: string;
  };
}

export default function ForumPage() {
  // 認証コンテキスト
  const { user } = useAuth();

  // 状態管理
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [seriesForums, setSeriesForums] = useState<SeriesForum[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent'); // recent, popular, series
  const [searchTerm, setSearchTerm] = useState('');

  // コンポーネントマウント時の処理
  useEffect(() => {
    fetchForumData();
  }, []);

  /**
   * フォーラムデータの取得
   * 投稿とシリーズ別フォーラム情報を並行で取得
   */
  const fetchForumData = async () => {
    try {
      setLoading(true);
      
      // 並行でデータを取得
      const [postsRes, seriesRes] = await Promise.all([
        fetch('/api/forum/posts?limit=10'),
        fetch('/api/forum/series')
      ]);

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.items || []);
      }

      if (seriesRes.ok) {
        const seriesData = await seriesRes.json();
        setSeriesForums(seriesData.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch forum data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 投稿検索の実行
   */
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      const response = await fetch(`/api/forum/posts?q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      setPosts(data.items || []);
      setActiveTab('search');
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // ローディング状態の表示
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading forum...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Manga Community Forum</h1>
        <p className="text-xl text-gray-600">Discuss your favorite series with fellow fans</p>
      </div>

      {/* 検索・投稿作成バー */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* 検索フォーム */}
          <div className="flex-1 w-full">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search discussions..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* 新規投稿作成ボタン */}
          {user && (
            <Link
              href="/forum/create"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              Create Post
            </Link>
          )}
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white border rounded-lg mb-6">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'recent', label: 'Recent Posts', icon: '🕒' },
              { id: 'popular', label: 'Popular', icon: '🔥' },
              { id: 'series', label: 'Series Forums', icon: '📚' }
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
          {/* 新着投稿タブ */}
          {activeTab === 'recent' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Discussions</h3>
              {posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="bg-gray-50 border rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start space-x-4">
                        {/* シリーズ画像 */}
                        {post.series?.coverImageUrl && (
                          <div className="flex-shrink-0">
                            <Image
                              src={post.series.coverImageUrl}
                              alt={post.series.title}
                              width={60}
                              height={80}
                              className="rounded"
                            />
                          </div>
                        )}

                        {/* 投稿内容 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              <Link href={`/forum/${post.id}`} className="hover:text-blue-600">
                                {post.title}
                              </Link>
                            </h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              post.category === 'Discussion' ? 'bg-blue-100 text-blue-800' :
                              post.category === 'Review' ? 'bg-green-100 text-green-800' :
                              post.category === 'Question' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {post.category}
                            </span>
                          </div>

                          {post.series && (
                            <p className="text-sm text-gray-600 mb-2">
                              Series: <Link href={`/series/${post.series.id}`} className="text-blue-600 hover:underline">
                                {post.series.title}
                              </Link>
                            </p>
                          )}

                          <p className="text-gray-700 mb-3 line-clamp-2">{post.content}</p>

                          {/* 投稿メタ情報 */}
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <span>By {post.author.username}</span>
                              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span>💬 {post.commentCount}</span>
                              <span>👍 {post.likeCount}</span>
                              <span>👁️ {post.viewCount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No posts found.</p>
                  {user && (
                    <Link href="/forum/create" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
                      Start the first discussion
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 人気投稿タブ */}
          {activeTab === 'popular' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Popular Discussions</h3>
              <div className="text-center py-8">
                <p className="text-gray-500">Popular posts feature coming soon!</p>
              </div>
            </div>
          )}

          {/* シリーズ別フォーラムタブ */}
          {activeTab === 'series' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Series Forums</h3>
              {seriesForums.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {seriesForums.map((forum) => (
                    <div key={forum.seriesId} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="w-full h-32 bg-gray-200">
                        {forum.seriesCoverImageUrl ? (
                          <Image
                            src={forum.seriesCoverImageUrl}
                            alt={forum.seriesTitle}
                            width={300}
                            height={128}
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
                          <Link href={`/forum/series/${forum.seriesId}`} className="hover:text-blue-600">
                            {forum.seriesTitle}
                          </Link>
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {forum.postCount} discussions
                        </p>
                        {forum.lastPost && (
                          <div className="text-xs text-gray-500">
                            <p className="truncate">{forum.lastPost.title}</p>
                            <p>by {forum.lastPost.author} • {new Date(forum.lastPost.createdAt).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No series forums found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* コミュニティガイドライン */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Community Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">✅ Be Respectful</h4>
            <p>Treat all members with kindness and respect. No harassment or hate speech.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">📚 Stay On Topic</h4>
            <p>Keep discussions related to manga, anime, and related content.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">🚫 No Spoilers</h4>
            <p>Use spoiler tags for content that hasn't been officially released in your region.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">💬 Constructive Discussion</h4>
            <p>Share opinions respectfully and engage in meaningful conversations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
