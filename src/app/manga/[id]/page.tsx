/**
 * 漫画個別ページ
 * U-NEXTのような美しいUIで漫画の詳細情報を表示
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { getMangaById, getAllManga } from '@/lib/manga-data';
import MangaDetailClient from '@/components/MangaDetailClient';

interface MangaPageProps {
  params: {
    id: string;
  };
}

export default function MangaPage({ params }: MangaPageProps) {
  const manga = getMangaById(params.id);

  if (!manga) {
    notFound();
  }

  return <MangaDetailClient manga={manga} />;
}

export async function generateStaticParams() {
  const allManga = getAllManga();
  return allManga.map((manga) => ({
    id: manga.id,
  }));
}
