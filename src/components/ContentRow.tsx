import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '../types';
import { MovieCard } from './MovieCard';
import { useRouter } from '../lib/router';

interface ContentRowProps {
  title: string;
  subtitle?: string;
  items: MediaItem[];
  seeAllPath?: string;
  isInWatchlist: (id: string) => boolean;
  onToggleWatchlist: (id: string) => void;
  onPlay: (item: MediaItem) => void;
}

export const ContentRow: React.FC<ContentRowProps> = ({
  title,
  subtitle,
  items,
  seeAllPath,
  isInWatchlist,
  onToggleWatchlist,
  onPlay
}) => {
  const { navigate } = useRouter();
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3 sm:mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{title}</span>
            <span className="text-xs font-normal text-white/40">({items.length})</span>
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-white/50 mt-0.5">{subtitle}</p>
          )}
        </div>

        {seeAllPath && (
          <button
            onClick={() => navigate(seeAllPath)}
            className="text-xs sm:text-sm font-semibold text-[#E50914] hover:text-[#ff334b] transition flex items-center gap-1"
          >
            <span>See All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Row with Navigation Buttons */}
      <div className="group relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/80 border border-white/20 text-white shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 active:scale-95 disabled:hidden hidden sm:flex items-center justify-center"
          title="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Scroll Container */}
        <div
          ref={rowRef}
          className="flex items-start gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-[140px] sm:w-[170px] md:w-[190px] lg:w-[200px]"
            >
              <MovieCard
                item={item}
                isInWatchlist={isInWatchlist(item.id)}
                onToggleWatchlist={onToggleWatchlist}
                onPlay={onPlay}
              />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/80 border border-white/20 text-white shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 active:scale-95 hidden sm:flex items-center justify-center"
          title="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};
