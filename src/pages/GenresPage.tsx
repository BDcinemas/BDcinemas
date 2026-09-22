import React from 'react';
import { GENRES } from '../data/mockData';
import { useRouter } from '../lib/router';
import { ChevronRight } from 'lucide-react';

export const GenresPage: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-[#0A0A0C] pt-24 sm:pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
            Browse Genres & Categories
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Explore curated thematic collections across cinema, thrillers, crime, and sci-fi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {GENRES.map((genre) => (
            <div
              key={genre.id}
              onClick={() => navigate(`/genre/${genre.slug}`)}
              className="group relative h-44 sm:h-52 rounded-2xl overflow-hidden bg-[#18181D] border border-white/10 hover:border-white/30 cursor-pointer shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              <img
                src={genre.backdrop}
                alt={genre.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />

              <div className="absolute inset-0 p-5 flex flex-col justify-end">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {genre.name}
                  </h3>
                  <span className="p-1.5 rounded-full bg-white/10 group-hover:bg-[#E50914] text-white transition">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-xs text-white/60 line-clamp-2 mt-1">
                  {genre.description}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#E50914] bg-[#E50914]/10 px-2 py-0.5 rounded-md">
                    {genre.titleCount}+ Titles
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
