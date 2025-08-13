'use client';

import { useState } from 'react';
import { searchRakutenBooks } from '../../lib/rakuten.js';
import Link from 'next/link';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState('google');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      let res;
      if (searchMode === 'google') {
        res = await searchRakutenBooks(searchTerm);
        setResults(res);
      } else {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        res = data.items || [];
        setResults(res);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Search Manga</h1>
        <p className="text-xl text-gray-600">Find your next favorite series</p>
      </div>

      {/* Search Tabs */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setSearchMode('google')}
            className={`px-4 py-2 rounded-md transition-colors ${
              searchMode === 'google'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Google Books API
          </button>
          <button
            onClick={() => setSearchMode('site')}
            className={`px-4 py-2 rounded-md transition-colors ${
              searchMode === 'site'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            サイト内インデックス
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter manga title, author, or series..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2 text-center">
          {searchMode === 'google' 
            ? 'Search through Google Books database for manga information'
            : 'Search through our curated manga database with reviews and ratings'
          }
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">検索中...</p>
        </div>
      )}

      {/* Search Results */}
      {!isLoading && results.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">
            Search Results ({results.length})
          </h2>
          <div className="grid gap-6">
            {results.map((item, index) => (
              <div key={index} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex gap-6">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-32 bg-gray-200 rounded overflow-hidden">
                      {item.largeImageUrl ? (
                        <img
                          src={item.largeImageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 text-blue-600">
                      {searchMode === 'site' && item.type === 'series' ? (
                        <Link href={`/series/${item.id}`} className="hover:underline">
                          {item.title}
                        </Link>
                      ) : (
                        item.title
                      )}
                    </h3>
                    
                    {item.author && (
                      <p className="text-gray-600 mb-2">
                        <span className="font-medium">Author:</span> {item.author}
                      </p>
                    )}
                    
                    {item.publisherName && (
                      <p className="text-gray-600 mb-2">
                        <span className="font-medium">Publisher:</span> {item.publisherName}
                      </p>
                    )}
                    
                    {item.description && (
                      <p className="text-gray-700 mb-3 line-clamp-3">
                        {item.description}
                      </p>
                    )}
                    
                    {item.itemCaption && (
                      <p className="text-gray-700 mb-3 line-clamp-3">
                        {item.itemCaption}
                      </p>
                    )}

                    {searchMode === 'site' && item.type === 'series' && (
                      <div className="flex gap-4 text-sm text-gray-500">
                        {item.volumes && (
                          <span>{item.volumes.length} volumes</span>
                        )}
                        {item.creators && item.creators.length > 0 && (
                          <span>{item.creators.length} creators</span>
                        )}
                      </div>
                    )}

                    {item.itemUrl && (
                      <a
                        href={item.itemUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        View Details
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!isLoading && results.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No results found</h3>
          <p className="text-gray-500">
            Try adjusting your search terms or browse our{' '}
            <Link href="/admin/series" className="text-blue-600 hover:underline">
              complete series list
            </Link>
          </p>
        </div>
      )}

      {/* Initial State */}
      {!isLoading && results.length === 0 && !searchTerm && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Ready to discover?</h3>
          <p className="text-gray-500 mb-6">
            Enter a manga title, author, or series name to get started
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">ONE PIECE</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">進撃の巨人</span>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">キングダム</span>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">呪術廻戦</span>
          </div>
        </div>
      )}
    </div>
  );
}
