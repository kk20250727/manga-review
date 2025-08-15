/**
 * フォーラム投稿作成ページ
 * 
 * 新規フォーラム投稿の作成：
 * - シリーズ選択（オプション）
 * - カテゴリ選択（Discussion, Review, Question）
 * - タイトル・内容入力
 * - タグ設定
 * - プレビュー機能
 * - 投稿保存
 * 
 * このページでは、ユーザーがマンガコミュニティに投稿を作成できます。
 * シリーズに関連した投稿や、一般的な議論、質問、レビューなど、
 * 様々なカテゴリの投稿に対応しています。
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

// シリーズ情報の型定義
interface Series {
  id: number;
  title: string;
  coverImageUrl?: string;
}

// 投稿データの型定義
interface PostData {
  title: string;
  content: string;
  seriesId?: number;
  category: string;
  tags: string[];
}

export default function CreatePostPage() {
  // ルーターと認証コンテキスト
  const router = useRouter();
  const { user } = useAuth();

  // 状態管理
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [postData, setPostData] = useState<PostData>({
    title: '',
    content: '',
    seriesId: undefined,
    category: 'Discussion',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  // カテゴリオプション
  const categories = [
    { value: 'Discussion', label: 'Discussion', description: 'General discussion about manga, anime, or series' },
    { value: 'Review', label: 'Review', description: 'Share your thoughts and opinions about a series or volume' },
    { value: 'Question', label: 'Question', description: 'Ask questions about series, characters, or plot points' },
    { value: 'News', label: 'News', description: 'Share news, announcements, or updates' },
    { value: 'Fan Art', label: 'Fan Art', description: 'Share your manga-inspired artwork or creations' }
  ];

  // コンポーネントマウント時の処理
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    fetchSeries();
  }, [user, router]);

  /**
   * シリーズ一覧の取得
   */
  const fetchSeries = async () => {
    try {
      const response = await fetch('/api/series?limit=100');
      if (response.ok) {
        const data = await response.json();
        setSeries(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch series:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * タグの追加
   */
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !postData.tags.includes(tag) && postData.tags.length < 5) {
      setPostData({ ...postData, tags: [...postData.tags, tag] });
      setTagInput('');
    }
  };

  /**
   * タグの削除
   */
  const removeTag = (tagToRemove: string) => {
    setPostData({
      ...postData,
      tags: postData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  /**
   * フォームの検証
   */
  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!postData.title.trim()) {
      newErrors.push('Title is required');
    } else if (postData.title.length < 10) {
      newErrors.push('Title must be at least 10 characters long');
    } else if (postData.title.length > 200) {
      newErrors.push('Title must be less than 200 characters');
    }

    if (!postData.content.trim()) {
      newErrors.push('Content is required');
    } else if (postData.content.length < 50) {
      newErrors.push('Content must be at least 50 characters long');
    } else if (postData.content.length > 10000) {
      newErrors.push('Content must be less than 10,000 characters');
    }

    if (!postData.category) {
      newErrors.push('Category is required');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  /**
   * 投稿の保存
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/forum/post/${data.post.id}`);
      } else {
        const errorData = await response.json();
        setErrors([errorData.error || 'Failed to create post']);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      setErrors(['An unexpected error occurred']);
    } finally {
      setSubmitting(false);
    }
  };

  // ローディング状態の表示
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // ユーザーが存在しない場合
  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
            <p className="text-gray-600 mt-2">Share your thoughts with the manga community</p>
          </div>
          <Link
            href="/forum"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Forum
          </Link>
        </div>
      </div>

      {/* エラーメッセージ */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h3>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 投稿作成フォーム */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* シリーズ選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Series (Optional)
          </label>
          <select
            value={postData.seriesId || ''}
            onChange={(e) => setPostData({
              ...postData,
              seriesId: e.target.value ? parseInt(e.target.value) : undefined
            })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No specific series</option>
            {series.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Select a series if your post is specifically about it
          </p>
        </div>

        {/* カテゴリ選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((category) => (
              <label
                key={category.value}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  postData.category === category.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={category.value}
                  checked={postData.category === category.value}
                  onChange={(e) => setPostData({
                    ...postData,
                    category: e.target.value
                  })}
                  className="sr-only"
                />
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      postData.category === category.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {postData.category === category.value && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{category.label}</div>
                    <div className="text-sm text-gray-500">{category.description}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* タイトル入力 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={postData.title}
            onChange={(e) => setPostData({ ...postData, title: e.target.value })}
            placeholder="Enter a descriptive title for your post..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={200}
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>Be specific and engaging</span>
            <span>{postData.title.length}/200</span>
          </div>
        </div>

        {/* 内容入力 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            value={postData.content}
            onChange={(e) => setPostData({ ...postData, content: e.target.value })}
            placeholder="Share your thoughts, questions, or reviews..."
            rows={12}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            maxLength={10000}
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>Use markdown for formatting</span>
            <span>{postData.content.length}/10,000</span>
          </div>
        </div>

        {/* タグ設定 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (Optional)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add tags to help others find your post..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addTag}
              disabled={!tagInput.trim() || postData.tags.length >= 5}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
          
          {/* タグ一覧 */}
          {postData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {postData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          
          <p className="text-sm text-gray-500 mt-1">
            Add up to 5 tags to help categorize your post
          </p>
        </div>

        {/* 投稿プレビュー */}
        {postData.title && postData.content && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Preview</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900">{postData.title}</h4>
                {postData.category && (
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    postData.category === 'Discussion' ? 'bg-blue-100 text-blue-800' :
                    postData.category === 'Review' ? 'bg-green-100 text-green-800' :
                    postData.category === 'Question' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {postData.category}
                  </span>
                )}
              </div>
              <p className="text-gray-700 line-clamp-3">{postData.content}</p>
              {postData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {postData.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 投稿ボタン */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Link
            href="/forum"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>

      {/* 投稿ガイドライン */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Posting Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">📝 Quality Content</h4>
            <p>Write clear, engaging posts that contribute to meaningful discussions.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">🏷️ Use Tags</h4>
            <p>Add relevant tags to help others discover your content.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">🚫 No Spoilers</h4>
            <p>Use spoiler warnings for content that hasn't been officially released.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">💬 Be Respectful</h4>
            <p>Share opinions constructively and respect different viewpoints.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
