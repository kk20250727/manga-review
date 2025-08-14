'use client';

import { useState } from 'react';
import { searchRakutenBooks } from '../../lib/rakuten.js';
import Link from 'next/link';

export default function SearchPage() {
  // 検索状態管理: 検索語、検索モード（Google Books API または サイト内インデックス）、結果、ローディング状態
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState('google'); // 'google' or 'site'
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 検索実行処理: モードに応じて異なるAPIを呼び出し
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      let res;
      if (searchMode === 'google') {
        // Google Books APIを使用した外部検索（広範囲の書籍情報）
        res = await searchRakutenBooks(searchTerm);
        setResults(res);
      } else {
        // サイト内のMeilisearchインデックスを使用した内部検索（レビュー・評価付き）
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        res = data.items || [];
        setResults(res);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Enterキーでの検索実行
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Search Manga</h1>
        <p className="text-xl text-gray-600">Find your next favorite series</p>
      </div>

      {/* 検索モード切り替えタブ: Google Books API vs サイト内インデックス */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setSearchMode('google')}
            className={`px-4 py-2 rounded-md transition-colors ${
              searchMode === 'google'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Google Books API
          </button>
          <button
            onClick={() => setSearchMode('site')}
            className={`px-4 py-2 rounded-md transition-colors ${
              searchMode === 'site'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            サイト内インデックス
          </button>
        </div>
      </div>

      {/* 検索入力フォーム */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter manga title, author, or series..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        {/* 検索モードの説明文 */}
        <p className="text-sm text-gray-500 mt-2 text-center">
          {searchMode === 'google' 
            ? 'Search through Google Books database for manga information'
            : 'Search through our curated manga database with reviews and ratings'
          }
        </p>
      </div>

      {/* ローディング状態の表示 */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">検索中...</p>
        </div>
      )}

      {/* 検索結果の表示 */}
      {!isLoading && results.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">
            Search Results ({results.length})
          </h2>
          <div className="grid gap-6">
            {results.map((item, index) => (
              <div key={index} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex gap-6">
                  {/* 書籍画像の表示（存在しない場合はプレースホルダー） */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-32 bg-gray-200 rounded overflow-hidden">
                      {item.largeImageUrl ? (
                        <img
                          src={item.largeImageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 書籍情報の表示 */}
                  <div className="flex-1">
                    {/* タイトル（サイト内検索の場合は詳細ページへのリンク） */}
                    <h3 className="text-xl font-semibold mb-2 text-blue-600">
                      {searchMode === 'site' && item.type === 'series' ? (
                        <Link href={`/series/${item.id}`} className="hover:underline">
                          {item.title}
                        </Link>
                      ) : (
                        item.title
                      )}
                    </h3>
                    
                    {/* 著者情報 */}
                    {item.author && (
                      <p className="text-gray-600 mb-2">
                        <span className="font-medium">Author:</span> {item.author}
                      </p>
                    )}
                    
                    {/* 出版社情報 */}
                    {item.publisherName && (
                      <p className="text-gray-600 mb-2">
                        <span className="font-medium">Publisher:</span> {item.publisherName}
                      </p>
                    )}
                    
                    {/* 説明文（Google Books API） */}
                    {item.description && (
                      <p className="text-gray-700 mb-3 line-clamp-3">
                        {item.description}
                      </p>
                    )}
                    
                    {/* あらすじ（Google Books API） */}
                    {item.itemCaption && (
                      <p className="text-gray-700 mb-3 line-clamp-3">
                        {item.itemCaption}
                      </p>
                    )}

                    {/* サイト内検索結果の追加情報（巻数、著者数） */}
                    {searchMode === 'site' && item.type === 'series' && (
                      <div className="flex gap-4 text-sm text-gray-500">
                        {item.volumes && (
                          <span>{item.volumes.length} volumes</span>
                        )}
                        {item.creators && item.creators.length > 0 && (
                          <span>{item.creators.length} creators</span>
                        )}
                      </div>
                    )}

                    {/* 外部リンク（Google Books API） */}
                    {item.itemUrl && (
                      <a
                        href={item.itemUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        View Details
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 検索結果が0件の場合の表示 */}
      {!isLoading && results.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No results found</h3>
          <p className="text-gray-500">
            Try adjusting your search terms or browse our{' '}
            <Link href="/admin/series" className="text-blue-600 hover:underline">
              complete series list
            </Link>
          </p>
        </div>
      )}

      {/* 初期状態（検索前）の表示 */}
      {!isLoading && results.length === 0 && !searchTerm && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Ready to discover?</h3>
          <p className="text-gray-500 mb-6">
            Enter a manga title, author, or series name to get started
          </p>
          {/* 人気検索キーワードのサジェスト */}
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">ONE PIECE</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">進撃の巨人</span>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">キングダム</span>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">呪術廻戦</span>
          </div>
        </div>
      )}
    </div>
  );
}
