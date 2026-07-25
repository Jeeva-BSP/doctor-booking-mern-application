import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, maxRating = 5, onRatingChange = null, size = 'sm', showNumeric = true }) {
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1);
  const sizeClasses = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center space-x-1">
      {stars.map((star) => (
        <button
          key={star}
          type={onRatingChange ? 'button' : 'button'}
          disabled={!onRatingChange}
          onClick={() => onRatingChange && onRatingChange(star)}
          className={`focus:outline-none transition-transform ${onRatingChange ? 'hover:scale-115 cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            className={`${sizeClasses[size] || 'w-4 h-4'} ${
              star <= Math.round(rating)
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-300 dark:text-slate-600'
            }`}
          />
        </button>
      ))}
      {showNumeric && (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1">
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
}
