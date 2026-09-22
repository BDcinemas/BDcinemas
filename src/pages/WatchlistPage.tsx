import React from 'react';
import { MediaItem, ContinueWatchingItem } from '../types';
import { MovieCard } from '../components/MovieCard';
import { ContinueWatchingRow } from '../components/ContinueWatchingRow';
import { Bookmark, Film } from 'lucide-react';
import { useRouter } from '../lib/router';

interface WatchlistPageProps {
  catalog: MediaItem[];
  watchlist: string[];
  continueWatching: ContinueWatchingItem[];
  isInWatchlist: (id: string) => boolean;
  onToggleWatchlist: (id: string) => void;
  onPlay: (item: MediaItem, episodeId?: string) => void;
  onRemoveContinueWatching: (mediaId: string) => void;
}

export const WatchlistPage: React.FC<WatchlistPageProps> = ({
  catalog,
  watchlist,
  continueWatching,
  isInWatchlist,
  onToggleWatchlist,
  onPlay,
  onRemoveContinueWatching
}) => {
  const { navigate } = useRouter();

  const watchlistItems = catalog.filter((item) => watchlist.includes(item.id));

  return (
    <div className="min-h-screen bg-[#0A0A0C] pt-24 sm:pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-[#E50914]" />
            <span>My List</span>
            <span className="text-sm font-normal px-2.5 py-0.5 rounded-full bg-white/10 text-white/60">
              {watchlistItems.length} saved
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Your saved movies, series, and resumed watch sessions.
          </p>
        </div>

        {/* Continue watching session section */}
        {continueWatching.length > 0 && (
          <div className="mb-8">
            <ContinueWatchingRow
              items={continueWatching}
              catalog={catalog}
              onPlay={onPlay}
              onRemove={onRemoveContinueWatching}
            />
          </div>
        )}

        {/* Watchlist Grid */}
        {watchlistItems.length > 0 ? (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Saved Titles</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
              {watchlistItems.map((item) => (
                <MovieCard
                  key={item.id}
                  item={item}
                  isInWatchlist={true}
                  onToggleWatchlist={onToggleWatchlist}
                  onPlay={onPlay}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="py-24 text-center border border-dashed border-white/10 rounded-3xl bg-[#18181D]/30 max-w-xl mx-auto p-8">
            <Film className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">Your List is Empty</h3>
            <p className="text-xs text-white/50 mt-1 mb-6">
              Explore the catalog and tap the "+" icon on any title to save it for later viewing.
            </p>
            <button
              onClick={() => navigate('/movies')}
              className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-white/90 transition shadow-lg"
            >
              Browse Movies
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
