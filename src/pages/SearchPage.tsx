import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from '../lib/router';
import { MediaItem } from '../types';
import { MovieCard } from '../components/MovieCard';
import { Search as SearchIcon, X, SlidersHorizontal } from 'lucide-react';
import { GENRES } from '../data/mockData';

interface SearchPageProps {
  catalog: MediaItem[];
  isInWatchlist: (id: string) => boolean;
  onToggleWatchlist: (id: string) => void;
  onPlay: (item: MediaItem) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  catalog,
  isInWatchlist,
  onToggleWatchlist,
  onPlay
}) => {
  const { query, navigate } = useRouter();
  const [searchTerm, setSearchTerm] = useState(query.q || '');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  useEffect(() => {
    if (query.q) {
      setSearchTerm(query.q);
    }
  }, [query.q]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (val.trim()) {
      window.history.replaceState({}, '', `/search?q=${encodeURIComponent(val)}`);
    } else {
      window.history.replaceState({}, '', '/search');
    }
  };

  const results = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return catalog.filter((item) => {
      // Keyword match
      const matchesKeyword =
        !term ||
        item.title.toLowerCase().includes(term) ||
        item.originalTitle.toLowerCase().includes(term) ||
        item.director.toLowerCase().includes(term) ||
        item.writer.toLowerCase().includes(term) ||
        item.cast.some((c) => c.toLowerCase().includes(term)) ||
        item.genres.some((g) => g.toLowerCase().includes(term)) ||
        item.language.toLowerCase().includes(term) ||
        item.year.toString().includes(term);

      if (!matchesKeyword) return false;

      // Filter by type
      if (selectedType !== 'all' && item.type !== selectedType) return false;

      // Filter by genre
      if (selectedGenre !== 'all' && !item.genres.some((g) => g.toLowerCase() === selectedGenre.toLowerCase())) return false;

      // Filter by language
      if (selectedLanguage !== 'all' && item.language !== selectedLanguage) return false;

      return true;
    });
  }, [catalog, searchTerm, selectedType, selectedGenre, selectedLanguage]);

  return (
    <div className="min-h-screen bg-[#0A0A0C] pt-24 sm:pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Input Box */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by title, actor, director, genre, or year..."
              autoFocus
              className="w-full bg-[#18181D] border border-white/15 focus:border-[#E50914] rounded-2xl pl-12 pr-12 py-3.5 sm:py-4 text-base sm:text-lg text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#E50914] shadow-2xl transition"
            />
            {searchTerm && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-full border transition ${
                selectedType === 'all'
                  ? 'bg-white text-black font-semibold border-white'
                  : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedType('movie')}
              className={`px-3 py-1.5 rounded-full border transition ${
                selectedType === 'movie'
                  ? 'bg-white text-black font-semibold border-white'
                  : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setSelectedType('series')}
              className={`px-3 py-1.5 rounded-full border transition ${
                selectedType === 'series'
                  ? 'bg-white text-black font-semibold border-white'
                  : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
              }`}
            >
              Series
            </button>
            <button
              onClick={() => setSelectedType('tv-show')}
              className={`px-3 py-1.5 rounded-full border transition ${
                selectedType === 'tv-show'
                  ? 'bg-white text-black font-semibold border-white'
                  : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
              }`}
            >
              TV Shows
            </button>
            <button
              onClick={() => setSelectedLanguage(selectedLanguage === 'Bangla Dubbed' ? 'all' : 'Bangla Dubbed')}
              className={`px-3 py-1.5 rounded-full border transition ${
                selectedLanguage === 'Bangla Dubbed'
                  ? 'bg-[#E50914] text-white font-semibold border-[#E50914]'
                  : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
              }`}
            >
              Bangla Dubbed
            </button>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-white/60">
            {searchTerm.trim() ? (
              <>
                Found <span className="text-white font-semibold">{results.length}</span> titles for "{searchTerm}"
              </>
            ) : (
              <>Showing all {results.length} catalog titles</>
            )}
          </p>
        </div>

        {/* Results Grid */}
        {results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
            {results.map((item) => (
              <MovieCard
                key={item.id}
                item={item}
                isInWatchlist={isInWatchlist(item.id)}
                onToggleWatchlist={onToggleWatchlist}
                onPlay={onPlay}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg font-medium text-white/80">No results found for "{searchTerm}"</p>
            <p className="text-xs text-white/50 mt-1 max-w-md mx-auto">
              Check for spelling errors or try searching for another actor, director, or title such as "Hawa", "Mohanagar", or "Chanchal".
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
