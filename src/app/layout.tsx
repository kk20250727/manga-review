import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MangaU - Discover Amazing Manga Series",
  description: "Explore thousands of manga series, read reviews, and discover your next favorite story. From classic series to the latest releases.",
  keywords: "manga, anime, comics, reviews, series, volumes, japan",
};

/**
 * ルートレイアウトコンポーネント
 * 
 * アプリケーション全体の共通レイアウト：
 * - グローバルナビゲーション
 * - 認証コンテキストプロバイダー
 * - フッター
 * - フォント設定
 * - メタデータ
 * 
 * このレイアウトは、すべてのページで共通して
 * 使用される構造を定義します。
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
