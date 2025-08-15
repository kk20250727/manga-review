/**
 * 高品質なカードコンポーネント
 * 
 * 様々な用途に対応した
 * 再利用可能なカードコンポーネント：
 * - シリーズ表示用
 * - レビュー表示用
 * - 統計情報表示用
 * - ホバーエフェクト
 * - アニメーション
 * 
 * このコンポーネントは、アプリケーション全体で
 * 一貫したカードデザインを提供します。
 */

import React from 'react';
import { cn } from '@/lib/utils';

// カードのルート要素
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  interactive?: boolean;
}

export function Card({ 
  className, 
  children, 
  hover = false, 
  interactive = false,
  ...props 
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-sm",
        hover && "hover:shadow-lg hover:border-gray-300 transition-all duration-300",
        interactive && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// カードヘッダー
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn("px-6 py-4 border-b border-gray-100", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// カードコンテンツ
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div
      className={cn("px-6 py-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// カードフッター
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cn("px-6 py-4 border-t border-gray-100 bg-gray-50", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// シリーズカード（特化版）
interface SeriesCardProps {
  series: {
    id: number;
    title: string;
    englishTitle?: string;
    description?: string;
    coverImageUrl?: string;
    publisherName?: string;
    status?: string;
    averageRating?: number;
    reviewCount?: number;
    favoriteCount?: number;
    genres?: { name: string }[];
  };
  onClick?: () => void;
  showStats?: boolean;
  className?: string;
}

export function SeriesCard({ 
  series, 
  onClick, 
  showStats = true,
  className 
}: SeriesCardProps) {
  return (
    <Card 
      className={cn("overflow-hidden", className)}
      interactive={!!onClick}
      hover={true}
      onClick={onClick}
    >
      <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {series.coverImageUrl ? (
          <img
            src={series.coverImageUrl}
            alt={series.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-gray-400 text-4xl">📚</div>
          </div>
        )}
        
        {/* ステータスバッジ */}
        {series.status && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {series.status}
            </span>
          </div>
        )}
      </div>
      
      <CardContent>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
            {series.englishTitle || series.title}
          </h3>
          
          {series.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {series.description}
            </p>
          )}
          
          {series.publisherName && (
            <p className="text-xs text-gray-500">
              {series.publisherName}
            </p>
          )}
          
          {/* ジャンルタグ */}
          {series.genres && series.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {series.genres.slice(0, 3).map((genre, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                >
                  {genre.name}
                </span>
              ))}
              {series.genres.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                  +{series.genres.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      {showStats && (
        <CardFooter>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {series.averageRating ? (
                <>
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(series.averageRating!) 
                          ? 'text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-1 text-sm font-medium text-gray-900">
                    {series.averageRating.toFixed(1)}
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-500">評価なし</span>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{series.reviewCount || 0} レビュー</span>
              <span>{series.favoriteCount || 0} お気に入り</span>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
