/**
 * ThemeToggle コンポーネント
 * 
 * ダークモードとライトモードの切り替え：
 * - ローカルストレージでの設定保存
 * - システム設定の自動検出
 * - スムーズな切り替えアニメーション
 * 
 * このコンポーネントは、ユーザーの
 * テーマ設定を管理し、一貫した
 * ユーザー体験を提供します。
 */

import React, { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  // 初期化時にテーマを設定
  useEffect(() => {
    // ローカルストレージからテーマ設定を取得
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      // システム設定を検出
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  // テーマ切り替え処理
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    // DOMにクラスを適用
    document.documentElement.classList.toggle('dark', newTheme);
    
    // ローカルストレージに保存
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group"
      aria-label="Toggle theme"
    >
      {isDark ? (
        // 太陽アイコン（ダークモード時）
        <svg
          className="w-6 h-6 text-yellow-500 group-hover:rotate-90 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // 月アイコン（ライトモード時）
        <svg
          className="w-6 h-6 text-gray-700 group-hover:-rotate-12 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
