// 楽天ブックスAPIの広範囲検索テスト用スクリプト
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 環境変数を読み込み
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env.localファイルを直接読み込み
function loadEnv() {
  try {
    const envPath = join(__dirname, '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    const env = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && !key.startsWith('#')) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    return env;
  } catch (error) {
    console.error('環境変数ファイルの読み込みエラー:', error.message);
    return {};
  }
}

const env = loadEnv();
const appId = env.NEXT_PUBLIC_RAKUTEN_APP_ID;
const affiliateId = env.NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID;

if (!appId) {
  console.error('エラー: NEXT_PUBLIC_RAKUTEN_APP_IDが設定されていません');
  process.exit(1);
}

console.log('アプリID:', appId);
console.log('アフィリエイトID:', affiliateId);

async function testRakutenBooksAPI() {
  const endpoint = 'https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404';
  
  // テスト1: ジャンルIDなしでキーワード検索
  const params1 = new URLSearchParams({
    applicationId: appId,
    affiliateId: affiliateId,
    keyword: 'ワンピース コミック',
    format: 'json',
    hits: '20'
  });
  
  try {
    console.log('\n=== テスト1: キーワード検索 "ワンピース コミック" (ジャンルIDなし) ===');
    console.log('APIリクエストURL:', `${endpoint}?${params1.toString()}`);
    
    const response1 = await fetch(`${endpoint}?${params1.toString()}`);
    console.log('レスポンスステータス:', response1.status);
    
    if (!response1.ok) {
      const errorText = await response1.text();
      console.error('エラーレスポンス:', errorText);
      throw new Error(`HTTP error! status: ${response1.status}`);
    }
    
    const data1 = await response1.json();
    console.log('総件数:', data1.count);
    console.log('結果:', data1.Items?.map(item => ({
      title: item.Item.title,
      author: item.Item.author,
      publisherName: item.Item.publisherName,
      booksGenreId: item.Item.booksGenreId,
      itemCaption: item.Item.itemCaption?.substring(0, 100) + '...'
    })) || []);
    
    // テスト2: ONE PIECEで検索
    const params2 = new URLSearchParams({
      applicationId: appId,
      affiliateId: affiliateId,
      keyword: 'ONE PIECE',
      format: 'json',
      hits: '20'
    });
    
    const response2 = await fetch(`${endpoint}?${params2.toString()}`);
    const data2 = await response2.json();
    console.log('\n=== テスト2: キーワード検索 "ONE PIECE" ===');
    console.log('総件数:', data2.count);
    console.log('結果:', data2.Items?.map(item => ({
      title: item.Item.title,
      author: item.Item.author,
      publisherName: item.Item.publisherName,
      booksGenreId: item.Item.booksGenreId,
      itemCaption: item.Item.itemCaption?.substring(0, 100) + '...'
    })) || []);
    
    // テスト3: 進撃の巨人で検索
    const params3 = new URLSearchParams({
      applicationId: appId,
      affiliateId: affiliateId,
      keyword: '進撃の巨人',
      format: 'json',
      hits: '20'
    });
    
    const response3 = await fetch(`${endpoint}?${params3.toString()}`);
    const data3 = await response3.json();
    console.log('\n=== テスト3: キーワード検索 "進撃の巨人" ===');
    console.log('総件数:', data3.count);
    console.log('結果:', data3.Items?.map(item => ({
      title: item.Item.title,
      author: item.Item.author,
      publisherName: item.Item.publisherName,
      booksGenreId: item.Item.booksGenreId,
      itemCaption: item.Item.itemCaption?.substring(0, 100) + '...'
    })) || []);
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

// スクリプトを実行
testRakutenBooksAPI();
