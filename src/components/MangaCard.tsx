import React from 'react';
import Link from 'next/link';

interface MangaCardProps {
  imageUrl: string;
  title: string;
  author: string;
  mangaId?: string; // 漫画のIDを追加
}

const MangaCard: React.FC<MangaCardProps> = ({ imageUrl, title, author, mangaId }) => {
  // 漫画IDがない場合は通常のカードとして表示
  if (!mangaId) {
    return (
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <img
          src={imageUrl}
          alt={`${title} 表紙`}
          className="w-full h-64 object-cover"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-gray-400">{author}</p>
        </div>
      </div>
    );
  }

  // 漫画IDがある場合はリンクとして表示
  return (
    <Link href={`/manga/${mangaId}`} className="block">
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
        <img
          src={imageUrl}
          alt={`${title} 表紙`}
          className="w-full h-64 object-cover"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-2 hover:text-blue-400 transition-colors duration-200">
            {title}
          </h3>
          <p className="text-gray-400">{author}</p>
        </div>
      </div>
    </Link>
  );
};

export default MangaCard;
