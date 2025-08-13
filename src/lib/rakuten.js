

/**
 * Google Books API を使って漫画（コミックス）を検索します。
 * 既存UI互換のため、関数名・返却型は楽天版に合わせています。
 * - title, author, publisherName, itemCaption, largeImageUrl, itemUrl, isbn を返却
 * - 最大20件、言語は日本語を優先
 * - .env.local の NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY があれば利用（任意）
 */
export async function searchRakutenBooks(keyword) {
  try {
    const trimmed = (keyword ?? '').toString().trim();
    if (!trimmed) return [];

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;

    // 漫画系に寄せるためのクエリチューニング
    // - タイトル/一般キーワードに一致 + コミック系サブジェクトを優先
    // - 日本語書籍を優先（langRestrict=ja）
    const qParts = [
      `${trimmed}`,
      'subject:"Comics & Graphic Novels"',
    ];
    const q = qParts.join(' ');

    const params = new URLSearchParams({
      q,
      printType: 'books',
      maxResults: '20',
      langRestrict: 'ja',
    });
    if (apiKey) params.set('key', apiKey);

    const url = `https://www.googleapis.com/books/v1/volumes?${params.toString()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.items || data.items.length === 0) return [];

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

    // 整形
    const items = data.items.map((it) => {
      const v = it.volumeInfo || {};
      return {
        title: v.title || '',
        author: Array.isArray(v.authors) ? v.authors.join('/') : (v.authors || ''),
        publisherName: v.publisher || '',
        itemCaption: v.description || '',
        largeImageUrl: pickImage(v.imageLinks),
        itemUrl: v.canonicalVolumeLink || v.infoLink || '',
        isbn: toIsbn(v.industryIdentifiers),
      };
    });

    // なるべく入力語に近いものを上に（簡易スコア）
    const normalizedQuery = trimmed.toLowerCase();
    const scored = items
      .map((item) => {
        const t = (item.title || '').toLowerCase();
        let score = 0;
        if (t === normalizedQuery) score += 6;
        if (t.startsWith(normalizedQuery)) score += 3;
        if (t.includes(normalizedQuery)) score += 1;
        if (item.largeImageUrl) score += 1;
        return { item, score };
      })
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);

    return scored;
  } catch (e) {
    console.error('Google Books API エラー:', e);
    return [];
  }
}
