/**
 * 漫画データの型定義とサンプルデータ
 */

export interface MangaDetails {
  id: string;
  title: string;
  author: string;
  imageUrl: string;
  description: string;
  isCompleted: boolean;
  totalVolumes: number;
  currentVolume: number;
  genres: string[];
  rating: number;
  reviewCount: number;
  publicationYear: number;
  publisher: string;
  status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  tags: string[];
  relatedManga: string[];
}

export interface MangaReview {
  id: string;
  mangaId: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserMangaList {
  userId: string;
  wantToRead: string[]; // 読みたい漫画のID
  currentlyReading: string[]; // 現在読んでいる漫画のID
  completed: string[]; // 読了済み漫画のID
  dropped: string[]; // 読むのをやめた漫画のID
}

// サンプル漫画データ
export const sampleMangaDetails: MangaDetails[] = [
  {
    id: 'one-piece',
    title: 'One Piece',
    author: 'Eiichiro Oda',
    imageUrl: '',
    description: '海賊王を目指す少年モンキー・D・ルフィと彼の仲間たちの壮大な冒険物語。悪魔の実を食べてゴム人間になったルフィは、伝説の海賊王ゴールド・ロジャーが残した「ONE PIECE」を求めて、危険なグランドラインを航海する。',
    isCompleted: false,
    totalVolumes: 108,
    currentVolume: 108,
    genres: ['アクション', 'アドベンチャー', 'コメディ', 'ファンタジー'],
    rating: 4.8,
    reviewCount: 15420,
    publicationYear: 1997,
    publisher: '集英社',
    status: 'ongoing',
    tags: ['海賊', '冒険', '友情', '成長', '戦闘'],
    relatedManga: ['naruto', 'dragon-ball', 'bleach']
  },
  {
    id: 'naruto',
    title: 'Naruto',
    author: 'Masashi Kishimoto',
    imageUrl: '',
    description: '忍者の里・木ノ葉隠れの里に住む少年・うずまきナルトの物語。九尾の狐が封印されたナルトは、忍者の学校で修行を重ね、忍界大戦を経て成長していく。忍者の世界の真実と、平和への道筋を探る壮大な物語。',
    isCompleted: true,
    totalVolumes: 72,
    currentVolume: 72,
    genres: ['アクション', 'アドベンチャー', 'ファンタジー', '戦闘'],
    rating: 4.6,
    reviewCount: 12850,
    publicationYear: 1999,
    publisher: '集英社',
    status: 'completed',
    tags: ['忍者', '戦闘', '成長', '友情', '復讐'],
    relatedManga: ['one-piece', 'dragon-ball', 'bleach']
  },
  {
    id: 'dragon-ball',
    title: 'Dragon Ball',
    author: 'Akira Toriyama',
    imageUrl: '',
    description: '伝説のドラゴンボールを集めることで願いが叶うという設定のもと、主人公・孫悟空の成長と冒険を描いた作品。武道会での戦い、地球を脅かす強敵との戦い、そして宇宙規模の戦いまで、様々な戦闘シーンが魅力。',
    isCompleted: true,
    totalVolumes: 42,
    currentVolume: 42,
    genres: ['アクション', 'アドベンチャー', 'ファンタジー', 'コメディ'],
    rating: 4.7,
    reviewCount: 9850,
    publicationYear: 1984,
    publisher: '集英社',
    status: 'completed',
    tags: ['武道', '戦闘', '成長', '友情', '宇宙'],
    relatedManga: ['one-piece', 'naruto', 'bleach']
  },
  {
    id: 'attack-on-titan',
    title: 'Attack on Titan',
    author: 'Hajime Isayama',
    imageUrl: '',
    description: '人類を襲う巨大な人型生物「巨人」との戦いを描いた作品。人類は巨大な壁に囲まれた都市に住み、立体機動装置を使って巨人と戦う。主人公・エレン・イェーガーの成長と、巨人の正体を巡る謎解きが物語の核心。',
    isCompleted: true,
    totalVolumes: 34,
    currentVolume: 34,
    genres: ['アクション', 'ドラマ', 'ファンタジー', '戦争'],
    rating: 4.9,
    reviewCount: 18750,
    publicationYear: 2009,
    publisher: '講談社',
    status: 'completed',
    tags: ['巨人', '戦闘', '謎解き', '戦争', '成長'],
    relatedManga: ['demon-slayer', 'jujutsu-kaisen', 'chainsaw-man']
  },
  {
    id: 'my-hero-academia',
    title: 'My Hero Academia',
    author: 'Kohei Horikoshi',
    imageUrl: '',
    description: '個性（クイーク）を持つ人々が当たり前になった世界で、ヒーローを目指す少年・緑谷出久の成長を描く。個性を持たない出久は、伝説のヒーロー・オールマイトから個性を継承し、ヒーロー養成学校で仲間と共に成長していく。',
    isCompleted: false,
    totalVolumes: 38,
    currentVolume: 38,
    genres: ['アクション', 'ファンタジー', '学校', 'ヒーロー'],
    rating: 4.5,
    reviewCount: 11200,
    publicationYear: 2014,
    publisher: '集英社',
    status: 'ongoing',
    tags: ['ヒーロー', '学校', '成長', '友情', '戦闘'],
    relatedManga: ['one-piece', 'naruto', 'dragon-ball']
  },
  {
    id: 'demon-slayer',
    title: 'Demon Slayer',
    author: 'Koyoharu Gotouge',
    imageUrl: '',
    description: '鬼に家族を殺された少年・竈門炭治郎が、妹の禰豆子を人間に戻すため、鬼殺隊の剣士として鬼と戦う物語。美しい絵柄と感動的なストーリーで人気を博し、アニメ化も大成功を収めた。',
    isCompleted: true,
    totalVolumes: 23,
    currentVolume: 23,
    genres: ['アクション', 'ファンタジー', '歴史', '戦闘'],
    rating: 4.8,
    reviewCount: 16500,
    publicationYear: 2016,
    publisher: '集英社',
    status: 'completed',
    tags: ['鬼', '剣士', '戦闘', '家族', '成長'],
    relatedManga: ['attack-on-titan', 'jujutsu-kaisen', 'chainsaw-man']
  },
  {
    id: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    author: 'Gege Akutami',
    imageUrl: '',
    description: '呪術師を目指す少年・虎杖悠仁の物語。呪霊を祓う呪術師として、仲間と共に様々な呪霊や呪術師と戦いながら成長していく。現代的な設定と独特の世界観が特徴。',
    isCompleted: false,
    totalVolumes: 25,
    currentVolume: 25,
    genres: ['アクション', 'ファンタジー', 'ホラー', '戦闘'],
    rating: 4.7,
    reviewCount: 14300,
    publicationYear: 2018,
    publisher: '集英社',
    status: 'ongoing',
    tags: ['呪術', '戦闘', '成長', '友情', '現代'],
    relatedManga: ['demon-slayer', 'chainsaw-man', 'attack-on-titan']
  },
  {
    id: 'chainsaw-man',
    title: 'Chainsaw Man',
    author: 'Tatsuki Fujimoto',
    imageUrl: '',
    description: 'デビルハンターを目指す少年・デンジの物語。愛犬ポチタと融合してチェーンソーマンとなったデンジは、デビルと戦いながら、人間としての成長を遂げていく。独特の世界観とキャラクターが魅力。',
    isCompleted: false,
    totalVolumes: 15,
    currentVolume: 15,
    genres: ['アクション', 'ファンタジー', 'ホラー', '戦闘'],
    rating: 4.6,
    reviewCount: 9800,
    publicationYear: 2018,
    publisher: '集英社',
    status: 'ongoing',
    tags: ['デビル', '戦闘', '成長', '友情', '現代'],
    relatedManga: ['jujutsu-kaisen', 'demon-slayer', 'attack-on-titan']
  },
  {
    id: 'spy-x-family',
    title: 'Spy x Family',
    author: 'Tatsuya Endo',
    imageUrl: '',
    description: 'スパイ、暗殺者、超能力者という3人の秘密を持つ家族の日常を描いた作品。任務のため偽装結婚した夫婦と養女の3人が、本当の家族になっていく過程を、アクションとコメディを交えて描く。',
    isCompleted: false,
    totalVolumes: 12,
    currentVolume: 12,
    genres: ['アクション', 'コメディ', 'スパイ', '家族'],
    rating: 4.8,
    reviewCount: 12500,
    publicationYear: 2019,
    publisher: '集英社',
    status: 'ongoing',
    tags: ['スパイ', '家族', 'コメディ', 'アクション', '日常'],
    relatedManga: ['my-hero-academia', 'one-piece', 'naruto']
  },
  {
    id: 'blue-lock',
    title: 'Blue Lock',
    author: 'Muneyuki Kaneshiro',
    imageUrl: '',
    description: '日本サッカー界を変革するため、300人の高校生FWを集めて行われる「ブルーロック」計画。主人公・潔世一は、この過酷な環境でサッカー選手としての才能を開花させ、日本代表のエースストライカーを目指す。',
    isCompleted: false,
    totalVolumes: 28,
    currentVolume: 28,
    genres: ['スポーツ', 'アクション', 'ドラマ'],
    rating: 4.4,
    reviewCount: 3200,
    publicationYear: 2018,
    publisher: '講談社',
    status: 'ongoing',
    tags: ['サッカー', 'スポーツ', '成長', '戦闘', '友情'],
    relatedManga: ['haikyu', 'kuroko-no-basket', 'yowamushi-pedal']
  },
  // 追加の漫画データ
  {
    id: 'bleach',
    title: 'Bleach',
    author: 'Tite Kubo',
    imageUrl: '',
    description: '死神の力を得た高校生・黒崎一護の物語。虚と呼ばれる悪霊と戦いながら、死神としての使命を果たし、仲間たちと共に様々な困難に立ち向かう。',
    isCompleted: true,
    totalVolumes: 74,
    currentVolume: 74,
    genres: ['アクション', 'ファンタジー', '戦闘'],
    rating: 4.5,
    reviewCount: 11200,
    publicationYear: 2001,
    publisher: '集英社',
    status: 'completed',
    tags: ['死神', '戦闘', '友情', '成長', '霊魂'],
    relatedManga: ['one-piece', 'naruto', 'dragon-ball']
  },
  {
    id: 'fairy-tail',
    title: 'Fairy Tail',
    author: 'Hiro Mashima',
    imageUrl: '',
    description: '魔法使いのギルド「フェアリーテイル」に所属する少女・ルーシィと、火の滅竜魔導士・ナツの冒険物語。仲間たちと共に様々な任務をこなし、ギルドの絆を深めていく。',
    isCompleted: true,
    totalVolumes: 63,
    currentVolume: 63,
    genres: ['アクション', 'ファンタジー', 'コメディ'],
    rating: 4.3,
    reviewCount: 8900,
    publicationYear: 2006,
    publisher: '講談社',
    status: 'completed',
    tags: ['魔法', 'ギルド', '友情', '冒険', '戦闘'],
    relatedManga: ['one-piece', 'naruto', 'bleach']
  },
  {
    id: 'hunter-x-hunter',
    title: 'Hunter x Hunter',
    author: 'Yoshihiro Togashi',
    imageUrl: '',
    description: 'ハンター試験に挑戦する少年・ゴン・フリークスの物語。様々な能力を持つハンターたちとの出会い、危険な任務、そして成長していく姿を描く。',
    isCompleted: false,
    totalVolumes: 37,
    currentVolume: 37,
    genres: ['アクション', 'アドベンチャー', 'ファンタジー'],
    rating: 4.8,
    reviewCount: 15600,
    publicationYear: 1998,
    publisher: '集英社',
    status: 'hiatus',
    tags: ['ハンター', '能力', '成長', '友情', '戦闘'],
    relatedManga: ['one-piece', 'naruto', 'bleach']
  },
  {
    id: 'fullmetal-alchemist',
    title: 'Fullmetal Alchemist',
    author: 'Hiromu Arakawa',
    imageUrl: '',
    description: '錬金術師の兄弟・エドワードとアルフォンスの物語。母を蘇らせようとして失敗し、体を失った兄弟は、賢者の石を求めて旅に出る。',
    isCompleted: true,
    totalVolumes: 27,
    currentVolume: 27,
    genres: ['アクション', 'ファンタジー', 'ドラマ'],
    rating: 4.9,
    reviewCount: 18900,
    publicationYear: 2001,
    publisher: 'スクウェア・エニックス',
    status: 'completed',
    tags: ['錬金術', '戦闘', '成長', '友情', '復讐'],
    relatedManga: ['attack-on-titan', 'demon-slayer', 'jujutsu-kaisen']
  },
  {
    id: 'death-note',
    title: 'Death Note',
    author: 'Tsugumi Ohba',
    imageUrl: '',
    description: '死神のノートを手に入れた高校生・夜神月の物語。ノートに名前を書くとその人物が死ぬという力を使い、世界の犯罪を減らそうとするが、その行動は正義なのか。',
    isCompleted: true,
    totalVolumes: 12,
    currentVolume: 12,
    genres: ['サスペンス', '心理戦', 'ドラマ'],
    rating: 4.7,
    reviewCount: 13400,
    publicationYear: 2003,
    publisher: '集英社',
    status: 'completed',
    tags: ['死神', '心理戦', '正義', '犯罪', 'サスペンス'],
    relatedManga: ['monster', '20th-century-boys', 'pluto']
  },
  {
    id: 'tokyo-ghoul',
    title: 'Tokyo Ghoul',
    author: 'Sui Ishida',
    imageUrl: '',
    description: '人肉を食べる怪物・喰種に襲われた大学生・金木研の物語。喰種の力を持った金木は、人間と喰種の間で苦悩しながら、真実を探していく。',
    isCompleted: true,
    totalVolumes: 14,
    currentVolume: 14,
    genres: ['ホラー', 'アクション', 'ドラマ'],
    rating: 4.6,
    reviewCount: 10200,
    publicationYear: 2011,
    publisher: '集英社',
    status: 'completed',
    tags: ['喰種', 'ホラー', '戦闘', '成長', '人間性'],
    relatedManga: ['parasyte', 'demon-slayer', 'jujutsu-kaisen']
  },
  {
    id: 'parasyte',
    title: 'Parasyte',
    author: 'Hitoshi Iwaaki',
    imageUrl: '',
    description: '地球に寄生した謎の生物・パラサイトに右手を乗っ取られた高校生・泉新一の物語。パラサイトと共生しながら、他のパラサイトと戦っていく。',
    isCompleted: true,
    totalVolumes: 10,
    currentVolume: 10,
    genres: ['ホラー', 'アクション', 'SF'],
    rating: 4.5,
    reviewCount: 7800,
    publicationYear: 1988,
    publisher: '講談社',
    status: 'completed',
    tags: ['パラサイト', 'ホラー', '戦闘', '共生', 'SF'],
    relatedManga: ['tokyo-ghoul', 'demon-slayer', 'jujutsu-kaisen']
  },
  {
    id: 'vagabond',
    title: 'Vagabond',
    author: 'Takehiko Inoue',
    imageUrl: '',
    description: '剣豪・宮本武蔵の成長を描いた作品。若き日の武蔵が剣の道を極め、様々な強敵と戦いながら、真の強さとは何かを追求していく。',
    isCompleted: false,
    totalVolumes: 37,
    currentVolume: 37,
    genres: ['アクション', '歴史', 'ドラマ'],
    rating: 4.9,
    reviewCount: 16700,
    publicationYear: 1998,
    publisher: '講談社',
    status: 'hiatus',
    tags: ['剣豪', '歴史', '戦闘', '成長', '武道'],
    relatedManga: ['berserk', 'kingdom', 'vinland-saga']
  },
  {
    id: 'berserk',
    title: 'Berserk',
    author: 'Kentaro Miura',
    imageUrl: '',
    description: '傭兵・ガッツの物語。幼少期の悲惨な経験から、復讐と生存を目的に戦い続けるガッツの姿を描く。暗黒ファンタジーの傑作。',
    isCompleted: false,
    totalVolumes: 41,
    currentVolume: 41,
    genres: ['アクション', 'ファンタジー', 'ホラー'],
    rating: 4.9,
    reviewCount: 18900,
    publicationYear: 1989,
    publisher: '白泉社',
    status: 'hiatus',
    tags: ['傭兵', '復讐', '戦闘', '暗黒', 'ファンタジー'],
    relatedManga: ['vagabond', 'kingdom', 'vinland-saga']
  }
];

/**
 * 漫画IDから詳細情報を取得
 */
export function getMangaById(id: string): MangaDetails | undefined {
  return sampleMangaDetails.find(manga => manga.id === id);
}

/**
 * すべての漫画詳細情報を取得
 */
export function getAllManga(): MangaDetails[] {
  return sampleMangaDetails;
}

/**
 * ジャンルで漫画を検索
 */
export function getMangaByGenre(genre: string): MangaDetails[] {
  return sampleMangaDetails.filter(manga => 
    manga.genres.some(g => g.toLowerCase().includes(genre.toLowerCase()))
  );
}

/**
 * 完結済みの漫画のみ取得
 */
export function getCompletedManga(): MangaDetails[] {
  return sampleMangaDetails.filter(manga => manga.isCompleted);
}

/**
 * 連載中の漫画のみ取得
 */
export function getOngoingManga(): MangaDetails[] {
  return sampleMangaDetails.filter(manga => !manga.isCompleted);
}
