// Index Series/Volumes to Meilisearch
import { MeiliSearch } from 'meilisearch';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const host = process.env.MEILI_HOST || 'http://127.0.0.1:7700';
const apiKey = process.env.MEILI_KEY || '';

const client = new MeiliSearch({ host, apiKey });

async function indexSeries() {
  const list = await prisma.series.findMany({
    include: {
      aliases: true,
      creators: { include: { creator: true } },
    },
  });
  const docs = list.map((s) => ({
    id: `series_${s.id}`,
    type: 'series',
    title: s.title,
    englishTitle: s.englishTitle,
    romajiTitle: s.romajiTitle,
    description: s.description,
    publisherName: s.publisherName,
    alias: s.aliases.map((a) => a.value),
    creators: s.creators.map((c) => `${c.creator.name}(${c.role})`),
  }));
  const idx = client.index('manga');
  await idx.addDocuments(docs);
}

async function indexVolumes() {
  const list = await prisma.volume.findMany({ include: { series: true } });
  const docs = list.map((v) => ({
    id: `volume_${v.id}`,
    type: 'volume',
    title: v.title,
    volumeNumber: v.volumeNumber,
    seriesTitle: v.series.title,
    publisherName: v.publisherName,
    isbn: v.isbn,
  }));
  const idx = client.index('manga');
  await idx.addDocuments(docs);
}

async function main() {
  await indexSeries();
  await indexVolumes();
  console.log('Indexed to Meilisearch');
}

main();
