import React, { useState, useEffect } from 'react';
import { Play, Plus, Check, Info, Volume2, VolumeX, Star, Film } from 'lucide-react';
import { MediaItem } from '../types';
import { useRouter } from '../lib/router';

interface HeroBannerProps {
  items: MediaItem[];
  isInWatchlist: (id: string) => boolean;
  onToggleWatchlist: (id: string) => void;
  onPlay: (item: MediaItem) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  items,
  isInWatchlist,
  onToggleWatchlist,
  onPlay
}) => {
  const { navigate } = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const heroItems = items.filter((item) => item.featured).length > 0
    ? items.filter((item) => item.featured)
    : items.slice(0, 5);

  const currentItem = heroItems[currentIndex] || heroItems[0];

  // Auto rotate banner every 8 seconds
  useEffect(() => {
    if (heroItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroItems.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [heroItems.length]);

  if (!currentItem) return null;

  const handleInfoClick = () => {
    if (currentItem.type === 'movie') {
      navigate(`/movie/${currentItem.slug}`);
    } else if (currentItem.type === 'series') {
      navigate(`/series/${currentItem.slug}`);
    } else {
      navigate(`/tv-show/${currentItem.slug}`);
    }
  };

  return (
    <div className="relative w-full h-[75vh] min-h-[500px] max-h-[820px] overflow-hidden bg-black select-none">
      {/* Background Backdrop Image with slow zoom transition */}
      <div className="absolute inset-0">
        <img
          key={currentItem.id}
          src={currentItem.backdrop}
          alt={currentItem.title}
          className="w-full h-full object-cover object-top scale-100 animate-[pulse_10s_ease-in-out_infinite] duration-1000"
        />
        {/* Subtle Dark Gradients for Apple-style typography legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/40 to-transparent" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/80" />
      </div>

      {/* Content Details */}
      <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col justify-end px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="max-w-2xl space-y-4">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="bg-[#E50914] text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(229,9,20,0.4)]">
              {currentItem.type === 'series' ? 'Featured Series' : 'Cinematic Premiere'}
            </span>
            <span className="bg-white/10 backdrop-blur-md text-white/90 px-2 py-0.5 rounded border border-white/10">
              {currentItem.quality}
            </span>
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 text-white">
              <Star className="w-3 h-3 text-[#FFD700] fill-[#FFD700]" />
              <span className="font-semibold">{currentItem.rating}</span>
            </div>
            <span className="text-white/60">{currentItem.year}</span>
            <span className="text-white/60">•</span>
            <span className="text-white/60">{currentItem.runtime}</span>
            <span className="text-white/60">•</span>
            <span className="text-white/80">{currentItem.genres.slice(0, 3).join(', ')}</span>
          </div>

          {/* Bengali Title & English Title */}
          <div>
            {currentItem.originalTitle && currentItem.originalTitle !== currentItem.title && (
              <p className="text-sm sm:text-base font-medium text-white/70 mb-1">
                {currentItem.originalTitle}
              </p>
            )}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md">
              {currentItem.title}
            </h1>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-white/80 line-clamp-3 leading-relaxed drop-shadow">
            {currentItem.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Watch Now */}
            <button
              onClick={() => onPlay(currentItem)}
              className="bg-white hover:bg-white/90 text-black px-6 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 shadow-2xl transition hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 fill-black" />
              <span>Watch Now</span>
            </button>

            {/* Add to My List */}
            <button
              onClick={() => onToggleWatchlist(currentItem.id)}
              className="bg-white/15 hover:bg-white/25 text-white backdrop-blur-md px-5 py-3 rounded-xl font-semibold text-sm sm:text-base flex items-center gap-2 border border-white/15 transition hover:scale-105 active:scale-95"
            >
              {isInWatchlist(currentItem.id) ? (
                <>
                  <Check className="w-5 h-5 text-[#E50914]" />
                  <span>In My List</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>My List</span>
                </>
              )}
            </button>

            {/* More Info */}
            <button
              onClick={handleInfoClick}
              className="bg-black/40 hover:bg-black/60 text-white/90 backdrop-blur-md px-4 py-3 rounded-xl font-medium text-sm sm:text-base flex items-center gap-2 border border-white/10 transition"
              title="Details and Cast"
            >
              <Info className="w-5 h-5" />
              <span className="hidden sm:inline">Details</span>
            </button>

            {/* Mute/Unmute audio hint toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-3 rounded-full bg-black/40 border border-white/15 text-white/70 hover:text-white backdrop-blur-md transition ml-auto"
              title={isMuted ? 'Sound Off' : 'Sound On'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center gap-2 pt-6">
          {heroItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-[#E50914]'
                  : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
              title={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
