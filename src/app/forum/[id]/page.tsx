/**
 * フォーラム投稿詳細ページ
 * 
 * 個別のフォーラム投稿の詳細表示とコメント機能：
 * - 投稿の詳細情報（タイトル、内容、作成者、作成日時）
 * - コメントの表示と投稿機能
 * - 関連投稿の表示
 * - 投稿の編集・削除（作成者のみ）
 * - いいね・ブックマーク機能
 * 
 * このページは、ユーザーが特定の投稿について
 * 詳細に議論し、コメントを通じてコミュニティと
 * 交流できる場を提供します。
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// 型定義
interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
}

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    avatarUrl?: string;
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

export default function ForumPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  // 状態管理
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 投稿IDの取得
  const postId = params.id as string;

  // データ取得処理
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setIsLoading(true);
        
        // 投稿詳細とコメントを並行で取得
        const [postResponse, commentsResponse] = await Promise.all([
          fetch(`/api/forum/posts/${postId}`),
          fetch(`/api/forum/posts/${postId}/comments`)
        ]);

        if (!postResponse.ok || !commentsResponse.ok) {
          throw new Error('投稿の取得に失敗しました');
        }

        const postData = await postResponse.json();
        const commentsData = await commentsResponse.json();

        setPost(postData);
        setComments(commentsData.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      fetchPostData();
    }
  }, [postId]);

  // コメント投稿処理
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/forum/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('コメントの投稿に失敗しました');
      }

      const commentData = await response.json();
      
      // 新しいコメントを先頭に追加
      setComments(prev => [commentData, ...prev]);
      
      // フォームをリセット
      setNewComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 投稿の削除処理
  const handleDeletePost = async () => {
    if (!confirm('この投稿を削除しますか？この操作は取り消せません。')) {
      return;
    }

    try {
      const response = await fetch(`/api/forum/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('投稿の削除に失敗しました');
      }

      // フォーラム一覧ページにリダイレクト
      router.push('/forum');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  // ローディング状態の表示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // エラー状態の表示
  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || '投稿が見つかりません'}
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 投稿詳細セクション */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* 投稿ヘッダー */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {/* カテゴリタグ */}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  post.category === 'Discussion' ? 'bg-blue-100 text-blue-800' :
                  post.category === 'Review' ? 'bg-green-100 text-green-800' :
                  post.category === 'Question' ? 'bg-yellow-100 text-yellow-800' :
                  post.category === 'News' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {post.category}
                </span>
                
                {/* シリーズ情報 */}
                {post.series && (
                  <Link
                    href={`/series/${post.series.id}`}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                  >
                    {post.series.englishTitle || post.series.title}
                  </Link>
                )}
              </div>
              
              {/* タイトル */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>
              
              {/* 作成者情報と作成日時 */}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  {/* アバター */}
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    {post.user.avatarUrl ? (
                      <img
                        src={post.user.avatarUrl}
                        alt={post.user.username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-gray-600 font-semibold">
                        {post.user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-gray-900">
                    {post.user.username}
                  </span>
                </div>
                
                <span>•</span>
                <time dateTime={post.createdAt}>
                  {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                </time>
                
                {post.updatedAt !== post.createdAt && (
                  <>
                    <span>•</span>
                    <span className="text-gray-400">
                      編集済み
                    </span>
                  </>
                )}
              </div>
            </div>
            
            {/* アクションボタン（作成者のみ） */}
            {user && user.id === post.user.id && (
              <div className="flex items-center space-x-2">
                <Link
                  href={`/forum/edit/${post.id}`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  編集
                </Link>
                <button
                  onClick={handleDeletePost}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  削除
                </button>
              </div>
            )}
          </div>
          
          {/* 投稿内容 */}
          <div className="prose max-w-none mb-6">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {post.content}
            </div>
          </div>
          
          {/* タグ */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* 統計情報 */}
          <div className="flex items-center space-x-6 text-sm text-gray-500 border-t pt-4">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post._count.comments} コメント</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{post._count.likes} いいね</span>
            </div>
          </div>
        </div>

        {/* コメントセクション */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            コメント ({comments.length})
          </h2>
          
          {/* コメント投稿フォーム */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="mb-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="コメントを入力してください..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '投稿中...' : 'コメントを投稿'}
              </button>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-md">
              <p className="text-gray-600 mb-2">
                コメントを投稿するにはログインが必要です
              </p>
              <Link
                href="/auth/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ログインする
              </Link>
            </div>
          )}
          
          {/* コメント一覧 */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                まだコメントがありません。最初のコメントを投稿してみませんか？
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    {/* アバター */}
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      {comment.user.avatarUrl ? (
                        <img
                          src={comment.user.avatarUrl}
                          alt={comment.user.username}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <span className="text-gray-600 font-semibold text-sm">
                          {comment.user.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    {/* コメント内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {comment.user.username}
                        </span>
                        <time className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString('ja-JP')}
                        </time>
                      </div>
                      <div className="text-gray-700 whitespace-pre-wrap">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* 戻るボタン */}
        <div className="mt-8 text-center">
          <Link
            href="/forum"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            フォーラム一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
