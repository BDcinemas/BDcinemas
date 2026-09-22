import React from 'react';
import { Play, X } from 'lucide-react';
import { MediaItem, ContinueWatchingItem } from '../types';

interface ContinueWatchingRowProps {
  items: ContinueWatchingItem[];
  catalog: MediaItem[];
  onPlay: (item: MediaItem, episodeId?: string) => void;
  onRemove: (mediaId: string) => void;
}

export const ContinueWatchingRow: React.FC<ContinueWatchingRowProps> = ({
  items,
  catalog,
  onPlay,
  onRemove
}) => {
  if (!items || items.length === 0) return null;

  const validItems = items
    .map((cw) => {
      const media = catalog.find((m) => m.id === cw.mediaId);
      return media ? { cw, media } : null;
    })
    .filter(Boolean) as { cw: ContinueWatchingItem; media: MediaItem }[];

  if (validItems.length === 0) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const remainingSecs = Math.floor(seconds % 60);
    return `${mins}m ${remainingSecs}s`;
  };

  return (
    <section className="py-4 sm:py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white mb-3 sm:mb-4">
        Continue Watching
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {validItems.map(({ cw, media }) => {
          const progressPercent = Math.min(
            100,
            Math.round((cw.currentPositionSeconds / cw.totalDurationSeconds) * 100)
          );
          const remainingMinutes = Math.max(
            1,
            Math.round((cw.totalDurationSeconds - cw.currentPositionSeconds) / 60)
          );

          // Find episode title if applicable
          let episodeTitle = '';
          if (cw.episodeId && media.seasons) {
            for (const s of media.seasons) {
              const ep = s.episodes.find((e) => e.id === cw.episodeId);
              if (ep) {
                episodeTitle = `${s.title.split(':')[0]} • ${ep.title}`;
                break;
              }
            }
          }

          return (
            <div
              key={media.id}
              className="group relative rounded-xl overflow-hidden bg-[#18181D] border border-white/10 hover:border-white/20 shadow-md transition-all duration-300"
            >
              {/* 16:9 Thumbnail Image */}
              <div
                className="relative aspect-video w-full cursor-pointer overflow-hidden"
                onClick={() => onPlay(media, cw.episodeId)}
              >
                <img
                  src={media.backdrop}
                  alt={media.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                {/* Center Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white transition-all">
                    <Play className="w-5 h-5 fill-black ml-0.5" />
                  </div>
                </div>

                {/* Dismiss button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(media.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black text-white/70 hover:text-white transition backdrop-blur-md"
                  title="Remove from Continue Watching"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Progress bar at bottom of thumbnail */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div
                    className="h-full bg-[#E50914] transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Title & Progress info */}
              <div className="p-3">
                <h3 className="text-sm font-semibold text-white truncate">
                  {media.title}
                </h3>
                {episodeTitle && (
                  <p className="text-xs text-[#E50914] truncate mt-0.5">
                    {episodeTitle}
                  </p>
                )}
                <div className="flex items-center justify-between text-[11px] text-white/50 mt-1">
                  <span>{formatTime(cw.currentPositionSeconds)}</span>
                  <span>{remainingMinutes}m remaining</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
