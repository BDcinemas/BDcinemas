import React, { useState } from 'react';
import { MediaItem, Episode } from '../types';
import { Play, Plus, Check, Share2, Star, Calendar, Clock, Globe, Award, Film, User, ChevronRight } from 'lucide-react';
import { MovieCard } from '../components/MovieCard';
import { useRouter } from '../lib/router';

interface MediaDetailPageProps {
  item: MediaItem;
  catalog: MediaItem[];
  isInWatchlist: (id: string) => boolean;
  onToggleWatchlist: (id: string) => void;
  onPlay: (item: MediaItem, episodeId?: string) => void;
}

export const MediaDetailPage: React.FC<MediaDetailPageProps> = ({
  item,
  catalog,
  isInWatchlist,
  onToggleWatchlist,
  onPlay
}) => {
  const { navigate } = useRouter();
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [copiedShare, setCopiedShare] = useState(false);

  const seasons = item.seasons || [];
  const currentSeason = seasons.find((s) => s.seasonNumber === selectedSeasonNumber) || seasons[0];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  // Related content: same genres or same language, excluding current item
  const relatedItems = catalog
    .filter(
      (m) =>
        m.id !== item.id &&
        (m.genres.some((g) => item.genres.includes(g)) || m.language === item.language)
    )
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white">
      {/* Immersive Backdrop Section */}
      <div className="relative w-full h-[60vh] sm:h-[70vh] min-h-[460px] overflow-hidden">
        <img
          src={item.backdrop}
          alt={item.title}
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0C] via-[#0A0A0C]/40 to-transparent" />

        {/* Floating Quick Action overlay on Backdrop */}
        <div className="absolute bottom-10 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="bg-[#E50914] px-2.5 py-0.5 rounded text-white shadow-lg">
                {item.quality}
              </span>
              <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 text-white/80">
                {item.language}
              </span>
              <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 text-white/80">
                {item.type.toUpperCase()}
              </span>
            </div>

            {item.originalTitle && item.originalTitle !== item.title && (
              <p className="text-base sm:text-lg font-medium text-white/70">
                {item.originalTitle}
              </p>
            )}

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-md">
              {item.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/70">
              <div className="flex items-center gap-1 text-[#FFD700]">
                <Star className="w-4 h-4 fill-[#FFD700]" />
                <span className="font-bold text-white">{item.rating}</span>
                <span className="text-white/40">/ 10</span>
              </div>
              <span>•</span>
              <span>{item.year}</span>
              <span>•</span>
              <span>{item.runtime}</span>
              <span>•</span>
              <span>{item.country}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Info & Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
          {/* Left Column: Poster & Metadata details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="relative aspect-[2/3] w-48 sm:w-60 lg:w-full rounded-2xl overflow-hidden bg-[#18181D] border border-white/10 shadow-2xl mx-auto lg:mx-0">
              <img
                src={item.poster}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Detailed metadata */}
            <div className="bg-[#18181D]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3.5 text-xs">
              <div>
                <p className="text-white/40 font-medium mb-1">Director</p>
                <p className="text-white font-semibold">{item.director}</p>
              </div>

              <div>
                <p className="text-white/40 font-medium mb-1">Writer</p>
                <p className="text-white font-semibold">{item.writer}</p>
              </div>

              <div>
                <p className="text-white/40 font-medium mb-1">Genres</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {item.genres.map((g) => (
                    <span
                      key={g}
                      onClick={() => navigate(`/genre/${g.toLowerCase()}`)}
                      className="px-2 py-0.5 rounded bg-white/10 text-white hover:bg-white/20 cursor-pointer transition"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-white/40 font-medium mb-1">Release Date</p>
                <p className="text-white">{item.releaseDate}</p>
              </div>

              <div>
                <p className="text-white/40 font-medium mb-1">Audio & Subtitles</p>
                <p className="text-white">{item.language} (Original Audio), Bangla Subtitles, English Subtitles</p>
              </div>
            </div>
          </div>

          {/* Right Column: Playback Controls, Synopsis, Cast, Episodes */}
          <div className="lg:col-span-2 space-y-8">
            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onPlay(item)}
                className="bg-white hover:bg-white/90 text-black px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 shadow-2xl transition hover:scale-105 active:scale-95"
              >
                <Play className="w-5 h-5 fill-black" />
                <span>Watch Now</span>
              </button>

              <button
                onClick={() => onPlay(item)}
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base flex items-center gap-2 border border-white/10 transition"
              >
                <span>Trailer</span>
              </button>

              <button
                onClick={() => onToggleWatchlist(item.id)}
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md p-3.5 rounded-xl font-semibold text-sm sm:text-base flex items-center gap-2 border border-white/10 transition"
                title={isInWatchlist(item.id) ? 'Remove from My List' : 'Add to My List'}
              >
                {isInWatchlist(item.id) ? <Check className="w-5 h-5 text-[#E50914]" /> : <Plus className="w-5 h-5" />}
                <span className="hidden sm:inline">My List</span>
              </button>

              <button
                onClick={handleShare}
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md p-3.5 rounded-xl font-semibold text-sm sm:text-base flex items-center gap-2 border border-white/10 transition ml-auto"
                title="Share Title"
              >
                <Share2 className="w-5 h-5" />
                <span className="hidden sm:inline">{copiedShare ? 'Copied URL!' : 'Share'}</span>
              </button>
            </div>

            {/* Synopsis */}
            <div>
              <h2 className="text-lg font-bold text-white mb-2">Overview</h2>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                {item.description}
              </p>
            </div>

            {/* Cast & Characters */}
            <div>
              <h2 className="text-lg font-bold text-white mb-3">Top Cast</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {item.cast.map((actor, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#18181D] border border-white/5 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-white/80 text-xs">
                      {actor.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{actor}</p>
                      <p className="text-[10px] text-white/40">Starring</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seasons & Episodes (for Series / TV Shows) */}
            {seasons.length > 0 && (
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Episodes</h2>

                  {/* Season Selector */}
                  {seasons.length > 1 && (
                    <div className="flex items-center gap-2">
                      {seasons.map((s) => (
                        <button
                          key={s.seasonNumber}
                          onClick={() => setSelectedSeasonNumber(s.seasonNumber)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            selectedSeasonNumber === s.seasonNumber
                              ? 'bg-white text-black'
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                        >
                          Season {s.seasonNumber}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Episodes List */}
                <div className="space-y-3">
                  {currentSeason?.episodes.map((ep) => (
                    <div
                      key={ep.id}
                      onClick={() => onPlay(item, ep.id)}
                      className="group p-3 sm:p-4 rounded-2xl bg-[#18181D]/80 hover:bg-[#18181D] border border-white/10 hover:border-white/20 flex flex-col sm:flex-row items-start sm:items-center gap-4 cursor-pointer transition"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video w-full sm:w-44 rounded-xl overflow-hidden bg-black flex-shrink-0">
                        <img
                          src={ep.thumbnail}
                          alt={ep.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <div className="w-9 h-9 rounded-full bg-white/90 group-hover:bg-white text-black flex items-center justify-center shadow-lg transition group-hover:scale-110">
                            <Play className="w-4 h-4 fill-black ml-0.5" />
                          </div>
                        </div>
                      </div>

                      {/* Episode details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-white group-hover:text-[#E50914] transition truncate">
                            {ep.title}
                          </h4>
                          <span className="text-xs text-white/50">{ep.duration}</span>
                        </div>
                        <p className="text-xs text-white/60 line-clamp-2 mt-1 leading-relaxed">
                          {ep.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Titles */}
        {relatedItems.length > 0 && (
          <div className="mt-16 pt-8 border-t border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
              More Like This
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedItems.map((rel) => (
                <MovieCard
                  key={rel.id}
                  item={rel}
                  isInWatchlist={isInWatchlist(rel.id)}
                  onToggleWatchlist={onToggleWatchlist}
                  onPlay={onPlay}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
