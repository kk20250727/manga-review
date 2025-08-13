'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type SeriesVolume = {
  id: number;
  title: string;
  volumeNumber: number | null;
  isbn: string | null;
  imageUrl: string;
  itemUrl: string;
  description: string;
};

type SeriesCreator = {
  role: string;
  creator: {
    name: string;
  };
};

type SeriesAlias = {
  id: number;
  alias: string;
  lang: string | null;
};

type SeriesDetail = {
  id: number;
  title: string;
  englishTitle: string;
  romajiTitle: string;
  description: string;
  coverImageUrl: string;
  publisherName: string;
  volumes: SeriesVolume[];
  creators: SeriesCreator[];
  aliases: SeriesAlias[];
};

type Review = {
  id: number;
  rating: number;
  comment: string;
  nickname: string;
  createdAt: string;
};

export default function SeriesDetailPage({ params }: { params: { id: string } }) {
  const [series, setSeries] = useState<SeriesDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', nickname: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [seriesRes, reviewsRes] = await Promise.all([
          fetch(`/api/series/${params.id}`),
          fetch(`/api/reviews?seriesId=${params.id}`),
        ]);
        const seriesData = await seriesRes.json();
        const reviewsData = await reviewsRes.json();
        setSeries(seriesData);
        setReviews(reviewsData.items || []);
      } catch (error) {
        console.error('Failed to load series:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [params.id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment.trim() || !newReview.nickname.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newReview, seriesId: params.id }),
      });
      if (res.ok) {
        const review = await res.json();
        setReviews([review.item, ...reviews]);
        setNewReview({ rating: 5, comment: '', nickname: '' });
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (!series) return <div className="text-center p-8">Series not found</div>;

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left: Cover and Info */}
        <div className="md:col-span-1">
          <div className="sticky top-6">
            <div className="mb-6">
              <Image
                src={series.coverImageUrl || '/vercel.svg'}
                alt={series.title}
                width={300}
                height={450}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">{series.title}</h1>
              {series.englishTitle && (
                <div className="text-lg text-gray-600">{series.englishTitle}</div>
              )}
              {series.romajiTitle && (
                <div className="text-lg text-gray-500">{series.romajiTitle}</div>
              )}
              {series.publisherName && (
                <div className="text-sm text-gray-500">{series.publisherName}</div>
              )}
              
              {series.creators.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Creators</h3>
                  <div className="space-y-1">
                    {series.creators.map((c, i) => (
                      <div key={i} className="text-sm">
                        {c.creator.name} ({c.role})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {series.aliases.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Alternative Titles</h3>
                  <div className="space-y-1">
                    {series.aliases.map((alias) => (
                      <div key={alias.id} className="text-sm text-gray-600">
                        {alias.alias}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
                <div className="text-gray-500">({reviews.length} reviews)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Description */}
          {series.description && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{series.description}</p>
            </div>
          )}

          {/* Volumes */}
          {series.volumes.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Volumes ({series.volumes.length})</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {series.volumes.map((volume) => (
                  <div key={volume.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                    <div className="aspect-[3/4] bg-gray-100 rounded mb-2 flex items-center justify-center">
                      {volume.imageUrl ? (
                        <Image
                          src={volume.imageUrl}
                          alt={volume.title}
                          width={80}
                          height={120}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="text-gray-400 text-xs text-center">No Image</div>
                      )}
                    </div>
                    <div className="text-sm font-medium truncate">{volume.title}</div>
                    {volume.volumeNumber && (
                      <div className="text-xs text-gray-500">#{volume.volumeNumber}</div>
                    )}
                    {volume.isbn && (
                      <div className="text-xs text-gray-400 truncate">{volume.isbn}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>
            
            {/* Review Form */}
            <form onSubmit={handleReviewSubmit} className="mb-6 p-4 border rounded-lg">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rating</label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                  >
                    {[5, 4, 3, 2, 1].map(r => (
                      <option key={r} value={r}>{r} stars</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nickname</label>
                  <input
                    type="text"
                    value={newReview.nickname}
                    onChange={(e) => setNewReview({ ...newReview, nickname: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Your nickname"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Comment</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Share your thoughts..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>

            {/* Review List */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500">{review.nickname}</div>
                    <div className="text-sm text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
