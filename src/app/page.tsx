'use client';

import React, { useState, useEffect } from 'react';
import MangaCard from '@/components/MangaCard';
import { getMangaCoverImages, clearImageCache, getCacheStats, clearOldVersionCache } from '@/lib/manga-images';
import { sampleMangaDetails } from '@/lib/manga-data';
import { useTheme } from '@/contexts/ThemeContext';

const HomePage = () => {
  // テーマコンテキストを使用
  const { isDarkMode } = useTheme();
  
  // ドロップダウンメニューの表示状態を管理
  const [isRankingsOpen, setIsRankingsOpen] = useState(false);
  // モバイルメニューの表示状態を管理
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // サンプルマンガデータ
  const [sampleManga, setSampleManga] = useState([
    { id: 'one-piece', title: 'One Piece', author: 'Eiichiro Oda', imageUrl: '' },
    { id: 'naruto', title: 'Naruto', author: 'Masashi Kishimoto', imageUrl: '' },
    { id: 'dragon-ball', title: 'Dragon Ball', author: 'Akira Toriyama', imageUrl: '' },
    { id: 'attack-on-titan', title: 'Attack on Titan', author: 'Hajime Isayama', imageUrl: '' },
    { id: 'my-hero-academia', title: 'My Hero Academia', author: 'Kohei Horikoshi', imageUrl: '' },
    { id: 'demon-slayer', title: 'Demon Slayer', author: 'Koyoharu Gotouge', imageUrl: '' },
    { id: 'jujutsu-kaisen', title: 'Jujutsu Kaisen', author: 'Gege Akutami', imageUrl: '' },
    { id: 'chainsaw-man', title: 'Chainsaw Man', author: 'Tatsuki Fujimoto', imageUrl: '' },
    { id: 'spy-x-family', title: 'Spy x Family', author: 'Tatsuya Endo', imageUrl: '' },
    { id: 'blue-lock', title: 'Blue Lock', author: 'Muneyuki Kaneshiro', imageUrl: '' },
    // 追加の漫画データ
    { id: 'bleach', title: 'Bleach', author: 'Tite Kubo', imageUrl: '' },
    { id: 'fairy-tail', title: 'Fairy Tail', author: 'Hiro Mashima', imageUrl: '' },
    { id: 'hunter-x-hunter', title: 'Hunter x Hunter', author: 'Yoshihiro Togashi', imageUrl: '' },
    { id: 'fullmetal-alchemist', title: 'Fullmetal Alchemist', author: 'Hiromu Arakawa', imageUrl: '' },
    { id: 'death-note', title: 'Death Note', author: 'Tsugumi Ohba', imageUrl: '' },
    { id: 'tokyo-ghoul', title: 'Tokyo Ghoul', author: 'Sui Ishida', imageUrl: '' },
    { id: 'parasyte', title: 'Parasyte', author: 'Hitoshi Iwaaki', imageUrl: '' },
    { id: 'vagabond', title: 'Vagabond', author: 'Takehiko Inoue', imageUrl: '' },
    { id: 'berserk', title: 'Berserk', author: 'Kentaro Miura', imageUrl: '' },
    { id: 'monster', title: 'Monster', author: 'Naoki Urasawa', imageUrl: '' },
    { id: '20th-century-boys', title: '20th Century Boys', author: 'Naoki Urasawa', imageUrl: '' },
    { id: 'pluto', title: 'Pluto', author: 'Naoki Urasawa', imageUrl: '' },
    { id: 'vinland-saga', title: 'Vinland Saga', author: 'Makoto Yukimura', imageUrl: '' },
    { id: 'kingdom', title: 'Kingdom', author: 'Yasuhisa Hara', imageUrl: '' },
    { id: 'one-punch-man', title: 'One Punch Man', author: 'ONE', imageUrl: '' },
    { id: 'mob-psycho-100', title: 'Mob Psycho 100', author: 'ONE', imageUrl: '' },
    { id: 'assassination-classroom', title: 'Assassination Classroom', author: 'Yusei Matsui', imageUrl: '' },
    { id: 'food-wars', title: 'Food Wars', author: 'Yuto Tsukuda', imageUrl: '' },
    { id: 'haikyu', title: 'Haikyu!!', author: 'Haruichi Furudate', imageUrl: '' },
    { id: 'kuroko-no-basket', title: 'Kuroko no Basket', author: 'Tadatoshi Fujimaki', imageUrl: '' },
    { id: 'yowamushi-pedal', title: 'Yowamushi Pedal', author: 'Wataru Watanabe', imageUrl: '' },
    { id: 'free', title: 'Free!', author: 'Kouji Ooji', imageUrl: '' },
    { id: 'yuri-on-ice', title: 'Yuri on Ice', author: 'Mitsurou Kubo', imageUrl: '' },
    { id: 'given', title: 'Given', author: 'Natsuki Kizu', imageUrl: '' },
    { id: 'orange', title: 'Orange', author: 'Ichigo Takano', imageUrl: '' },
    { id: 'your-lie-in-april', title: 'Your Lie in April', author: 'Naoshi Arakawa', imageUrl: '' },
    { id: 'a-silent-voice', title: 'A Silent Voice', author: 'Yoshitoki Oima', imageUrl: '' },
    { id: 'i-want-to-eat-your-pancreas', title: 'I Want to Eat Your Pancreas', author: 'Yoru Sumino', imageUrl: '' },
    { id: 'weathering-with-you', title: 'Weathering with You', author: 'Makoto Shinkai', imageUrl: '' },
    { id: 'your-name', title: 'Your Name', author: 'Makoto Shinkai', imageUrl: '' },
    { id: 'garden-of-words', title: 'Garden of Words', author: 'Makoto Shinkai', imageUrl: '' },
    { id: '5-centimeters-per-second', title: '5 Centimeters per Second', author: 'Makoto Shinkai', imageUrl: '' },
    { id: 'spirited-away', title: 'Spirited Away', author: 'Hayao Miyazaki', imageUrl: '' },
    { id: 'my-neighbor-totoro', title: 'My Neighbor Totoro', author: 'Hayao Miyazaki', imageUrl: '' },
    { id: 'princess-mononoke', title: 'Princess Mononoke', author: 'Hayao Miyazaki', imageUrl: '' },
    { id: 'howls-moving-castle', title: 'Howl\'s Moving Castle', author: 'Hayao Miyazaki', imageUrl: '' },
    { id: 'castle-in-the-sky', title: 'Castle in the Sky', author: 'Hayao Miyazaki', imageUrl: '' },
    { id: 'nausicaa', title: 'Nausicaä of the Valley of the Wind', author: 'Hayao Miyazaki', imageUrl: '' },
    { id: 'kiki-delivery-service', title: 'Kiki\'s Delivery Service', author: 'Hayao Miyazaki', imageUrl: '' },
    { id: 'porco-rosso', title: 'Porco Rosso', author: 'Hayao Miyazaki', imageUrl: '' },
    { id: 'the-wind-rises', title: 'The Wind Rises', author: 'Hayao Miyazaki', imageUrl: '' },
    { id: 'pom-poko', title: 'Pom Poko', author: 'Isao Takahata', imageUrl: '' },
    { id: 'grave-of-fireflies', title: 'Grave of the Fireflies', author: 'Isao Takahata', imageUrl: '' },
    { id: 'only-yesterday', title: 'Only Yesterday', author: 'Isao Takahata', imageUrl: '' },
    { id: 'my-neighbors-yamadas', title: 'My Neighbors the Yamadas', author: 'Isao Takahata', imageUrl: '' },
    { id: 'tale-of-princess-kaguya', title: 'The Tale of Princess Kaguya', author: 'Isao Takahata', imageUrl: '' },
    { id: 'akira', title: 'Akira', author: 'Katsuhiro Otomo', imageUrl: '' },
    { id: 'ghost-in-the-shell', title: 'Ghost in the Shell', author: 'Masamune Shirow', imageUrl: '' },
    { id: 'neon-genesis-evangelion', title: 'Neon Genesis Evangelion', author: 'Yoshiyuki Sadamoto', imageUrl: '' },
    { id: 'cowboy-bebop', title: 'Cowboy Bebop', author: 'Yutaka Nanten', imageUrl: '' },
    { id: 'trigun', title: 'Trigun', author: 'Yasuhiro Nightow', imageUrl: '' },
    { id: 'outlaw-star', title: 'Outlaw Star', author: 'Takehiko Itou', imageUrl: '' },
    { id: 'escaflowne', title: 'The Vision of Escaflowne', author: 'Hajime Yatate', imageUrl: '' },
    { id: 'record-of-lodoss-war', title: 'Record of Lodoss War', author: 'Ryo Mizuno', imageUrl: '' },
    { id: 'slayers', title: 'Slayers', author: 'Hajime Kanzaka', imageUrl: '' },
    { id: 'tenchi-muyo', title: 'Tenchi Muyo!', author: 'Hiroki Hayashi', imageUrl: '' },
    { id: 'el-hazard', title: 'El-Hazard', author: 'Hiroki Hayashi', imageUrl: '' },
    { id: 'ranma', title: 'Ranma ½', author: 'Rumiko Takahashi', imageUrl: '' },
    { id: 'urusei-yatsura', title: 'Urusei Yatsura', author: 'Rumiko Takahashi', imageUrl: '' },
    { id: 'maison-ikkoku', title: 'Maison Ikkoku', author: 'Rumiko Takahashi', imageUrl: '' },
    { id: 'inuyasha', title: 'Inuyasha', author: 'Rumiko Takahashi', imageUrl: '' },
    { id: 'mermaid-saga', title: 'Mermaid Saga', author: 'Rumiko Takahashi', imageUrl: '' },
    { id: 'one-pound-gospel', title: 'One Pound Gospel', author: 'Rumiko Takahashi', imageUrl: '' },
    { id: 'kyokai-no-rinne', title: 'Kyokai no Rinne', author: 'Rumiko Takahashi', imageUrl: '' },
    { id: 'mao', title: 'Mao', author: 'Rumiko Takahashi', imageUrl: '' },
    { id: 'dragon-ball-z', title: 'Dragon Ball Z', author: 'Akira Toriyama', imageUrl: '' },
    { id: 'dragon-ball-super', title: 'Dragon Ball Super', author: 'Akira Toriyama', imageUrl: '' },
    { id: 'dragon-ball-gt', title: 'Dragon Ball GT', author: 'Akira Toriyama', imageUrl: '' },
    { id: 'dr-slate', title: 'Dr. Slump', author: 'Akira Toriyama', imageUrl: '' },
    { id: 'sand-land', title: 'Sand Land', author: 'Akira Toriyama', imageUrl: '' },
    { id: 'chrono-trigger', title: 'Chrono Trigger', author: 'Akira Toriyama', imageUrl: '' },
    { id: 'blue-dragon', title: 'Blue Dragon', author: 'Akira Toriyama', imageUrl: '' },
    { id: 'jaco-galactic-patrolman', title: 'Jaco the Galactic Patrolman', author: 'Akira Toriyama', imageUrl: '' },
    { id: 'cowa', title: 'Cowa!', author: 'Akira Toriyama', imageUrl: '' },
    { id: 'kajika', title: 'Kajika', author: 'Akira Toriyama', imageUrl: '' },
    { id: 'neko-majin', title: 'Neko Majin', author: 'Akira Toriyama', imageUrl: '' },
    { id: 'tokyo-ghoul-re', title: 'Tokyo Ghoul:re', author: 'Sui Ishida', imageUrl: '' },
    { id: 'choujin-x', title: 'Choujin X', author: 'Sui Ishida', imageUrl: '' },
    { id: 'penisman', title: 'Penisman', author: 'Sui Ishida', imageUrl: '' },
    { id: 'hito-hitori-futari', title: 'Hito Hitori Futari', author: 'Sui Ishida', imageUrl: '' },
    { id: 'tokyo-ghoul-jack', title: 'Tokyo Ghoul: Jack', author: 'Sui Ishida', imageUrl: '' },
    { id: 'tokyo-ghoul-pinto', title: 'Tokyo Ghoul: Pinto', author: 'Sui Ishida', imageUrl: '' },
    { id: 'tokyo-ghoul-novel', title: 'Tokyo Ghoul Novel', author: 'Sui Ishida', imageUrl: '' },
    { id: 'tokyo-ghoul-art-book', title: 'Tokyo Ghoul Art Book', author: 'Sui Ishida', imageUrl: '' },
    { id: 'tokyo-ghoul-guide-book', title: 'Tokyo Ghoul Guide Book', author: 'Sui Ishida', imageUrl: '' },
    { id: 'tokyo-ghoul-calendar', title: 'Tokyo Ghoul Calendar', author: 'Sui Ishida', imageUrl: '' },
    { id: 'tokyo-ghoul-fan-book', title: 'Tokyo Ghoul Fan Book', author: 'Sui Ishida', imageUrl: '' },
    { id: 'tokyo-ghoul-official-book', title: 'Tokyo Ghoul Official Book', author: 'Sui Ishida', imageUrl: '' }
  ]);

  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [cacheStats, setCacheStats] = useState({ total: 0, expired: 0, valid: 0, versionMismatch: 0 });
  const [cachePerformance, setCachePerformance] = useState({ 
    cacheHitRate: 0, 
    totalImages: 0, 
    cachedImages: 0,
    loadTime: 0 
  });

  // 検索機能の状態変数
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof sampleManga>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // 画像取得の進捗表示
  const [imageProgress, setImageProgress] = useState({ current: 0, total: 0, status: '' });

  // 初期化時にテーマを設定と画像取得
  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined') {
      // 保存された設定を読み込み
      loadSettings();
      
      // 古いバージョンのキャッシュを自動クリア
      clearOldVersionCache();
      
      // まずキャッシュから画像を読み込み
      loadMangaImagesFromCache();
      updateCacheStats(); // Initialize cache stats
      
      // キャッシュにない画像のみを効率的に取得
      const checkAndLoadUncachedImages = () => {
        const uncachedManga = sampleManga.filter(manga => !manga.imageUrl);
        if (uncachedManga.length > 0) {
          console.log(`🔄 未キャッシュ画像の取得開始: ${uncachedManga.length}件 / 総数: ${sampleManga.length}件`);
          setImageProgress({ current: 0, total: uncachedManga.length, status: '画像取得中...' });
          
          // バッチサイズを大きくして効率化
          loadMangaImagesOptimized(uncachedManga, false);
        } else {
          console.log(`✅ 全ての画像がキャッシュに存在します`);
          setImageProgress({ current: sampleManga.length, total: sampleManga.length, status: '全ての画像がキャッシュ済み' });
          
          // 3秒後に進捗表示をクリア
          setTimeout(() => {
            setImageProgress({ current: 0, total: 0, status: '' });
          }, 3000);
        }
      };
      
      // 即座にチェックして実行
      checkAndLoadUncachedImages();
    }
  }, []);

  // 設定を読み込む関数
  const loadSettings = () => {
    try {
      // その他の設定も読み込み
      const savedSettings = localStorage.getItem('mangaU-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // 設定に基づいてUIを調整
        if (parsed.display?.compactMode) {
          // コンパクトモードの適用
          console.log('コンパクトモードが有効です');
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // 設定変更を監視するイベントリスナー
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme' || e.key === 'mangaU-settings') {
        console.log('設定が変更されました:', e.key);
        loadSettings();
      }
    };

    // ストレージ変更イベントを監視
    window.addEventListener('storage', handleStorageChange);
    
    // カスタムイベントで設定変更を監視（同じタブ内での変更）
    const handleCustomStorageChange = () => {
      console.log('カスタム設定変更イベントを受信');
      loadSettings();
    };
    
    window.addEventListener('mangaU-settings-changed', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mangaU-settings-changed', handleCustomStorageChange);
    };
  }, []);

  // 検索機能の実装
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setShowSearchResults(true);
    
    // 検索クエリを小文字に変換
    const query = searchQuery.toLowerCase().trim();
    
    // マンガデータから検索（タイトル、作者、ジャンル、タグ、説明文）
    const results = sampleManga.filter(manga => {
      const titleMatch = manga.title.toLowerCase().includes(query);
      const authorMatch = manga.author.toLowerCase().includes(query);
      
      // ジャンル検索（manga-data.tsから詳細情報を取得）
      const mangaDetails = require('@/lib/manga-data').getMangaById(manga.id);
      if (mangaDetails) {
        const genreMatch = mangaDetails.genres?.some((genre: string) => 
          genre.toLowerCase().includes(query)
        ) || false;
        
        const tagMatch = mangaDetails.tags?.some((tag: string) => 
          tag.toLowerCase().includes(query)
        ) || false;
        
        const descriptionMatch = mangaDetails.description?.toLowerCase().includes(query) || false;
        
        return titleMatch || authorMatch || genreMatch || tagMatch || descriptionMatch;
      }
      
      return titleMatch || authorMatch;
    });
    
    // 検索結果を設定
    setSearchResults(results);
    setIsSearching(false);
    
    // 検索結果がない場合の処理
    if (results.length === 0) {
      console.log('検索結果が見つかりませんでした:', query);
    } else {
      console.log(`${results.length}件の検索結果が見つかりました:`, query);
    }
  };

  // 検索をクリアする関数
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // キャッシュから画像を読み込む関数
  const loadMangaImagesFromCache = () => {
    const { getCachedImage } = require('@/lib/manga-images');
    const startTime = performance.now();
    
    // キャッシュから画像を読み込み、即座に表示
    const updatedManga = sampleManga.map(manga => {
      const cacheKey = `manga-image:${manga.title}:${manga.author}`;
      const cachedImage = getCachedImage(cacheKey);
      
      if (cachedImage) {
        console.log(`📸 キャッシュから画像を取得: ${manga.title}`);
        return { ...manga, imageUrl: cachedImage };
      } else {
        console.log(`🔄 キャッシュに画像なし: ${manga.title}`);
        return manga;
      }
    });
    
    // 即座に状態を更新
    setSampleManga(updatedManga);
    
    // パフォーマンスを計算
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    // キャッシュヒット率を計算
    const totalImages = updatedManga.length;
    const cachedImages = updatedManga.filter(manga => manga.imageUrl).length;
    const cacheHitRate = totalImages > 0 ? (cachedImages / totalImages) * 100 : 0;
    
    setCachePerformance({
      cacheHitRate: Math.round(cacheHitRate),
      totalImages,
      cachedImages,
      loadTime: Math.round(loadTime)
    });
    
    console.log(`📊 キャッシュ読み込み完了: ${cachedImages}/${totalImages}件 (${cacheHitRate.toFixed(1)}%) - ${Math.round(loadTime)}ms`);
    
    // キャッシュにない画像があれば、APIから取得
    const uncachedManga = updatedManga.filter(manga => !manga.imageUrl);
    if (uncachedManga.length > 0) {
      console.log(`🔄 キャッシュにない画像: ${uncachedManga.length}件`);
    } else {
      console.log(`✅ 全ての画像がキャッシュに存在します`);
    }
  };

  // 最適化された画像取得関数（バッチサイズを大きくして効率化）
  const loadMangaImagesOptimized = async (mangaList: typeof sampleManga, forceRefresh: boolean = false) => {
    if (loadingImages) return;
    
    setLoadingImages(true);
    try {
      console.log(`🔄 最適化された画像取得開始: ${mangaList.length}件`);
      
      // バッチサイズを10に増加（効率化）
      const BATCH_SIZE = 10;
      const DELAY_BETWEEN_BATCHES = 500; // バッチ間の遅延を500msに短縮
      
      const imageMap = new Map<string, string>();
      
      for (let i = 0; i < mangaList.length; i += BATCH_SIZE) {
        const batch = mangaList.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(mangaList.length / BATCH_SIZE);
        
        console.log(`📦 バッチ処理 ${batchNumber}/${totalBatches}: ${batch.length}件`);
        
        // 進捗表示を更新
        setImageProgress(prev => ({
          ...prev,
          current: i,
          status: `バッチ処理中: ${batchNumber}/${totalBatches}`
        }));
        
        // バッチ内で並列処理
        const batchPromises = batch.map(async (manga) => {
          try {
            const { getMangaCoverImage } = require('@/lib/manga-images');
            const imageUrl = await getMangaCoverImage(manga.title, manga.author, forceRefresh);
            imageMap.set(manga.title, imageUrl);
            
            if (imageUrl) {
              console.log(`✅ 画像取得成功: ${manga.title}`);
            } else {
              console.log(`❌ 画像取得失敗: ${manga.title}`);
            }
            
            return { title: manga.title, success: !!imageUrl };
          } catch (error) {
            console.error(`❌ 画像取得エラー (${manga.title}):`, error);
            imageMap.set(manga.title, '');
            return { title: manga.title, success: false };
          }
        });
        
        // バッチの完了を待つ
        const batchResults = await Promise.all(batchPromises);
        const successCount = batchResults.filter(r => r.success).length;
        console.log(`📊 バッチ完了: ${successCount}/${batch.length}件成功`);
        
        // 最後のバッチでない場合は遅延
        if (i + BATCH_SIZE < mangaList.length) {
          console.log(`⏳ 次のバッチまで${DELAY_BETWEEN_BATCHES}ms待機...`);
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
        }
      }
      
      // 画像URLを更新
      setSampleManga(prevManga => 
        prevManga.map(manga => ({
          ...manga,
          imageUrl: imageMap.get(manga.title) || manga.imageUrl
        }))
      );
      
      setImagesLoaded(true);
      
      // キャッシュ統計を更新
      updateCacheStats();
      
      // 取得結果を表示
      const successCount = Array.from(imageMap.values()).filter(url => url).length;
      console.log(`✅ 最適化された画像取得完了: ${successCount}件 / ${mangaList.length}件`);
      
      // 進捗表示を更新
      setImageProgress({ current: mangaList.length, total: mangaList.length, status: `画像取得完了: ${successCount}件成功` });
      
      // 3秒後に進捗表示をクリア
      setTimeout(() => {
        setImageProgress({ current: 0, total: 0, status: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Error in optimized image loading:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  // 漫画の表紙画像を取得する関数
  const loadMangaImages = async (forceRefresh: boolean = false) => {
    if (loadingImages) return;
    
    setLoadingImages(true);
    try {
      console.log(`🔄 Loading manga images (forceRefresh: ${forceRefresh})...`);
      
      // 画像がない漫画の数を表示
      const uncachedManga = sampleManga.filter(manga => !manga.imageUrl);
      console.log(`📊 画像取得対象: ${uncachedManga.length}件 / 総数: ${sampleManga.length}件`);
      
      const imageMap = await getMangaCoverImages(sampleManga, forceRefresh);
      
      // 画像URLを更新
      setSampleManga(prevManga => 
        prevManga.map(manga => ({
          ...manga,
          imageUrl: imageMap.get(manga.title) || manga.imageUrl
        }))
      );
      
      setImagesLoaded(true);
      
      // キャッシュ統計を更新
      updateCacheStats();
      
      // 取得結果を表示
      const successCount = Array.from(imageMap.values()).filter(url => url).length;
      console.log(`✅ 画像取得完了: ${successCount}件 / ${sampleManga.length}件`);
      
      // 進捗表示を更新
      setImageProgress({ current: sampleManga.length, total: sampleManga.length, status: `画像取得完了: ${successCount}件成功` });
      
      // 3秒後に進捗表示をクリア
      setTimeout(() => {
        setImageProgress({ current: 0, total: 0, status: '' });
      }, 3000);
    } catch (error) {
      console.error('Error loading manga images:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  // キャッシュ統計を更新
  const updateCacheStats = () => {
    const stats = getCacheStats();
    setCacheStats(stats);
    console.log('📊 Cache stats updated:', stats);
  };

  // キャッシュをクリア
  const handleClearCache = () => {
    console.log('🗑️ Clearing image cache...');
    clearImageCache();
    updateCacheStats();
    // キャッシュクリア後に究極精度版の画像を強制再取得
    loadMangaImages(true);
  };

  // 究極精度版の画像を強制再取得
  const handleForceRefresh = () => {
    console.log('🔄 Force refreshing all manga images...');
    // 古いバージョンのキャッシュをクリアしてから強制再取得
    clearOldVersionCache();
    loadMangaImages(true);
  };

  // スクロール処理の共通関数
  const handleScroll = (containerId: string, direction: 'left' | 'right') => {
    if (typeof window !== 'undefined') {
      const container = document.getElementById(containerId);
      if (container) {
        const scrollAmount = direction === 'left' ? -400 : 400;
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: isDarkMode ? '#111827' : '#ffffff', 
      color: isDarkMode ? '#ffffff' : '#000000',
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      {/* スピナーアニメーション用のCSS */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      {/* 固定ヘッダー - 高さを固定し、8pxグリッドシステムに従う */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: '64px',
        backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: isDarkMode ? '1px solid rgba(55, 65, 81, 0.5)' : '1px solid rgba(209, 213, 219, 0.5)',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          height: '100%',
          padding: '0 1rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '100%'
          }}>
            {/* 左側：サイトロゴ */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#60A5FA',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}>
                MangaU
              </h1>
            </div>

            {/* 右側：ナビゲーションリンクとテーマ切り替えボタン */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {/* 画像取得進捗表示 */}
              {imageProgress.total > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  fontSize: '0.875rem'
                }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #60A5FA',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: imageProgress.current < imageProgress.total ? 'spin 1s linear infinite' : 'none'
                  }} />
                  <span style={{ color: isDarkMode ? '#9CA3AF' : '#6B7280' }}>
                    {imageProgress.status}
                  </span>
                  {imageProgress.current < imageProgress.total && (
                    <span style={{ color: '#60A5FA', fontWeight: '500' }}>
                      {imageProgress.current}/{imageProgress.total}
                    </span>
                  )}
                </div>
              )}

              {/* デスクトップナビゲーション */}
              <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                {/* Home リンク */}
                <a 
                  href="#home" 
                  style={{
                    color: isDarkMode ? '#F9FAFB' : '#374151',
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#60A5FA'}
                  onMouseLeave={(e) => e.currentTarget.style.color = isDarkMode ? '#F9FAFB' : '#374151'}
                >
                  Home
                </a>

                {/* Rankings リンク（ドロップダウンメニュー付き） */}
                <div style={{ position: 'relative' }}>
                  <button
                    onMouseEnter={(e) => {
                      setIsRankingsOpen(true);
                      e.currentTarget.style.color = '#60A5FA';
                    }}
                    onMouseLeave={(e) => {
                      setIsRankingsOpen(false);
                      e.currentTarget.style.color = isDarkMode ? '#F9FAFB' : '#374151';
                    }}
                    style={{
                      color: isDarkMode ? '#F9FAFB' : '#374151',
                      background: 'none',
                      border: 'none',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'color 0.2s'
                    }}
                  >
                    Rankings
                    <svg 
                      style={{ marginLeft: '0.5rem', width: '20px', height: '20px', transition: 'transform 0.2s' }} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* ドロップダウンメニュー */}
                  <div 
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '0.5rem',
                      width: '12rem',
                      backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB',
                      borderRadius: '0.5rem',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      border: isDarkMode ? '1px solid rgba(55, 65, 81, 0.5)' : '1px solid rgba(209, 213, 219, 0.5)',
                      padding: '0.5rem 0',
                      zIndex: 50,
                      transition: 'all 0.2s ease-in-out',
                      opacity: isRankingsOpen ? 1 : 0,
                      transform: isRankingsOpen ? 'translateY(0)' : 'translateY(-0.5rem)',
                      pointerEvents: isRankingsOpen ? 'auto' : 'none'
                    }}
                    onMouseEnter={() => setIsRankingsOpen(true)}
                    onMouseLeave={() => setIsRankingsOpen(false)}
                  >
                    <a 
                      href="#yearly" 
                      style={{
                        display: 'block',
                        padding: '0.5rem 1rem',
                        color: isDarkMode ? '#F9FAFB' : '#374151',
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                        e.currentTarget.style.color = '#60A5FA';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = isDarkMode ? '#F9FAFB' : '#374151';
                      }}
                    >
                      Yearly
                    </a>
                    <a 
                      href="#monthly" 
                      style={{
                        display: 'block',
                        padding: '0.5rem 1rem',
                        color: isDarkMode ? '#F9FAFB' : '#374151',
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                        e.currentTarget.style.color = '#60A5FA';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = isDarkMode ? '#F9FAFB' : '#374151';
                      }}
                    >
                      Monthly
                    </a>
                    <a 
                      href="#by-genre" 
                      style={{
                        display: 'block',
                        padding: '0.5rem 1rem',
                        color: isDarkMode ? '#F9FAFB' : '#374151',
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                        e.currentTarget.style.color = '#60A5FA';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = isDarkMode ? '#F9FAFB' : '#374151';
                      }}
                    >
                      By Genre
                    </a>
                  </div>
                </div>

                {/* Search リンク */}
                <a 
                  href="#search" 
                  style={{
                    color: isDarkMode ? '#F9FAFB' : '#374151',
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#60A5FA'}
                  onMouseLeave={(e) => e.currentTarget.style.color = isDarkMode ? '#F9FAFB' : '#374151'}
                >
                  Search
                </a>
              </nav>

              {/* 画像再読み込みボタン */}
              <button
                onClick={() => loadMangaImages(false)}
                disabled={loadingImages}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  backgroundColor: loadingImages ? '#6B7280' : '#10B981',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  cursor: loadingImages ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  marginRight: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  if (!loadingImages) {
                    e.currentTarget.style.backgroundColor = '#059669';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loadingImages) {
                    e.currentTarget.style.backgroundColor = '#10B981';
                  }
                }}
                title="Reload manga images"
              >
                {loadingImages ? 'Loading...' : '🔄'}
              </button>

              <button
                onClick={handleForceRefresh}
                disabled={loadingImages}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  backgroundColor: loadingImages ? '#6B7280' : '#10B981',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  cursor: loadingImages ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  marginRight: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  if (!loadingImages) {
                    e.currentTarget.style.backgroundColor = '#059669';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loadingImages) {
                    e.currentTarget.style.backgroundColor = '#10B981';
                  }
                }}
                title="Force refresh all images (clear old cache)"
              >
                {loadingImages ? 'Loading...' : '🚀'}
              </button>

              <button
                onClick={handleClearCache}
                disabled={loadingImages}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  backgroundColor: loadingImages ? '#6B7280' : '#EF4444',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  cursor: loadingImages ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  marginRight: '0.75rem'
                }}
                onMouseEnter={(e) => {
                  if (!loadingImages) {
                    e.currentTarget.style.backgroundColor = '#DC2626';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loadingImages) {
                    e.currentTarget.style.backgroundColor = '#EF4444';
                  }
                }}
                title="Clear image cache"
              >
                🗑️
              </button>

              {/* キャッシュ統計表示 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.75rem',
                color: isDarkMode ? '#9CA3AF' : '#6B7280',
                marginRight: '0.75rem',
                transition: 'color 0.3s ease'
              }}>
                <span style={{ marginRight: '0.5rem' }}>📊</span>
                <span>Cache: {cacheStats.valid}/{cacheStats.total}</span>
                {cacheStats.versionMismatch > 0 && (
                  <span style={{ marginLeft: '0.5rem', color: '#F59E0B' }}>
                    (⚠️ {cacheStats.versionMismatch} old version)
                  </span>
                )}
              </div>

              {/* キャッシュパフォーマンス表示 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.75rem',
                color: cachePerformance.cacheHitRate >= 80 ? '#10B981' : 
                       cachePerformance.cacheHitRate >= 50 ? '#F59E0B' : '#EF4444',
                marginRight: '0.75rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: isDarkMode ? 
                  (cachePerformance.cacheHitRate >= 80 ? 'rgba(16, 185, 129, 0.1)' : 
                   cachePerformance.cacheHitRate >= 50 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)') :
                  (cachePerformance.cacheHitRate >= 80 ? 'rgba(16, 185, 129, 0.05)' : 
                   cachePerformance.cacheHitRate >= 50 ? 'rgba(245, 158, 11, 0.05)' : 'rgba(239, 68, 68, 0.05)'),
                borderRadius: '0.375rem',
                border: isDarkMode ? 
                  (cachePerformance.cacheHitRate >= 80 ? '1px solid rgba(16, 185, 129, 0.2)' : 
                   cachePerformance.cacheHitRate >= 50 ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)') :
                  (cachePerformance.cacheHitRate >= 80 ? '1px solid rgba(16, 185, 129, 0.1)' : 
                   cachePerformance.cacheHitRate >= 50 ? '1px solid rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)'),
                transition: 'background-color 0.3s ease, border-color 0.3s ease'
              }}>
                <span style={{ marginRight: '0.5rem' }}>
                  {cachePerformance.cacheHitRate >= 80 ? '⚡' : 
                   cachePerformance.cacheHitRate >= 50 ? '⚠️' : '❌'}
                </span>
                <span>Hit: {cachePerformance.cacheHitRate}%</span>
                <span style={{ marginLeft: '0.5rem', color: isDarkMode ? '#6B7280' : '#9CA3AF' }}>
                  ({cachePerformance.cachedImages}/{cachePerformance.totalImages})
                </span>
                {cachePerformance.loadTime > 0 && (
                  <span style={{ marginLeft: '0.5rem', color: isDarkMode ? '#6B7280' : '#9CA3AF' }}>
                    {cachePerformance.loadTime}ms
                  </span>
                )}
              </div>

              {/* 設定ボタン */}
              <button
                onClick={() => window.location.href = '/settings'}
                style={{
                  padding: '0.5rem',
                  borderRadius: '50%',
                  backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6',
                  border: isDarkMode ? '1px solid rgba(55, 65, 81, 0.5)' : '1px solid rgba(209, 213, 219, 0.5)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                aria-label="Settings"
                title="設定"
              >
                <svg
                  style={{
                    width: '24px',
                    height: '24px',
                    color: '#60A5FA',
                    transition: 'transform 0.3s'
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>

              {/* モバイルメニューボタン */}
              <div style={{ display: 'none' }}>
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  style={{
                    color: isDarkMode ? '#F9FAFB' : '#374151',
                    background: 'none',
                    border: 'none',
                    padding: '0.25rem',
                    cursor: 'pointer',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#60A5FA'}
                  onMouseLeave={(e) => e.currentTarget.style.color = isDarkMode ? '#F9FAFB' : '#374151'}
                >
                  {isMobileMenuOpen ? (
                    <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* モバイルメニュー */}
          {isMobileMenuOpen && (
            <div style={{
              backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB',
              borderTop: isDarkMode ? '1px solid rgba(55, 65, 81, 0.5)' : '1px solid rgba(209, 213, 219, 0.5)',
              padding: '0.5rem 1rem',
              transition: 'background-color 0.3s ease, border-color 0.3s ease'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <a 
                  href="#home" 
                  style={{
                    display: 'block',
                    padding: '0.75rem 1rem',
                    color: isDarkMode ? '#F9FAFB' : '#374151',
                    textDecoration: 'none',
                    borderRadius: '0.375rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.color = '#60A5FA';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = isDarkMode ? '#F9FAFB' : '#374151';
                  }}
                >
                  Home
                </a>
                <a 
                  href="#rankings" 
                  style={{
                    display: 'block',
                    padding: '0.75rem 1rem',
                    color: isDarkMode ? '#F9FAFB' : '#374151',
                    textDecoration: 'none',
                    borderRadius: '0.375rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.color = '#60A5FA';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = isDarkMode ? '#F9FAFB' : '#374151';
                  }}
                >
                  Rankings
                </a>
                <a 
                  href="#search" 
                  style={{
                    display: 'block',
                    padding: '0.75rem 1rem',
                    color: isDarkMode ? '#F9FAFB' : '#374151',
                    textDecoration: 'none',
                    borderRadius: '0.375rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.color = '#60A5FA';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = isDarkMode ? '#F9FAFB' : '#374151';
                  }}
                >
                  Search
                </a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* メインコンテンツ（ヘッダーの高さ分のマージンを追加） */}
      <main style={{ paddingTop: '64px' }}>
        {/* ヒーローセクション */}
        <section style={{
          padding: '4rem 1rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '1.5rem',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              Discover Amazing Manga
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: '#E5E7EB',
              maxWidth: '40rem',
              margin: '0 auto 2rem auto'
            }}>
              Explore thousands of manga series, read reviews, and discover your next favorite story
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {/* 検索ボックス */}
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                maxWidth: '500px',
                width: '100%'
              }}>
                <input
                  type="text"
                  placeholder="マンガタイトル、作者名、ジャンル、タグで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    paddingRight: '3rem',
                    fontSize: '1.125rem',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#60A5FA';
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                />
                <button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim()}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: searchQuery.trim() ? '#60A5FA' : 'rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: searchQuery.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (searchQuery.trim()) {
                      e.currentTarget.style.backgroundColor = '#3B82F6';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (searchQuery.trim()) {
                      e.currentTarget.style.backgroundColor = '#60A5FA';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 検索結果セクション */}
        {showSearchResults && (
          <section style={{
            padding: '2rem 1rem',
            backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB',
            borderBottom: isDarkMode ? '1px solid rgba(55, 65, 81, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)',
            transition: 'background-color 0.3s ease, border-color 0.3s ease'
          }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
              {/* 検索結果ヘッダー */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: isDarkMode ? '#ffffff' : '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    検索結果
                  </h2>
                  <p style={{
                    fontSize: '1rem',
                    color: isDarkMode ? '#9CA3AF' : '#6B7280'
                  }}>
                    "{searchQuery}" の検索結果: {searchResults.length}件
                  </p>
                </div>
                
                {/* 検索クリアボタン */}
                <button
                  onClick={clearSearch}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: isDarkMode ? '#374151' : '#E5E7EB',
                    color: isDarkMode ? '#9CA3AF' : '#6B7280',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#4B5563' : '#D1D5DB';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#E5E7EB';
                  }}
                >
                  検索をクリア
                </button>
              </div>

              {/* 検索結果の表示 */}
              {isSearching ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: isDarkMode ? '#9CA3AF' : '#6B7280'
                }}>
                  🔍 検索中...
                </div>
              ) : searchResults.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '1.5rem',
                  padding: '1rem 0'
                }}>
                  {searchResults.map((manga, index) => (
                    <div key={index} style={{ textAlign: 'center' }}>
                      <MangaCard
                        imageUrl={manga.imageUrl || `https://via.placeholder.com/200x300/374151/9CA3AF?text=${manga.title.charAt(0)}`}
                        title={manga.title}
                        author={manga.author}
                        mangaId={manga.id}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: isDarkMode ? '#9CA3AF' : '#6B7280'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                  <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                    検索結果が見つかりませんでした
                  </p>
                  <p style={{ fontSize: '0.875rem' }}>
                    「{searchQuery}」に一致するマンガが見つかりませんでした。<br />
                    別のキーワードで検索してみてください。
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 横スクロールコンテンツリスト（10行） - 8pxグリッドシステムに従う */}
        {[
          { title: 'Top Rated', color: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' },
          { title: 'Action', color: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' },
          { title: 'Romance', color: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)' },
          { title: 'Fantasy', color: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' },
          { title: 'Adventure', color: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
          { title: 'Comedy', color: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' },
          { title: 'Drama', color: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)' },
          { title: 'Horror', color: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)' },
          { title: 'Mystery', color: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)' },
          { title: 'Slice of Life', color: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)' }
        ].map((section, sectionIndex) => (
          <section key={section.title} style={{
            padding: '2rem 1rem',
            background: section.color,
            marginBottom: '1rem'
          }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
              {/* セクションタイトルを削除 */}
              
              {/* 横スクロールリスト - 洗練されたスクロールナビゲーション */}
              <div style={{ position: 'relative' }}>
                {/* 左スクロールボタン */}
                <button
                  style={{
                    position: 'absolute',
                    left: '-1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '50%',
                    padding: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: isDarkMode ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(209, 213, 219, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    opacity: 0,
                    pointerEvents: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.pointerEvents = 'auto';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0';
                    e.currentTarget.style.pointerEvents = 'none';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                  onClick={() => handleScroll(`scroll-container-${sectionIndex}`, 'left')}
                >
                  <svg style={{ width: '24px', height: '24px', color: isDarkMode ? '#374151' : '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* 右スクロールボタン */}
                <button
                  style={{
                    position: 'absolute',
                    right: '-1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '50%',
                    padding: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: isDarkMode ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(209, 213, 219, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    opacity: 0,
                    pointerEvents: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.pointerEvents = 'auto';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0';
                    e.currentTarget.style.pointerEvents = 'none';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                  onClick={() => handleScroll(`scroll-container-${sectionIndex}`, 'right')}
                >
                  <svg style={{ width: '24px', height: '24px', color: isDarkMode ? '#374151' : '#6B7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* スクロールコンテナ - 8pxグリッドシステムに従う */}
                <div 
                  id={`scroll-container-${sectionIndex}`}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    overflowX: 'auto',
                    paddingBottom: '1rem',
                    paddingLeft: '0.5rem',
                    paddingRight: '0.5rem',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                >
                  {/* マンガカード（10個） - MangaCardコンポーネントを使用 */}
                  {sampleManga.map((manga, index) => (
                    <div
                      key={index}
                      style={{
                        flexShrink: 0,
                        width: '192px' // w-48
                      }}
                    >
                      {loadingImages && !manga.imageUrl ? (
                        // ローディング中のプレースホルダー
                        <div style={{
                          width: '192px',
                          height: '288px',
                          backgroundColor: isDarkMode ? '#374151' : '#E5E7EB',
                          borderRadius: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isDarkMode ? '#9CA3AF' : '#6B7280',
                          fontSize: '0.875rem',
                          transition: 'background-color 0.3s ease, color 0.3s ease'
                        }}>
                          Loading...
                        </div>
                      ) : (
                        <MangaCard
                          imageUrl={manga.imageUrl || `https://via.placeholder.com/192x288/374151/9CA3AF?text=${manga.title.charAt(0)}`}
                          title={manga.title}
                          author={manga.author}
                          mangaId={manga.id}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}
      </main>

      {/* カスタムCSS */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          display: none;
        }
        body {
          margin: 0;
          padding: 0;
          transition: background-color 0.3s ease, color 0.3s ease;
        }
        
        /* テーマ切り替え時のスムーズなアニメーション */
        * {
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }
        
        /* ダークモード時のスタイル */
        .dark {
          background-color: #111827;
          color: #ffffff;
        }
        
        /* ライトモード時のスタイル */
        .light {
          background-color: #ffffff;
          color: #000000;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
