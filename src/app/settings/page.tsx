'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

interface Settings {
  theme: 'light' | 'dark' | 'auto';
  language: 'ja' | 'en';
  notifications: {
    newReleases: boolean;
    reviewUpdates: boolean;
    recommendations: boolean;
  };
  display: {
    showRatings: boolean;
    showReviewCount: boolean;
    compactMode: boolean;
  };
  privacy: {
    publicProfile: boolean;
    showReadingHistory: boolean;
    allowRecommendations: boolean;
  };
  performance: {
    enableImageCache: boolean;
    autoRefreshCache: boolean;
    maxCacheSize: number;
  };
}

const SettingsPage = () => {
  // テーマコンテキストを使用
  const { theme, isDarkMode, setTheme } = useTheme();
  
  const [settings, setSettings] = useState<Settings>({
    theme: 'dark',
    language: 'ja',
    notifications: {
      newReleases: true,
      reviewUpdates: true,
      recommendations: false,
    },
    display: {
      showRatings: true,
      showReviewCount: true,
      compactMode: false,
    },
    privacy: {
      publicProfile: false,
      showReadingHistory: true,
      allowRecommendations: true,
    },
    performance: {
      enableImageCache: true,
      autoRefreshCache: true,
      maxCacheSize: 100,
    },
  });

  useEffect(() => {
    // ローカルストレージから設定を読み込み
    const savedSettings = localStorage.getItem('mangaU-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
        
        // テーマ設定があれば適用（初期化時のみ）
        if (parsed.theme && parsed.theme !== theme) {
          setTheme(parsed.theme);
        }
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []); // 初期化時のみ実行

  // テーマ変更時の設定同期
  useEffect(() => {
    if (theme !== settings.theme) {
      setSettings(prev => ({ ...prev, theme }));
    }
  }, [theme, settings.theme]);

  const handleSettingChange = (category: keyof Settings, key: string, value: any) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [category]: {
          ...(prev[category] as any),
          [key]: value,
        },
      };
      
      // ローカルストレージに保存
      localStorage.setItem('mangaU-settings', JSON.stringify(newSettings));
      
      // テーマ変更の場合は即座に適用
      if (category === 'theme' && key === 'theme') {
        setTheme(value);
      }
      
      return newSettings;
    });
  };

  const handleResetSettings = () => {
    if (confirm('設定をリセットしますか？この操作は取り消せません。')) {
      const defaultSettings: Settings = {
        theme: 'dark',
        language: 'ja',
        notifications: {
          newReleases: true,
          reviewUpdates: true,
          recommendations: false,
        },
        display: {
          showRatings: true,
          showReviewCount: true,
          compactMode: false,
        },
        privacy: {
          publicProfile: false,
          showReadingHistory: true,
          allowRecommendations: true,
        },
        performance: {
          enableImageCache: true,
          autoRefreshCache: true,
          maxCacheSize: 100,
        },
      };
      
      setSettings(defaultSettings);
      localStorage.setItem('mangaU-settings', JSON.stringify(defaultSettings));
      setTheme('dark');
    }
  };

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{
      backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: isDarkMode ? '#F9FAFB' : '#111827',
        marginBottom: '1rem',
        borderBottom: `2px solid ${isDarkMode ? '#60A5FA' : '#3B82F6'}`,
        paddingBottom: '0.5rem'
      }}>
        {title}
      </h3>
      {children}
    </div>
  );

  const SettingItem = ({ 
    label, 
    description, 
    type = 'toggle', 
    value, 
    onChange, 
    options 
  }: {
    label: string;
    description: string;
    type?: 'toggle' | 'select' | 'range';
    value: any;
    onChange: (value: any) => void;
    options?: { value: string; label: string }[];
  }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 0',
      borderBottom: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
      marginBottom: '0.5rem'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: isDarkMode ? '#F9FAFB' : '#111827',
          marginBottom: '0.25rem'
        }}>
          {label}
        </div>
        <div style={{
          fontSize: '0.875rem',
          color: isDarkMode ? '#9CA3AF' : '#6B7280'
        }}>
          {description}
        </div>
      </div>
      
      <div style={{ marginLeft: '1rem' }}>
        {type === 'toggle' && (
          <button
            onClick={() => onChange(!value)}
            style={{
              width: '3rem',
              height: '1.5rem',
              borderRadius: '0.75rem',
              backgroundColor: value ? '#10B981' : '#6B7280',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{
              width: '1.25rem',
              height: '1.25rem',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              position: 'absolute',
              top: '0.125rem',
              left: value ? '1.625rem' : '0.125rem',
              transition: 'all 0.3s ease'
            }} />
          </button>
        )}
        
        {type === 'select' && options && (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '0.375rem',
              border: `1px solid ${isDarkMode ? '#374151' : '#D1D5DB'}`,
              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
              color: isDarkMode ? '#F9FAFB' : '#111827',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
        
        {type === 'range' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="range"
              min="50"
              max="200"
              value={value}
              onChange={(e) => onChange(parseInt(e.target.value))}
              style={{
                width: '6rem',
                cursor: 'pointer'
              }}
            />
            <span style={{
              fontSize: '0.875rem',
              color: isDarkMode ? '#9CA3AF' : '#6B7280',
              minWidth: '2rem'
            }}>
              {value}MB
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#111827' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#000000',
      transition: 'all 0.3s ease'
    }}>
      {/* ヘッダー */}
      <div style={{
        backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB',
        borderBottom: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link href="/" style={{
            color: '#60A5FA',
            textDecoration: 'none',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            MangaU
          </Link>
          
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: isDarkMode ? '#F9FAFB' : '#111827'
          }}>
            設定
          </h1>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '2rem 1rem'
      }}>
        {/* テーマ設定 */}
        <SettingSection title="🎨 テーマ設定">
          <SettingItem
            label="テーマ"
            description="サイトの見た目を選択してください"
            type="select"
            value={settings.theme}
            onChange={(value) => handleSettingChange('theme', 'theme', value)}
            options={[
              { value: 'light', label: 'ライトモード' },
              { value: 'dark', label: 'ダークモード' },
              { value: 'auto', label: 'システム設定に従う' }
            ]}
          />
        </SettingSection>

        {/* 言語設定 */}
        <SettingSection title="🌐 言語設定">
          <SettingItem
            label="言語"
            description="表示言語を選択してください"
            type="select"
            value={settings.language}
            onChange={(value) => handleSettingChange('language', 'language', value)}
            options={[
              { value: 'ja', label: '日本語' },
              { value: 'en', label: 'English' }
            ]}
          />
        </SettingSection>

        {/* 通知設定 */}
        <SettingSection title="🔔 通知設定">
          <SettingItem
            label="新刊リリース通知"
            description="新しい漫画の発売時に通知を受け取る"
            type="toggle"
            value={settings.notifications.newReleases}
            onChange={(value) => handleSettingChange('notifications', 'newReleases', value)}
          />
          <SettingItem
            label="レビュー更新通知"
            description="フォローしている作品のレビュー更新時に通知を受け取る"
            type="toggle"
            value={settings.notifications.reviewUpdates}
            onChange={(value) => handleSettingChange('notifications', 'reviewUpdates', value)}
          />
          <SettingItem
            label="おすすめ通知"
            description="パーソナライズされたおすすめ作品の通知を受け取る"
            type="toggle"
            value={settings.notifications.recommendations}
            onChange={(value) => handleSettingChange('notifications', 'recommendations', value)}
          />
        </SettingSection>

        {/* 表示設定 */}
        <SettingSection title="👁️ 表示設定">
          <SettingItem
            label="評価表示"
            description="漫画カードに評価を表示する"
            type="toggle"
            value={settings.display.showRatings}
            onChange={(value) => handleSettingChange('display', 'showRatings', value)}
          />
          <SettingItem
            label="レビュー数表示"
            description="漫画カードにレビュー数を表示する"
            type="toggle"
            value={settings.display.showReviewCount}
            onChange={(value) => handleSettingChange('display', 'showReviewCount', value)}
          />
          <SettingItem
            label="コンパクトモード"
            description="より多くの漫画を一度に表示する"
            type="toggle"
            value={settings.display.compactMode}
            onChange={(value) => handleSettingChange('display', 'compactMode', value)}
          />
        </SettingSection>

        {/* プライバシー設定 */}
        <SettingSection title="🔒 プライバシー設定">
          <SettingItem
            label="公開プロフィール"
            description="他のユーザーにプロフィールを公開する"
            type="toggle"
            value={settings.privacy.publicProfile}
            onChange={(value) => handleSettingChange('privacy', 'publicProfile', value)}
          />
          <SettingItem
            label="読書履歴表示"
            description="他のユーザーに読書履歴を表示する"
            type="toggle"
            value={settings.privacy.showReadingHistory}
            onChange={(value) => handleSettingChange('privacy', 'showReadingHistory', value)}
          />
          <SettingItem
            label="おすすめ許可"
            description="他のユーザーにおすすめ作品を提案することを許可する"
            type="toggle"
            value={settings.privacy.allowRecommendations}
            onChange={(value) => handleSettingChange('privacy', 'allowRecommendations', value)}
          />
        </SettingSection>

        {/* パフォーマンス設定 */}
        <SettingSection title="⚡ パフォーマンス設定">
          <SettingItem
            label="画像キャッシュ有効"
            description="画像をキャッシュして読み込み速度を向上させる"
            type="toggle"
            value={settings.performance.enableImageCache}
            onChange={(value) => handleSettingChange('performance', 'enableImageCache', value)}
          />
          <SettingItem
            label="自動キャッシュ更新"
            description="古いキャッシュを自動的に更新する"
            type="toggle"
            value={settings.performance.autoRefreshCache}
            onChange={(value) => handleSettingChange('performance', 'autoRefreshCache', value)}
          />
          <SettingItem
            label="最大キャッシュサイズ"
            description="キャッシュの最大サイズを設定する"
            type="range"
            value={settings.performance.maxCacheSize}
            onChange={(value) => handleSettingChange('performance', 'maxCacheSize', value)}
          />
        </SettingSection>

        {/* アクションボタン */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          marginTop: '2rem'
        }}>
          <button
            onClick={handleResetSettings}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#EF4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#DC2626';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#EF4444';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            設定をリセット
          </button>
          
          <Link href="/" style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#60A5FA',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            textDecoration: 'none',
            display: 'inline-block'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#3B82F6';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#60A5FA';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
