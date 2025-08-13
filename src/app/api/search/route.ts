import { NextRequest, NextResponse } from 'next/server';
import { MeiliSearch } from 'meilisearch';

const host = process.env.MEILI_HOST || 'http://127.0.0.1:7700';
const apiKey = process.env.MEILI_KEY || '';

const client = new MeiliSearch({ host, apiKey });
const index = client.index('manga');

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') || '20')));

  if (!q) return NextResponse.json({ total: 0, page, pageSize, hits: [] });

  const res = await index.search(q, {
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  return NextResponse.json({
    total: res.estimatedTotalHits || res.hits.length,
    page,
    pageSize,
    hits: res.hits,
  });
}
