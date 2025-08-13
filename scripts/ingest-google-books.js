// Ingest Google Books volumes into local DB
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach((line) => {
      const [k, ...rest] = line.split('=');
      if (k && !k.startsWith('#')) env[k.trim()] = rest.join('=').trim();
    });
    return env;
  } catch {
    return {};
  }
}

const env = loadEnv();
const apiKey = env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;

const seriesKeywords = [
  'ONE PIECE',
  '進撃の巨人',
  'キングダム',
  '呪術廻戦',
  '僕のヒーローアカデミア',
  'ブルーロック',
  'スラムダンク',
];

const toIsbn = (industryIdentifiers) => {
  if (!Array.isArray(industryIdentifiers)) return '';
  const byType = new Map(industryIdentifiers.map((x) => [x.type, x.identifier]));
  return byType.get('ISBN_13') || byType.get('ISBN_10') || '';
};

const pickImage = (imageLinks) => {
  if (!imageLinks) return '';
  return (
    imageLinks.extraLarge ||
    imageLinks.large ||
    imageLinks.medium ||
    imageLinks.thumbnail ||
    imageLinks.smallThumbnail ||
    ''
  );
};

async function searchVolumes(q) {
  const params = new URLSearchParams({
    q: `${q} subject:"Comics & Graphic Novels"`,
    printType: 'books',
    maxResults: '20',
    langRestrict: 'ja',
  });
  if (apiKey) params.set('key', apiKey);
  const url = `https://www.googleapis.com/books/v1/volumes?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items || []).map((it) => it.volumeInfo);
}

async function upsertBook(v) {
  const isbn = toIsbn(v.industryIdentifiers);
  if (!isbn) return null;
  const payload = {
    title: v.title || '',
    author: Array.isArray(v.authors) ? v.authors.join('/') : (v.authors || ''),
    publisherName: v.publisher || '',
    itemCaption: v.description || '',
    largeImageUrl: pickImage(v.imageLinks),
    itemUrl: v.canonicalVolumeLink || v.infoLink || '',
    isbn,
    googleVolumeId: v.industryIdentifiers?.map((x) => x.identifier).join(',') || isbn,
  };
  return prisma.book.upsert({
    where: { isbn },
    update: payload,
    create: payload,
  });
}

async function main() {
  for (const kw of seriesKeywords) {
    const vols = await searchVolumes(kw);
    for (const v of vols) {
      try {
        await upsertBook(v);
      } catch (e) {
        // ignore duplicates/validation
      }
    }
  }
  console.log('Ingest completed');
}

main().then(() => prisma.$disconnect());
