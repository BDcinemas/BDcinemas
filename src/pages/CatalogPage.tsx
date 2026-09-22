import React, { useState, useMemo } from 'react';
import { MediaItem } from '../types';
import { MovieCard } from '../components/MovieCard';
import { GENRES } from '../data/mockData';
import { Filter, ArrowUpDown, Sparkles } from 'lucide-react';

interface CatalogPageProps {
  title: string;
  subtitle: string;
  items: MediaItem[];
  defaultType?: 'movie' | 'series' | 'tv-show';
  defaultGenre?: string;
  defaultYear?: number;
  isInWatchlist: (id: string) => boolean;
  onToggleWatchlist: (id: string) => void;
  onPlay: (item: MediaItem) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  title,
  subtitle,
  items,
  defaultType,
  defaultGenre,
  defaultYear,
  isInWatchlist,
  onToggleWatchlist,
  onPlay
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>(defaultGenre || 'all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedQuality, setSelectedQuality] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'popular'>('newest');

  // Available unique languages
  const languages = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.language));
    return ['all', ...Array.from(set)];
  }, [items]);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    let list = [...items];

    if (defaultType) {
      list = list.filter((i) => i.type === defaultType);
    }

    if (defaultYear) {
      list = list.filter((i) => i.year === defaultYear);
    }

    if (selectedGenre !== 'all') {
      list = list.filter((i) => i.genres.some((g) => g.toLowerCase() === selectedGenre.toLowerCase()));
    }

    if (selectedLanguage !== 'all') {
      list = list.filter((i) => i.language === selectedLanguage);
    }

    if (selectedQuality !== 'all') {
      list = list.filter((i) => i.quality === selectedQuality);
    }

    // Sort
    if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'popular') {
      list.sort((a, b) => b.views - a.views);
    } else {
      list.sort((a, b) => b.year - a.year);
    }

    return list;
  }, [items, defaultType, defaultYear, selectedGenre, selectedLanguage, selectedQuality, sortBy]);

  return (
    <div className="min-h-screen bg-[#0A0A0C] pt-24 sm:pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            <span>{title}</span>
            <span className="text-xs sm:text-sm font-normal px-2.5 py-0.5 rounded-full bg-white/10 text-white/60">
              {filteredItems.length} titles
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-xl">{subtitle}</p>
        </div>

        {/* Filters and Sorting Toolbar */}
        <div className="bg-[#18181D]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 mb-8 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Genre Filter */}
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10">
              <span className="text-white/40 font-medium">Genre:</span>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#18181D]">All Genres</option>
                {GENRES.map((g) => (
                  <option key={g.id} value={g.name} className="bg-[#18181D]">
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10">
              <span className="text-white/40 font-medium">Audio:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#18181D]">All Audio</option>
                {languages.filter((l) => l !== 'all').map((lang) => (
                  <option key={lang} value={lang} className="bg-[#18181D]">
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            {/* Quality Filter */}
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10">
              <span className="text-white/40 font-medium">Quality:</span>
              <select
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#18181D]">All Qualities</option>
                <option value="4K UHD" className="bg-[#18181D]">4K UHD</option>
                <option value="1080p FHD" className="bg-[#18181D]">1080p FHD</option>
              </select>
            </div>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10 ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-white/50" />
            <span className="text-white/40 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-[#18181D]">Newest First</option>
              <option value="rating" className="bg-[#18181D]">Highest Rated</option>
              <option value="popular" className="bg-[#18181D]">Most Viewed</option>
            </select>
          </div>
        </div>

        {/* Content Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
            {filteredItems.map((item) => (
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
          <div className="py-24 text-center">
            <p className="text-white/60 text-base">No titles match your selected filters.</p>
            <button
              onClick={() => {
                setSelectedGenre('all');
                setSelectedLanguage('all');
                setSelectedQuality('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
