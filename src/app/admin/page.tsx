'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// 書籍情報の型定義
type Book = {
  id: number;
  title: string;
  author: string;
  publisherName: string;
  itemCaption: string;
  largeImageUrl: string;
  itemUrl: string;
  isbn: string;
};

export default function AdminPage() {
  // 状態管理: 検索語、ページ番号、ページサイズ、書籍一覧、総件数、ローディング状態
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [items, setItems] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // データ取得処理: 検索条件、ページネーション、ページサイズの変更時に実行
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // APIパラメータを構築（検索語、ページ、ページサイズ）
        const params = new URLSearchParams({
          q,
          page: page.toString(),
          pageSize: pageSize.toString(),
        });
        const res = await fetch(`/api/books?${params.toString()}`);
        const data = await res.json();
        setItems(data.items || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error('Failed to fetch books:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [q, page, pageSize]);

  // 検索実行処理: フォーム送信時にページを1にリセット
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  // 総ページ数を計算
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage manga data and system settings</p>
      </div>

      {/* クイック統計: 4つの主要指標をカード形式で表示 */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {/* 総書籍数 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total Books</p>
              <p className="text-2xl font-semibold text-blue-900">{total}</p>
            </div>
          </div>
        </div>

        {/* シリーズ数（ハードコードされた値、将来的にはAPIから取得） */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Series</p>
              <p className="text-2xl font-semibold text-green-900">7</p>
            </div>
          </div>
        </div>

        {/* 巻数（ハードコードされた値、将来的にはAPIから取得） */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Volumes</p>
              <p className="text-2xl font-semibold text-purple-900">271</p>
            </div>
          </div>
        </div>

        {/* レビュー数（ハードコードされた値、将来的にはAPIから取得） */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-600">Reviews</p>
              <p className="text-2xl font-semibold text-orange-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* クイックアクション: 主要機能へのナビゲーション */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* シリーズ管理へのリンク */}
        <Link
          href="/admin/series"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Manage Series</h3>
              <p className="text-gray-600">View and edit manga series information</p>
            </div>
          </div>
        </Link>

        {/* 検索機能へのリンク */}
        <Link
          href="/search"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Search Manga</h3>
              <p className="text-gray-600">Search through our manga database</p>
            </div>
          </div>
        </Link>

        {/* サイト表示へのリンク */}
        <Link
          href="/"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">View Site</h3>
              <p className="text-gray-600">See how users experience the site</p>
            </div>
          </div>
        </Link>
      </div>

      {/* 書籍管理セクション: Google Books APIからのデータ管理 */}
      <div className="bg-white border rounded-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Books Management</h2>
          <p className="text-gray-600">Manage individual book records from Google Books API</p>
        </div>

        {/* 検索フォーム: タイトル、著者、出版社での検索 */}
        <div className="p-6 border-b">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search books by title, author, or publisher..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* 統計情報表示: 総件数、現在ページ、ページサイズ選択 */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex gap-8 text-sm">
            <div>
              <span className="font-semibold">Total Books:</span> {total}
            </div>
            <div>
              <span className="font-semibold">Page:</span> {page} of {totalPages}
            </div>
            <div>
              <span className="font-semibold">Page Size:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="ml-2 border rounded px-2 py-1"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* ローディング状態の表示 */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        )}

        {/* 書籍一覧の表示 */}
        {!loading && (
          <div className="p-6">
            <div className="space-y-4">
              {items.map((book) => (
                <div key={book.id} className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50">
                  {/* 書籍画像の表示（存在しない場合はプレースホルダー） */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-28 bg-gray-200 rounded overflow-hidden">
                      {book.largeImageUrl ? (
                        <Image
                          src={book.largeImageUrl}
                          alt={book.title}
                          width={80}
                          height={112}
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
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">{book.title}</h3>
                    {/* 著者情報 */}
                    {book.author && (
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Author:</span> {book.author}
                      </p>
                    )}
                    {/* 出版社情報 */}
                    {book.publisherName && (
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Publisher:</span> {book.publisherName}
                      </p>
                    )}
                    {/* ISBN情報 */}
                    {book.isbn && (
                      <p className="text-gray-600 mb-2">
                        <span className="font-medium">ISBN:</span> {book.isbn}
                      </p>
                    )}
                    {/* あらすじ（2行まで表示、オーバーフローは省略） */}
                    {book.itemCaption && (
                      <p className="text-gray-700 text-sm line-clamp-2">{book.itemCaption}</p>
                    )}
                    {/* 外部リンク（Google Books等） */}
                    {book.itemUrl && (
                      <a
                        href={book.itemUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors mt-2"
                      >
                        View Source
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ページネーション: 前後ページ移動、ページ番号選択 */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex justify-center items-center gap-4">
              {/* 前のページボタン */}
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* ページ番号の表示（最大5ページ分、現在ページ周辺を表示） */}
              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 rounded ${
                        pageNum === page
                          ? 'bg-blue-600 text-white'
                          : 'border hover:bg-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              {/* 次のページボタン */}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* 検索結果が0件の場合の表示 */}
        {!loading && items.length === 0 && q && (
          <div className="p-6 text-center">
            <div className="text-gray-400 text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No books found</h3>
            <p className="text-gray-500">
              Try adjusting your search terms or{' '}
              <button
                onClick={() => setQ('')}
                className="text-blue-600 hover:underline"
              >
                clear the search
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
