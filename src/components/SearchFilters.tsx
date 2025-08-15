/**
 * 検索フィルターコンポーネント
 * 
 * ジャンル・タグによる高度な検索フィルタリング機能を提供：
 * - ジャンルの複数選択
 * - タグのカテゴリ別フィルタリング
 * - 検索条件の状態管理
 * - フィルターのリセット機能
 * - レスポンシブデザイン
 * 
 * このコンポーネントは、サイト内検索時に表示され、
 * ユーザーがより精密な検索条件を設定できるようにします。
 * フィルターの変更は自動的に検索を実行し、
 * アクティブなフィルターを視覚的に表示します。
 */

'use client';

import { useState, useEffect } from 'react';

// フィルター条件の型定義
export interface SearchFilters {
  genres: number[];
  tags: number[];
  status: string[];
  ageRating: string[];
  publisher: string[];
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onReset: () => void;
}

// ジャンルの型定義
interface Genre {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  seriesCount: number;
}

// タグの型定義
interface Tag {
  id: number;
  name: string;
  category?: string;
  seriesCount: number;
}

// カテゴリ別タグの型定義
interface CategoryTags {
  [category: string]: Tag[];
}

export default function SearchFilters({ filters, onFiltersChange, onReset }: SearchFiltersProps) {
  // 状態管理
  const [genres, setGenres] = useState<Genre[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [categoryTags, setCategoryTags] = useState<CategoryTags>({});
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // コンポーネントマウント時にジャンル・タグ情報を取得
  useEffect(() => {
    fetchFiltersData();
  }, []);

  /**
   * フィルターデータの取得
   * ジャンルとタグの情報を並行で取得
   */
  const fetchFiltersData = async () => {
    try {
      setLoading(true);
      
      // ジャンルとタグを並行で取得
      const [genresRes, tagsRes] = await Promise.all([
        fetch('/api/genres?sortBy=seriesCount&order=desc'),
        fetch('/api/tags?sortBy=seriesCount&order=desc')
      ]);

      if (genresRes.ok && tagsRes.ok) {
        const genresData = await genresRes.json();
        const tagsData = await tagsRes.json();
        
        setGenres(genresData.items || []);
        setTags(tagsData.items || []);

        // タグをカテゴリ別にグループ化
        const grouped = tagsData.items.reduce((acc: CategoryTags, tag: Tag) => {
          const category = tag.category || 'Other';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(tag);
          return acc;
        }, {});

        setCategoryTags(grouped);
      }
    } catch (error) {
      console.error('Failed to fetch filters data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ジャンルの選択状態を切り替え
   * @param genreId ジャンルID
   */
  const toggleGenre = (genreId: number) => {
    const newGenres = filters.genres.includes(genreId)
      ? filters.genres.filter(id => id !== genreId)
      : [...filters.genres, genreId];
    
    onFiltersChange({ ...filters, genres: newGenres });
  };

  /**
   * タグの選択状態を切り替え
   * @param tagId タグID
   */
  const toggleTag = (tagId: number) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter(id => id !== tagId)
      : [...filters.tags, tagId];
    
    onFiltersChange({ ...filters, tags: newTags });
  };

  /**
   * 連載状況の選択状態を切り替え
   * @param status 連載状況
   */
  const toggleStatus = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    
    onFiltersChange({ ...filters, status: newStatus });
  };

  /**
   * 年齢制限の選択状態を切り替え
   * @param rating 年齢制限
   */
  const toggleAgeRating = (rating: string) => {
    const newRating = filters.ageRating.includes(rating)
      ? filters.ageRating.filter(r => r !== rating)
      : [...filters.ageRating, rating];
    
    onFiltersChange({ ...filters, ageRating: newRating });
  };

  /**
   * フィルターのリセット
   * 全ての選択状態をクリア
   */
  const handleReset = () => {
    onReset();
  };

  // ローディング状態の表示
  if (loading) {
    return (
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading filters...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg mb-6">
      {/* フィルターヘッダー */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Search Filters</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
            <button
              onClick={handleReset}
              className="text-sm text-gray-600 hover:text-gray-700 px-3 py-1 border rounded hover:bg-gray-50"
            >
              Reset All
            </button>
          </div>
        </div>
      </div>

      {/* フィルター内容 */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* ジャンルフィルター */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Genres</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {genres.map((genre) => (
                <label key={genre.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.genres.includes(genre.id)}
                    onChange={() => toggleGenre(genre.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 flex items-center">
                    {genre.icon && <span className="mr-1">{genre.icon}</span>}
                    {genre.name}
                    <span className="ml-1 text-gray-500 text-xs">({genre.seriesCount})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* タグフィルター（カテゴリ別） */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Tags</h4>
            {Object.entries(categoryTags).map(([category, categoryTags]) => (
              <div key={category} className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">{category}</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {categoryTags.map((tag) => (
                    <label key={tag.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.tags.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {tag.name}
                        <span className="ml-1 text-gray-500 text-xs">({tag.seriesCount})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 連載状況フィルター */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Status</h4>
            <div className="flex flex-wrap gap-2">
              {['連載中', '完結', '休載'].map((status) => (
                <label key={status} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={() => toggleStatus(status)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 年齢制限フィルター */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Age Rating</h4>
            <div className="flex flex-wrap gap-2">
              {['全年齢', 'R15', 'R18'].map((rating) => (
                <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.ageRating.includes(rating)}
                    onChange={() => toggleAgeRating(rating)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{rating}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 選択されたフィルターの表示 */}
          {(filters.genres.length > 0 || filters.tags.length > 0 || filters.status.length > 0 || filters.ageRating.length > 0) && (
            <div className="pt-4 border-t">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h5>
              <div className="flex flex-wrap gap-2">
                {filters.genres.map((genreId) => {
                  const genre = genres.find(g => g.id === genreId);
                  return genre ? (
                    <span
                      key={`genre-${genreId}`}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {genre.icon} {genre.name}
                      <button
                        onClick={() => toggleGenre(genreId)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
                {filters.tags.map((tagId) => {
                  const tag = tags.find(t => t.id === tagId);
                  return tag ? (
                    <span
                      key={`tag-${tagId}`}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                    >
                      {tag.name}
                      <button
                        onClick={() => toggleTag(tagId)}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
                {filters.status.map((status) => (
                  <span
                    key={`status-${status}`}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800"
                  >
                    {status}
                    <button
                      onClick={() => toggleStatus(status)}
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {filters.ageRating.map((rating) => (
                  <span
                    key={`rating-${rating}`}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800"
                  >
                    {rating}
                    <button
                      onClick={() => toggleAgeRating(rating)}
                      className="ml-1 text-orange-600 hover:text-orange-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
