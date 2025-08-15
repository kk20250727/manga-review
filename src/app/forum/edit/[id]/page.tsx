/**
 * フォーラム投稿編集ページ
 * 
 * 既存のフォーラム投稿を編集する機能：
 * - 投稿内容の編集（タイトル、内容、カテゴリ、タグ）
 * - シリーズの関連付け・変更
 * - 入力値のバリデーション
 * - プレビュー機能
 * - 更新・キャンセル機能
 * 
 * このページは、投稿作成者が自分の投稿を
 * 編集・更新するためのインターフェースを提供します。
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// 型定義
interface Series {
  id: number;
  title: string;
  englishTitle?: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  seriesId?: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
  };
}

export default function ForumPostEditPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  // 状態管理
  const [post, setPost] = useState<Post | null>(null);
  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // フォーム状態
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [seriesId, setSeriesId] = useState<number | ''>('');
  const [showPreview, setShowPreview] = useState(false);

  // 投稿IDの取得
  const postId = params.id as string;

  // データ取得処理
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // 投稿詳細とシリーズ一覧を並行で取得
        const [postResponse, seriesResponse] = await Promise.all([
          fetch(`/api/forum/posts/${postId}`),
          fetch('/api/series?pageSize=100')
        ]);

        if (!postResponse.ok || !seriesResponse.ok) {
          throw new Error('データの取得に失敗しました');
        }

        const postData = await postResponse.json();
        const seriesData = await seriesResponse.json();

        // 投稿データの設定
        setPost(postData);
        setTitle(postData.title);
        setContent(postData.content);
        setCategory(postData.category);
        setTags(postData.tags.join(', '));
        setSeriesId(postData.seriesId || '');
        
        // シリーズデータの設定
        setSeries(seriesData.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      fetchData();
    }
  }, [postId]);

  // 投稿更新処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // バリデーション
    if (!title.trim() || !content.trim() || !category) {
      setError('タイトル、内容、カテゴリは必須です');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      // タグを配列に変換
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const response = await fetch(`/api/forum/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          tags: tagArray,
          seriesId: seriesId || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '投稿の更新に失敗しました');
      }

      // 更新成功後、投稿詳細ページにリダイレクト
      router.push(`/forum/${postId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ローディング状態の表示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // エラー状態の表示
  if (error && !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error}
            </h1>
            <Link
              href="/forum"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              フォーラム一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 投稿が見つからない場合
  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              投稿が見つかりません
            </h1>
            <Link
              href="/forum"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              フォーラム一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 権限チェック
  if (user?.id !== post.user.id) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              投稿の編集権限がありません
            </h1>
            <Link
              href={`/forum/${postId}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              投稿詳細に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            投稿を編集
          </h1>
          <p className="text-gray-600">
            投稿の内容を編集して更新できます
          </p>
        </div>

        {/* 編集フォーム */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit}>
            {/* エラーメッセージ */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* タイトル入力 */}
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                タイトル *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="投稿のタイトルを入力してください"
                required
              />
            </div>

            {/* カテゴリ選択 */}
            <div className="mb-6">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ *
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">カテゴリを選択してください</option>
                <option value="Discussion">Discussion（議論）</option>
                <option value="Review">Review（レビュー）</option>
                <option value="Question">Question（質問）</option>
                <option value="News">News（ニュース）</option>
                <option value="Fan Art">Fan Art（ファンアート）</option>
              </select>
            </div>

            {/* シリーズ選択 */}
            <div className="mb-6">
              <label htmlFor="series" className="block text-sm font-medium text-gray-700 mb-2">
                関連シリーズ（オプション）
              </label>
              <select
                id="series"
                value={seriesId}
                onChange={(e) => setSeriesId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">シリーズを選択してください</option>
                {series.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.englishTitle || s.title}
                  </option>
                ))}
              </select>
            </div>

            {/* タグ入力 */}
            <div className="mb-6">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                タグ（カンマ区切り）
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例: アクション, ファンタジー, おすすめ"
              />
              <p className="mt-1 text-sm text-gray-500">
                複数のタグはカンマ（,）で区切って入力してください
              </p>
            </div>

            {/* 内容入力 */}
            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                内容 *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="投稿の内容を入力してください"
                required
              />
            </div>

            {/* アクションボタン */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {showPreview ? 'プレビューを隠す' : 'プレビューを表示'}
                </button>
                
                <Link
                  href={`/forum/${postId}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  キャンセル
                </Link>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '更新中...' : '投稿を更新'}
              </button>
            </div>
          </form>
        </div>

        {/* プレビュー表示 */}
        {showPreview && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              プレビュー
            </h2>
            
            <div className="border rounded-lg p-4">
              {/* カテゴリとタグ */}
              <div className="flex items-center space-x-3 mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  category === 'Discussion' ? 'bg-blue-100 text-blue-800' :
                  category === 'Review' ? 'bg-green-100 text-green-800' :
                  category === 'Question' ? 'bg-yellow-100 text-yellow-800' :
                  category === 'News' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {category || 'カテゴリ未選択'}
                </span>
                
                {seriesId && series.find(s => s.id === seriesId) && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {series.find(s => s.id === seriesId)?.englishTitle || series.find(s => s.id === seriesId)?.title}
                  </span>
                )}
              </div>
              
              {/* タイトル */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {title || 'タイトル未入力'}
              </h3>
              
              {/* タグ */}
              {tags && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.split(',').map((tag, index) => (
                    tag.trim() && (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag.trim()}
                      </span>
                    )
                  ))}
                </div>
              )}
              
              {/* 内容 */}
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {content || '内容が入力されていません'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
