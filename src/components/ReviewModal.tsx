'use client';

import React, { useState } from 'react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  mangaTitle: string;
  onSubmit: (review: { rating: number; comment: string }) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, mangaTitle, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ rating, comment });
    setRating(5);
    setComment('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">レビューを投稿</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-300 text-sm mb-2">対象作品</p>
          <p className="text-white font-medium">{mangaTitle}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 評価 */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-2">評価</label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-400'
                  } hover:text-yellow-400 transition-colors`}
                >
                  ★
                </button>
              ))}
              <span className="text-white ml-2">{rating}/5</span>
            </div>
          </div>

          {/* コメント */}
          <div className="mb-6">
            <label htmlFor="comment" className="block text-gray-300 text-sm mb-2">
              コメント
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full h-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="この作品についての感想を書いてください..."
              required
            />
          </div>

          {/* ボタン */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              投稿する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
