/**
 * 初期データ投入スクリプト
 * 
 * マンガ情報サイトに必要な基本的なデータ構造を構築：
 * - ジャンル（アクション、ロマンス、ファンタジーなど）
 * - タグ（テーマ、キャラクター、設定など）
 * - サンプルユーザー
 * - 基本的なシリーズ情報
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 初期データの投入を開始します...');

  try {
    // 1. ジャンルの作成
    console.log('📚 ジャンルを作成中...');
    const genres = [
      { name: 'アクション', description: '戦闘や冒険を中心とした作品', color: '#FF6B6B', icon: '⚔️' },
      { name: 'アドベンチャー', description: '冒険や探索をテーマとした作品', color: '#4ECDC4', icon: '🗺️' },
      { name: 'ロマンス', description: '恋愛を中心とした作品', color: '#FF8ED4', icon: '💕' },
      { name: 'コメディ', description: '笑いを重視した作品', color: '#FFD93D', icon: '😄' },
      { name: 'ドラマ', description: '人間関係や心理を深く描いた作品', color: '#6C5CE7', icon: '🎭' },
      { name: 'ファンタジー', description: '魔法や超自然現象を扱った作品', color: '#A8E6CF', icon: '✨' },
      { name: 'SF', description: '科学技術や未来をテーマとした作品', color: '#FFB347', icon: '🚀' },
      { name: 'ホラー', description: '恐怖やサスペンスを扱った作品', color: '#8B4513', icon: '👻' },
      { name: 'ミステリー', description: '謎解きや推理を中心とした作品', color: '#708090', icon: '🔍' },
      { name: 'スポーツ', description: 'スポーツを題材とした作品', color: '#32CD32', icon: '⚽' },
      { name: '日常', description: '日常生活を描いた作品', color: '#87CEEB', icon: '🏠' },
      { name: '歴史', description: '歴史的な背景を持つ作品', color: '#D2691E', icon: '🏛️' },
      { name: '戦争', description: '戦争をテーマとした作品', color: '#DC143C', icon: '⚔️' },
      { name: '音楽', description: '音楽を題材とした作品', color: '#FF69B4', icon: '🎵' },
      { name: '料理', description: '料理を題材とした作品', color: '#FF6347', icon: '🍳' },
      { name: '学校', description: '学校生活を描いた作品', color: '#20B2AA', icon: '🎓' },
      { name: '職場', description: '仕事や職場を描いた作品', color: '#4682B4', icon: '💼' },
      { name: '家族', description: '家族関係を中心とした作品', color: '#FFA07A', icon: '👨‍👩‍👧‍👦' },
      { name: '友情', description: '友情をテーマとした作品', color: '#98FB98', icon: '🤝' },
      { name: '成長', description: 'キャラクターの成長を描いた作品', color: '#DDA0DD', icon: '🌱' }
    ];

    for (const genre of genres) {
      // 既存のジャンルをチェックしてから作成
      const existingGenre = await prisma.genre.findFirst({
        where: { name: genre.name }
      });
      
      if (!existingGenre) {
        await prisma.genre.create({
          data: genre,
        });
      }
    }
    console.log(`✅ ${genres.length}個のジャンルを作成しました`);

    // 2. タグの作成
    console.log('🏷️ タグを作成中...');
    const tags = [
      // テーマ系
      { name: '王道', category: 'テーマ' },
      { name: '異世界転生', category: 'テーマ' },
      { name: '学園', category: 'テーマ' },
      { name: '魔法', category: 'テーマ' },
      { name: '剣と魔法', category: 'テーマ' },
      { name: '現代', category: 'テーマ' },
      { name: '未来', category: 'テーマ' },
      { name: '過去', category: 'テーマ' },
      { name: '架空世界', category: 'テーマ' },
      { name: '現実世界', category: 'テーマ' },

      // キャラクター系
      { name: '主人公', category: 'キャラクター' },
      { name: 'ヒロイン', category: 'キャラクター' },
      { name: 'ライバル', category: 'キャラクター' },
      { name: '悪役', category: 'キャラクター' },
      { name: '仲間', category: 'キャラクター' },
      { name: '家族', category: 'キャラクター' },
      { name: '先生', category: 'キャラクター' },
      { name: '生徒', category: 'キャラクター' },
      { name: '上司', category: 'キャラクター' },
      { name: '部下', category: 'キャラクター' },

      // 設定系
      { name: '都市', category: '設定' },
      { name: '田舎', category: '設定' },
      { name: '学校', category: '設定' },
      { name: '会社', category: '設定' },
      { name: '病院', category: '設定' },
      { name: '家', category: '設定' },
      { name: '森', category: '設定' },
      { name: '海', category: '設定' },
      { name: '山', category: '設定' },
      { name: '宇宙', category: '設定' },

      // 感情・心理系
      { name: '感動', category: '感情' },
      { name: '涙', category: '感情' },
      { name: '笑い', category: '感情' },
      { name: '恐怖', category: '感情' },
      { name: '緊張', category: '感情' },
      { name: '安堵', category: '感情' },
      { name: '期待', category: '感情' },
      { name: '失望', category: '感情' },
      { name: '希望', category: '感情' },
      { name: '絶望', category: '感情' }
    ];

    for (const tag of tags) {
      // 既存のタグをチェックしてから作成
      const existingTag = await prisma.tag.findFirst({
        where: { name: tag.name }
      });
      
      if (!existingTag) {
        await prisma.tag.create({
          data: tag,
        });
      }
    }
    console.log(`✅ ${tags.length}個のタグを作成しました`);

    // 3. サンプルユーザーの作成
    console.log('👤 サンプルユーザーを作成中...');
    const users = [
      {
        email: 'admin@manga-review.com',
        username: 'admin',
        password: 'admin123', // 実際の運用ではハッシュ化が必要
        bio: 'サイト管理者です。マンガが大好き！',
        avatar: null
      },
      {
        email: 'user1@example.com',
        username: 'manga_lover',
        password: 'password123',
        bio: 'アクションとファンタジーが好きなマンガファンです。',
        avatar: null
      },
      {
        email: 'user2@example.com',
        username: 'romance_reader',
        password: 'password123',
        bio: 'ロマンス作品を中心に読んでいます。甘い話が大好き！',
        avatar: null
      }
    ];

    for (const user of users) {
      // 既存のユーザーをチェックしてから作成
      const existingUser = await prisma.user.findFirst({
        where: { email: user.email }
      });
      
      if (!existingUser) {
        await prisma.user.create({
          data: user,
        });
      }
    }
    console.log(`✅ ${users.length}人のサンプルユーザーを作成しました`);

    // 4. 基本的なシリーズ情報の作成
    console.log('📖 基本的なシリーズ情報を作成中...');
    const sampleSeries = [
      {
        title: 'ONE PIECE',
        englishTitle: 'ONE PIECE',
        romajiTitle: 'Wan Pīsu',
        description: '海賊王を目指す少年モンキー・D・ルフィの冒険を描いた長編冒険ファンタジー漫画。',
        publisherName: '集英社',
        status: '連載中',
        startDate: new Date('1997-07-22'),
        ageRating: '全年齢'
      },
      {
        title: '進撃の巨人',
        englishTitle: 'Attack on Titan',
        romajiTitle: 'Shingeki no Kyojin',
        description: '人類を襲う巨人と戦う人類の戦いを描いたダークファンタジー作品。',
        publisherName: '講談社',
        status: '完結',
        startDate: new Date('2009-09-09'),
        endDate: new Date('2021-04-09'),
        ageRating: 'R15'
      },
      {
        title: '鬼滅の刃',
        englishTitle: 'Demon Slayer',
        romajiTitle: 'Kimetsu no Yaiba',
        description: '鬼に家族を殺された少年が鬼殺隊の剣士として鬼と戦う物語。',
        publisherName: '集英社',
        status: '完結',
        startDate: new Date('2016-02-15'),
        endDate: new Date('2020-05-18'),
        ageRating: '全年齢'
      }
    ];

    for (const seriesData of sampleSeries) {
      // 既存のシリーズをチェックしてから作成
      const existingSeries = await prisma.series.findFirst({
        where: { title: seriesData.title }
      });
      
      if (!existingSeries) {
        await prisma.series.create({
          data: seriesData,
        });
      }
    }
    console.log(`✅ ${sampleSeries.length}個のサンプルシリーズを作成しました`);

    console.log('🎉 初期データの投入が完了しました！');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
