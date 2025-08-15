/**
 * ユーティリティ関数
 * 
 * アプリケーション全体で使用される
 * 共通のユーティリティ関数：
 * - クラス名の結合
 * - 日付フォーマット
 * - 文字列処理
 * - バリデーション
 * 
 * このファイルは、コードの重複を避け
 * 一貫した処理を提供します。
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * クラス名を結合し、Tailwind CSSの競合を解決
 * @param inputs 結合するクラス名
 * @returns 結合されたクラス名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 日付を読みやすい形式にフォーマット
 * @param date フォーマットする日付
 * @param options フォーマットオプション
 * @returns フォーマットされた日付文字列
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  
  return new Intl.DateTimeFormat('ja-JP', defaultOptions).format(dateObj);
}

/**
 * 相対時間を計算（例：2時間前、3日前）
 * @param date 基準となる日付
 * @returns 相対時間文字列
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return '今';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}分前`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}時間前`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}日前`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months}ヶ月前`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years}年前`;
  }
}

/**
 * 文字列を指定された長さに切り詰め
 * @param text 切り詰める文字列
 * @param maxLength 最大長
 * @param suffix 末尾に追加する文字列
 * @returns 切り詰められた文字列
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + suffix;
}

/**
 * 数値を読みやすい形式にフォーマット
 * @param num フォーマットする数値
 * @returns フォーマットされた数値文字列
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * 評価を星の表示用に変換
 * @param rating 評価（1-5）
 * @param maxRating 最大評価（デフォルト5）
 * @returns 星の配列（true: 塗りつぶし、false: 空）
 */
export function getRatingStars(rating: number, maxRating: number = 5): boolean[] {
  return Array.from({ length: maxRating }, (_, i) => i < rating);
}

/**
 * デバウンス関数
 * @param func 実行する関数
 * @param wait 待機時間（ミリ秒）
 * @returns デバウンスされた関数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * ローカルストレージの安全な操作
 */
export const storage = {
  get: (key: string): any => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // エラーが発生した場合は何もしない
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // エラーが発生した場合は何もしない
    }
  },
};
