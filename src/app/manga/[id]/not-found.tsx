import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">漫画が見つかりません</h2>
        <p className="text-gray-400 mb-8">
          お探しの漫画は存在しないか、削除された可能性があります。
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}
