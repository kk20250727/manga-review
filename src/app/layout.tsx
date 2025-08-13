import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Manga Review - Discover Amazing Manga Series",
  description: "Explore thousands of manga series, read reviews, and discover your next favorite story. From classic series to the latest releases.",
  keywords: "manga, anime, comics, reviews, series, volumes, japan",
};

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
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="text-xl font-bold text-blue-600">
                  Manga Review
                </Link>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Home
                </Link>
                <Link href="/search" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Search
                </Link>
                <Link href="/admin/series" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Browse
                </Link>
                <Link href="/admin" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {children}

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Manga Review</h3>
                <p className="text-gray-300">
                  Your comprehensive guide to manga series, reviews, and discoveries.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li><Link href="/search" className="text-gray-300 hover:text-white">Search Manga</Link></li>
                  <li><Link href="/admin/series" className="text-gray-300 hover:text-white">Browse Series</Link></li>
                  <li><Link href="/admin" className="text-gray-300 hover:text-white">Admin Panel</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Features</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>Smart Search</li>
                  <li>Community Reviews</li>
                  <li>Series Information</li>
                  <li>Volume Tracking</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">About</h4>
                <p className="text-gray-300">
                  Built with Next.js and modern web technologies to provide the best manga discovery experience.
                </p>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Manga Review. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
