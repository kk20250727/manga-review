'use client';

import React, { useState, useEffect } from 'react';
import { getMangaCoverImage, getCachedImage } from '@/lib/manga-images';
import ReviewModal from '@/components/ReviewModal';
import Link from 'next/link';
import { MangaDetails } from '@/lib/manga-data';
import { useTheme } from '@/contexts/ThemeContext';

interface MangaDetailClientProps {
  manga: MangaDetails;
}

const MangaDetailClient: React.FC<MangaDetailClientProps> = ({ manga }) => {
  // テーマコンテキストを使用
  const { isDarkMode } = useTheme();
  
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userLists, setUserLists] = useState({
    wantToRead: false,
    currentlyReading: false,
    completed: false,
    dropped: false
  });

  useEffect(() => {
    // 画像を取得（キャッシュ優先）
    const loadImage = async () => {
      try {
        // まずキャッシュから画像を取得
        const cacheKey = `manga-image:${manga.title}:${manga.author}`;
        const cachedImage = getCachedImage(cacheKey);
        
        if (cachedImage) {
          console.log(`📸 キャッシュから画像を取得: ${manga.title}`);
          setImageUrl(cachedImage);
          setLoading(false);
          return;
        }

        // キャッシュにない場合はAPIから取得
        console.log(`🔄 APIから画像を取得: ${manga.title}`);
        const url = await getMangaCoverImage(manga.title, manga.author, false);
        setImageUrl(url);
      } catch (error) {
        console.error('Error loading image:', error);
        setImageUrl(`https://via.placeholder.com/300x450/374151/9CA3AF?text=${manga.title.charAt(0)}`);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [manga]);

  const handleListToggle = (listType: keyof typeof userLists) => {
    setUserLists(prev => ({
      ...prev,
      [listType]: !prev[listType]
    }));
  };

  const handleReviewSubmit = (review: { rating: number; comment: string }) => {
    console.log('Review submitted:', review);
    // ここでレビューデータを保存する処理を実装
    // 実際のアプリケーションでは、APIに送信する
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'hiatus': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ongoing': return '連載中';
      case 'completed': return '完結済み';
      case 'hiatus': return '休載中';
      case 'cancelled': return '連載終了';
      default: return '不明';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* ヘッダー */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
            ← ホームに戻る
          </Link>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左カラム: 表紙画像とアクションボタン */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
                <img
                  src={imageUrl}
                  alt={`${manga.title} 表紙`}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="mt-6 space-y-3">
                {/* リストボタン */}
                <button
                  onClick={() => handleListToggle('wantToRead')}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    userLists.wantToRead
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  {userLists.wantToRead ? '✓ 読みたいリストに追加済み' : '📚 読みたいリストに追加'}
                </button>
                <button
                  onClick={() => handleListToggle('currentlyReading')}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    userLists.currentlyReading
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  {userLists.currentlyReading ? '✓ 読書中リストに追加済み' : '📖 読書中リストに追加'}
                </button>
                <button
                  onClick={() => handleListToggle('completed')}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    userLists.completed
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  {userLists.completed ? '✓ 読了リストに追加済み' : '✅ 読了リストに追加'}
                </button>
                <button
                  onClick={() => handleListToggle('dropped')}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    userLists.dropped
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  {userLists.dropped ? '✓ 中断リストに追加済み' : '⏸️ 中断リストに追加'}
                </button>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="w-full py-3 px-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  ✍️ レビューを投稿
                </button>
              </div>
            </div>
          </div>

          {/* 右カラム: 詳細情報 */}
          <div className="lg:col-span-2">
            {/* タイトルと基本情報 */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h1 className="text-4xl font-bold text-white mb-2">{manga.title}</h1>
              <p className="text-xl text-gray-300 mb-4">著者: {manga.author}</p>
              <div className="flex flex-wrap gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(manga.status)}`}>
                  {getStatusText(manga.status)}
                </span>
                <span className="px-3 py-1 bg-gray-600 rounded-full text-sm font-medium">
                  {manga.currentVolume}巻 / {manga.totalVolumes}巻
                </span>
                <span className="px-3 py-1 bg-gray-600 rounded-full text-sm font-medium">
                  {manga.publicationYear}年開始
                </span>
                <span className="px-3 py-1 bg-gray-600 rounded-full text-sm font-medium">
                  {manga.publisher}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-yellow-400">{manga.rating}</div>
                  <div className="text-yellow-400 text-xl ml-1">★★★★★</div>
                </div>
                <span className="text-gray-400">({manga.reviewCount.toLocaleString()}件のレビュー)</span>
              </div>
            </div>

            {/* あらすじ */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">あらすじ</h2>
              <p className="text-gray-300 leading-relaxed text-lg">{manga.description}</p>
            </div>

            {/* ジャンルとタグ */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">ジャンル・タグ</h2>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">ジャンル</h3>
                <div className="flex flex-wrap gap-2">
                  {manga.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">タグ</h3>
                <div className="flex flex-wrap gap-2">
                  {manga.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-600 text-gray-200 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 関連漫画 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">関連漫画</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {manga.relatedManga.slice(0, 6).map((relatedId) => {
                  // 関連漫画の情報を取得（実際のアプリケーションではAPIから取得）
                  const relatedManga = {
                    id: relatedId,
                    title: relatedId.charAt(0).toUpperCase() + relatedId.slice(1),
                    author: '著者名'
                  };
                  
                  return (
                    <Link
                      key={relatedId}
                      href={`/manga/${relatedId}`}
                      className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-16 bg-gray-600 rounded flex items-center justify-center text-gray-400 text-sm">
                          {relatedManga.title.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-medium text-white text-sm">{relatedManga.title}</h3>
                          <p className="text-gray-400 text-xs">{relatedManga.author}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* レビューモーダル */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        mangaTitle={manga.title}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
};

export default MangaDetailClient;
