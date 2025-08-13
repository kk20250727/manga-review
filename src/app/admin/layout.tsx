import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/admin" className="text-xl font-bold text-blue-600">
                Admin Panel
              </Link>
            </div>
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="text-gray-700 hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/series" className="text-gray-700 hover:text-blue-600 transition-colors">
                Series
              </Link>
              <Link href="/search" className="text-gray-700 hover:text-blue-600 transition-colors">
                Search
              </Link>
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                View Site
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="py-6">
        {children}
      </main>
    </div>
  );
}
