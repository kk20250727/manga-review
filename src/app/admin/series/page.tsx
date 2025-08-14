'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// シリーズの巻情報の型定義
type SeriesVolume = {
  id: number;
  title: string;
  volumeNumber: number | null;
  isbn: string | null;
  imageUrl: string;
  itemUrl: string;
};

// シリーズの著者情報の型定義
type SeriesCreator = {
  role: string;
  creator: {
    name: string;
  };
};

// シリーズの別名タイトルの型定義
type SeriesAlias = {
  id: number;
  alias: string;
  lang: string | null;
};

// シリーズ情報の型定義
type Series = {
  id: number;
  title: string;
  englishTitle: string;
  romajiTitle: string;
  description: string;
  coverImageUrl: string;
  publisherName: string;
  volumes: SeriesVolume[];
  creators: SeriesCreator[];
  aliases: SeriesAlias[];
};

export default function SeriesAdminPage() {
  // 状態管理: 検索語、ページ番号、ページサイズ、シリーズ一覧、総件数、ローディング状態
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [items, setItems] = useState<Series[]>([]);
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
        const res = await fetch(`/api/series?${params.toString()}`);
        const data = await res.json();
        setItems(data.items || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error('Failed to fetch series:', error);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Series Management</h1>
        <Link
          href="/admin"
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          Back to Admin
        </Link>
      </div>

      {/* 検索フォーム: タイトル、説明、出版社での検索 */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search series by title, description, or publisher..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* 統計情報表示: 総件数、現在ページ、ページサイズ選択 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex gap-8 text-sm">
          <div>
            <span className="font-semibold">Total Series:</span> {total}
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

      {/* シリーズ一覧の表示 */}
      {!loading && (
        <div className="space-y-6">
          {items.map((series) => (
            <div key={series.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-6">
                {/* 表紙画像の表示（存在しない場合はプレースホルダー） */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-48 bg-gray-200 rounded overflow-hidden">
                    {series.coverImageUrl ? (
                      <Image
                        src={series.coverImageUrl}
                        alt={series.title}
                        width={128}
                        height={192}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No Cover
                      </div>
                    )}
                  </div>
                </div>

                {/* シリーズ情報の表示 */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      {/* タイトル（詳細ページへのリンク付き） */}
                      <h2 className="text-2xl font-bold text-blue-600 mb-2">
                        <Link href={`/series/${series.id}`} className="hover:underline">
                          {series.title}
                        </Link>
                      </h2>
                      {/* 英語タイトルとローマ字タイトル（存在する場合のみ） */}
                      {series.englishTitle && (
                        <div className="text-lg text-gray-600 mb-1">{series.englishTitle}</div>
                      )}
                      {series.romajiTitle && (
                        <div className="text-lg text-gray-500 mb-1">{series.romajiTitle}</div>
                      )}
                      {series.publisherName && (
                        <div className="text-sm text-gray-500">{series.publisherName}</div>
                      )}
                    </div>
                    {/* シリーズIDの表示 */}
                    <div className="text-right">
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        #{series.id}
                      </div>
                    </div>
                  </div>

                  {/* シリーズの説明文（3行まで表示、オーバーフローは省略） */}
                  {series.description && (
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {series.description}
                    </p>
                  )}

                  {/* 詳細情報のグリッド表示（巻、著者、別名） */}
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* 巻一覧（最初の3巻のみ表示、残りは件数表示） */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Volumes ({series.volumes.length})</h3>
                      <div className="space-y-2">
                        {series.volumes.slice(0, 3).map((volume) => (
                          <div key={volume.id} className="text-sm text-gray-600">
                            {volume.volumeNumber && `#${volume.volumeNumber}: `}
                            {volume.title}
                          </div>
                        ))}
                        {series.volumes.length > 3 && (
                          <div className="text-sm text-gray-400">
                            +{series.volumes.length - 3} more...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 著者情報 */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Creators ({series.creators.length})</h3>
                      <div className="space-y-1">
                        {series.creators.map((creator, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            {creator.creator.name} ({creator.role})
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 別名タイトル（最初の3件のみ表示、残りは件数表示） */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Alternative Titles ({series.aliases.length})</h3>
                      <div className="space-y-1">
                        {series.aliases.slice(0, 3).map((alias) => (
                          <div key={alias.id} className="text-sm text-gray-600">
                            {alias.alias}
                          </div>
                        ))}
                        {series.aliases.length > 3 && (
                          <div className="text-sm text-gray-400">
                            +{series.aliases.length - 3} more...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* アクションボタン: 詳細表示、編集 */}
                  <div className="flex gap-3 mt-6">
                    <Link
                      href={`/series/${series.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      View Details
                    </Link>
                    <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors text-sm">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ページネーション: 前後ページ移動、ページ番号選択 */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          {/* 前のページボタン */}
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      : 'border hover:bg-gray-50'
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
            className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* 検索結果が0件の場合の表示 */}
      {!loading && items.length === 0 && q && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No series found</h3>
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
  );
}
