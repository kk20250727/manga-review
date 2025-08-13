// Ingest Series/Volumes from Google Books
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

const normalizeKey = (s) => (s || '')
  .toString()
  .toLowerCase()
  .replace(/[\s　]+/g, '')
  .replace(/[\-–—_:：・\(\)（）\[\]【】'"!！?？.,。､、]/g, '');

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
    maxResults: '40',
    langRestrict: 'ja',
  });
  if (apiKey) params.set('key', apiKey);
  const url = `https://www.googleapis.com/books/v1/volumes?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items || []).map((it) => it.volumeInfo);
}

function parseVolumeNumber(title) {
  // 数字や「第x巻」「(x)」「（x）」などから巻数を推定
  const m = (title || '').match(/(?:(?:第)?\s*(\d{1,3})\s*巻)|[\(（]\s*(\d{1,3})\s*[\)）]|\s(\d{1,3})\s*$/);
  if (!m) return null;
  const value = m[1] || m[2] || m[3];
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function upsertSeriesAndVolume(seriesTitle, v) {
  const isbn = toIsbn(v.industryIdentifiers);
  const googleVolumeId = v.industryIdentifiers?.map((x) => x.identifier).join(',') || isbn || `${seriesTitle}-${v.title}`;
  const volumeNumber = parseVolumeNumber(v.title || '');

  const seriesKey = normalizeKey(seriesTitle);
  const series = await prisma.series.upsert({
    where: { normalizedKey: seriesKey },
    update: {
      title: seriesTitle,
      description: v.description || '',
      coverImageUrl: pickImage(v.imageLinks) || undefined,
      publisherName: v.publisher || undefined,
    },
    create: {
      title: seriesTitle,
      englishTitle: '',
      romajiTitle: '',
      normalizedKey: seriesKey,
      description: v.description || '',
      coverImageUrl: pickImage(v.imageLinks) || '',
      publisherName: v.publisher || '',
    },
  });

  await prisma.volume.upsert({
    where: { googleVolumeId },
    update: {
      title: v.title || seriesTitle,
      volumeNumber: volumeNumber || undefined,
      isbn: isbn || undefined,
      itemUrl: v.canonicalVolumeLink || v.infoLink || '',
      imageUrl: pickImage(v.imageLinks) || '',
      publisherName: v.publisher || '',
      description: v.description || '',
      seriesId: series.id,
    },
    create: {
      title: v.title || seriesTitle,
      volumeNumber: volumeNumber || undefined,
      isbn: isbn || undefined,
      itemUrl: v.canonicalVolumeLink || v.infoLink || '',
      imageUrl: pickImage(v.imageLinks) || '',
      publisherName: v.publisher || '',
      description: v.description || '',
      seriesId: series.id,
      googleVolumeId,
    },
  });
}

async function main() {
  for (const kw of seriesKeywords) {
    const vols = await searchVolumes(kw);
    for (const v of vols) {
      try {
        await upsertSeriesAndVolume(kw, v);
      } catch (e) {
        // ignore individual errors
      }
    }
  }
  console.log('Series ingest completed');
}

main().then(() => prisma.$disconnect());
