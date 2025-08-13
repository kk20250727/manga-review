// Enrich Series aliases (english/romaji/alias)
import { PrismaClient } from '@prisma/client';
import wanakana from 'wanakana';

const prisma = new PrismaClient();

// ざっくりと英語タイトルを推定（実運用では外部API/手動編集を推奨）
function guessEnglish(title) {
  // ASCIIが多ければそのまま、そうでなければローマ字を単語区切りで
  const asciiRatio = [...title].filter((c) => /[ -~]/.test(c)).length / Math.max(1, title.length);
  if (asciiRatio > 0.6) return title;
  const romaji = wanakana.toRomaji(title);
  return romaji
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function toRomaji(title) {
  return wanakana.toRomaji(title).replace(/\s+/g, ' ');
}

async function upsertAlias(seriesId, type, value) {
  if (!value) return;
  try {
    await prisma.seriesAlias.create({
      data: { seriesId, type, value },
    });
  } catch {
    // unique制約重複は無視
  }
}

async function main() {
  const seriesList = await prisma.series.findMany({});
  for (const s of seriesList) {
    const english = guessEnglish(s.title);
    const romaji = toRomaji(s.title);

    await upsertAlias(s.id, 'english', english);
    await upsertAlias(s.id, 'romaji', romaji);

    // 別名として、全角半角/記号除去など単純正規化したものも保存
    const alias = s.title
      .replace(/[\s　]+/g, '')
      .replace(/[\-–—_:：・\(\)（）\[\]【】'"!！?？.,。､、]/g, '');
    await upsertAlias(s.id, 'alias', alias);
  }
  console.log('Alias enrich completed');
}

main().then(() => prisma.$disconnect());
