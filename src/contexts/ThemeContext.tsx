'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // テーマを適用する関数
  const applyTheme = useCallback((newTheme: Theme) => {
    if (typeof window === 'undefined') return;

    let shouldBeDark = false;

    if (newTheme === 'dark') {
      shouldBeDark = true;
    } else if (newTheme === 'light') {
      shouldBeDark = false;
    } else if (newTheme === 'auto') {
      // システム設定に従う
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // DOMにスタイルを適用
    if (shouldBeDark) {
      document.body.style.backgroundColor = '#111827';
      document.body.style.color = '#ffffff';
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#000000';
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }

    setIsDarkMode(shouldBeDark);
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);

    // カスタムイベントを発火して他のコンポーネントに通知
    window.dispatchEvent(new CustomEvent('theme-changed', { 
      detail: { theme: newTheme, isDarkMode: shouldBeDark } 
    }));
  }, []);

  // テーマを設定する関数
  const setTheme = useCallback((newTheme: Theme) => {
    applyTheme(newTheme);
  }, [applyTheme]);

  // テーマを切り替える関数
  const toggleTheme = useCallback(() => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    applyTheme(newTheme);
  }, [isDarkMode, applyTheme]);

  // 初期化時にテーマを読み込み
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // ローカルストレージからテーマを読み込み
      const savedTheme = localStorage.getItem('theme') as Theme || 'dark';
      applyTheme(savedTheme);

      // システム設定の変更を監視（autoモード時）
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = () => {
        if (theme === 'auto') {
          applyTheme('auto');
        }
      };

      mediaQuery.addEventListener('change', handleSystemThemeChange);

      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      };
    }
  }, []);

  // テーマ変更イベントを監視
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      const { theme: newTheme, isDarkMode: newIsDarkMode } = event.detail;
      setThemeState(newTheme);
      setIsDarkMode(newIsDarkMode);
    };

    window.addEventListener('theme-changed', handleThemeChange as EventListener);

    return () => {
      window.removeEventListener('theme-changed', handleThemeChange as EventListener);
    };
  }, []);

  const value: ThemeContextType = {
    theme,
    isDarkMode,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
