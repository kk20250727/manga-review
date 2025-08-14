

/**
 * Google Books APIを使用したマンガ検索機能
 * 
 * 元々は楽天ブックスAPIを使用していたが、公式コミックスの検索精度が低かったため
 * Google Books APIに移行。より正確な検索結果を提供。
 */

export async function searchRakutenBooks(keyword) {
  // Google Books APIキーを環境変数から取得
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
  const trimmedKeyword = (keyword || '').toString().trim();
  
  if (!trimmedKeyword) return [];

  // Google Books APIの検索パラメータを構築
  // 日本語書籍に限定し、最大20件の結果を取得
  const params = new URLSearchParams({
    q: trimmedKeyword,
    langRestrict: 'ja',        // 日本語書籍のみ
    maxResults: '20',          // 最大20件
    printType: 'books',        // 書籍のみ
    orderBy: 'relevance',      // 関連性順
  });
  
  // APIキーがある場合は追加（無料枠の制限を回避）
  if (apiKey) params.set('key', apiKey);

  const url = `https://www.googleapis.com/books/v1/volumes?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Google Books API error:', response.status);
      return [];
    }

    const data = await response.json();
    
    // 検索結果がない場合
    if (!data.items || data.items.length === 0) {
      return [];
    }

    // Google Books APIのレスポンスを統一フォーマットに変換
    // フロントエンドの期待する形式（title, author, publisherName等）にマッピング
    return data.items.map(item => {
      const volumeInfo = item.volumeInfo;
      const saleInfo = item.saleInfo;
      
      return {
        title: volumeInfo.title || '',
        author: volumeInfo.authors ? volumeInfo.authors.join(', ') : '',
        publisherName: volumeInfo.publisher || '',
        itemCaption: volumeInfo.description || '',
        largeImageUrl: volumeInfo.imageLinks?.large || volumeInfo.imageLinks?.medium || '',
        itemUrl: saleInfo?.buyLink || volumeInfo.infoLink || '',
        isbn: volumeInfo.industryIdentifiers?.[0]?.identifier || '',
      };
    });
  } catch (error) {
    console.error('Failed to fetch from Google Books API:', error);
    return [];
  }
}
