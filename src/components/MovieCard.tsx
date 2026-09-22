import React from 'react';
import { Star, Play, Plus, Check, Info } from 'lucide-react';
import { MediaItem } from '../types';
import { useRouter } from '../lib/router';

interface MovieCardProps {
  item: MediaItem;
  isInWatchlist: boolean;
  onToggleWatchlist: (id: string) => void;
  onPlay: (item: MediaItem) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  item,
  isInWatchlist,
  onToggleWatchlist,
  onPlay
}) => {
  const { navigate } = useRouter();

  const handleCardClick = () => {
    if (item.type === 'movie') {
      navigate(`/movie/${item.slug}`);
    } else if (item.type === 'series') {
      navigate(`/series/${item.slug}`);
    } else {
      navigate(`/tv-show/${item.slug}`);
    }
  };

  return (
    <div className="group relative flex flex-col cursor-pointer select-none">
      {/* 2:3 Poster Container */}
      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-[#18181D] border border-white/5 shadow-lg transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.8)] group-hover:border-white/20">
        <img
          src={item.poster}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
          <span className="bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-semibold text-white/90 border border-white/10">
            {item.quality}
          </span>
          {item.language === 'Bangla Dubbed' && (
            <span className="bg-[#E50914]/90 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-semibold text-white">
              ডাবিং
            </span>
          )}
        </div>

        {/* Rating Pill */}
        {((item.imdbRating && item.imdbRating > 0) || (item.rating && item.rating > 0)) && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 z-10">
            <span className="text-[10px] font-black tracking-wider text-[#FFD700]">IMDb</span>
            <span className="text-[11px] font-bold text-white">
              {(item.imdbRating || item.rating).toFixed(1)}
            </span>
          </div>
        )}

        {/* Subtle Dark Vignette on Bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <div className="flex items-center gap-2 mb-2">
            {/* Play Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay(item);
              }}
              className="flex-1 bg-white text-black hover:bg-white/90 font-medium py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition shadow-lg"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Play</span>
            </button>

            {/* Watchlist Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatchlist(item.id);
              }}
              className="p-1.5 rounded-lg bg-black/60 border border-white/20 hover:bg-white/20 text-white transition backdrop-blur-md"
              title={isInWatchlist ? 'Remove from My List' : 'Add to My List'}
            >
              {isInWatchlist ? <Check className="w-3.5 h-3.5 text-[#E50914]" /> : <Plus className="w-3.5 h-3.5" />}
            </button>

            {/* More Info */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="p-1.5 rounded-lg bg-black/60 border border-white/20 hover:bg-white/20 text-white transition backdrop-blur-md"
              title="More Info"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Click target */}
        <div className="absolute inset-0 z-0" onClick={handleCardClick} />
      </div>

      {/* Title & Metadata under Poster */}
      <div className="mt-2.5 px-0.5" onClick={handleCardClick}>
        <h3 className="text-xs sm:text-sm font-semibold text-white/95 truncate group-hover:text-white transition">
          {item.title}
        </h3>
        <div className="flex items-center justify-between text-[11px] text-white/50 mt-0.5">
          <span className="truncate max-w-[65%]">{item.genres[0]}</span>
          <span>{item.year}</span>
        </div>
      </div>
    </div>
  );
};
