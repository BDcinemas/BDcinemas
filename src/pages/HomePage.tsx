import React from 'react';
import { MediaItem, ContinueWatchingItem } from '../types';
import { HeroBanner } from '../components/HeroBanner';
import { ContinueWatchingRow } from '../components/ContinueWatchingRow';
import { ContentRow } from '../components/ContentRow';

interface HomePageProps {
  catalog: MediaItem[];
  continueWatching: ContinueWatchingItem[];
  isInWatchlist: (id: string) => boolean;
  onToggleWatchlist: (id: string) => void;
  onPlay: (item: MediaItem, episodeId?: string) => void;
  onRemoveContinueWatching: (mediaId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  catalog,
  continueWatching,
  isInWatchlist,
  onToggleWatchlist,
  onPlay,
  onRemoveContinueWatching
}) => {
  // Filter subsets for all requested sections
  const trending = catalog.filter((i) => i.trending);
  const latestMovies = catalog.filter((i) => i.type === 'movie').sort((a, b) => b.year - a.year);
  const latestTVShows = catalog.filter((i) => i.type === 'tv-show');
  const popularSeries = catalog.filter((i) => i.type === 'series');
  const banglaMovies = catalog.filter((i) => i.country === 'Bangladesh' && i.type === 'movie');
  const banglaSeries = catalog.filter((i) => i.country === 'Bangladesh' && i.type === 'series');
  const hindiSouth = catalog.filter((i) => i.country === 'India' || i.country === 'South Indian');
  const international = catalog.filter((i) => i.country === 'International');
  const actionMovies = catalog.filter((i) => i.genres.includes('Action'));
  const dramaMovies = catalog.filter((i) => i.genres.includes('Drama'));
  const thrillerMovies = catalog.filter((i) => i.genres.includes('Thriller'));
  const scifiMovies = catalog.filter((i) => i.genres.includes('Sci-Fi'));
  const romanceMovies = catalog.filter((i) => i.genres.includes('Romance'));
  const mostViewed = [...catalog].sort((a, b) => b.views - a.views);
  const comingSoon = catalog.filter((i) => i.comingSoon);

  return (
    <div className="min-h-screen bg-[#0A0A0C]">
      {/* 1. Cinematic Hero */}
      <HeroBanner
        items={catalog}
        isInWatchlist={isInWatchlist}
        onToggleWatchlist={onToggleWatchlist}
        onPlay={onPlay}
      />

      {/* 2. Continue Watching (if user has active history) */}
      <ContinueWatchingRow
        items={continueWatching}
        catalog={catalog}
        onPlay={onPlay}
        onRemove={onRemoveContinueWatching}
      />

      <div className="space-y-4">
        {/* Trending Now */}
        <ContentRow
          title="Trending Now"
          subtitle="Top watched releases this week across bdcinemas"
          items={trending}
          seeAllPath="/trending"
          isInWatchlist={isInWatchlist}
          onToggleWatchlist={onToggleWatchlist}
          onPlay={onPlay}
        />

        {/* Latest Movies */}
        <ContentRow
          title="Latest Movies"
          subtitle="Fresh theatrical and digital cinema premieres"
          items={latestMovies}
          seeAllPath="/movies"
          isInWatchlist={isInWatchlist}
          onToggleWatchlist={onToggleWatchlist}
          onPlay={onPlay}
        />

        {/* Popular Series */}
        <ContentRow
          title="Popular Web Series"
          subtitle="Binge-worthy multi-episode episodic sagas"
          items={popularSeries}
          seeAllPath="/series"
          isInWatchlist={isInWatchlist}
          onToggleWatchlist={onToggleWatchlist}
          onPlay={onPlay}
        />

        {/* Bangla Movies */}
        <ContentRow
          title="Bangla Cinema Masterpieces"
          subtitle="Critically celebrated Dhallywood and national award winners"
          items={banglaMovies}
          seeAllPath="/genre/drama"
          isInWatchlist={isInWatchlist}
          onToggleWatchlist={onToggleWatchlist}
          onPlay={onPlay}
        />

        {/* Bangla Original Series */}
        <ContentRow
          title="Bangla Original Series"
          subtitle="Original thrillers, dark crime stories, and mysteries"
          items={banglaSeries}
          seeAllPath="/series"
          isInWatchlist={isInWatchlist}
          onToggleWatchlist={onToggleWatchlist}
          onPlay={onPlay}
        />

        {/* Latest TV Shows */}
        <ContentRow
          title="Latest TV Shows"
          subtitle="Globally acclaimed television productions"
          items={latestTVShows}
          seeAllPath="/tv-shows"
          isInWatchlist={isInWatchlist}
          onToggleWatchlist={onToggleWatchlist}
          onPlay={onPlay}
        />

        {/* Hindi & South Indian */}
        <ContentRow
          title="Hindi & South Asian Cinema"
          subtitle="Mass entertainers and explosive blockbuster sensations"
          items={hindiSouth}
          seeAllPath="/movies"
          isInWatchlist={isInWatchlist}
          onToggleWatchlist={onToggleWatchlist}
          onPlay={onPlay}
        />

        {/* International & Bangla Dubbed */}
        <ContentRow
          title="International & Bangla Dubbed"
          subtitle="World cinema presented with master dual-audio and crisp subtitles"
          items={international}
          seeAllPath="/movies"
          isInWatchlist={isInWatchlist}
          onToggleWatchlist={onToggleWatchlist}
          onPlay={onPlay}
        />

        {/* Thrillers */}
        <ContentRow
          title="Edge-of-Your-Seat Thrillers"
          subtitle="Suspenseful mysteries, covert investigations, and high-tension plots"
          items={thrillerMovies}
          seeAllPath="/genre/thriller"
          isInWatchlist={isInWatchlist}
          onToggleWatchlist={onToggleWatchlist}
          onPlay={onPlay}
        />

        {/* Action */}
        <ContentRow
          title="High-Octane Action"
          subtitle="Fierce martial combat, explosive heists, and battles"
          items={actionMovies}
          seeAllPath="/genre/action"
          isInWatchlist={isInWatchlist}
          onToggleWatchlist={onToggleWatchlist}
          onPlay={onPlay}
        />

        {/* Sci-Fi */}
        <ContentRow
          title="Sci-Fi & Futuristic Journeys"
          subtitle="Mind-bending realities and deep space odysseys"
          items={scifiMovies}
          seeAllPath="/genre/sci-fi"
          isInWatchlist={isInWatchlist}
          onToggleWatchlist={onToggleWatchlist}
          onPlay={onPlay}
        />

        {/* Drama & Romance */}
        <ContentRow
          title="Emotion & Romance"
          subtitle="Passionate connections and intimate human stories"
          items={romanceMovies.length > 0 ? romanceMovies : dramaMovies}
          seeAllPath="/genre/romance"
          isInWatchlist={isInWatchlist}
          onToggleWatchlist={onToggleWatchlist}
          onPlay={onPlay}
        />

        {/* Most Viewed */}
        <ContentRow
          title="Most Viewed of All Time"
          subtitle="The titles our global audience returns to repeatedly"
          items={mostViewed}
          seeAllPath="/trending"
          isInWatchlist={isInWatchlist}
          onToggleWatchlist={onToggleWatchlist}
          onPlay={onPlay}
        />

        {/* Coming Soon */}
        {comingSoon.length > 0 && (
          <ContentRow
            title="Coming Soon to bdcinemas"
            subtitle="Upcoming theatrical titles arriving next"
            items={comingSoon}
            isInWatchlist={isInWatchlist}
            onToggleWatchlist={onToggleWatchlist}
            onPlay={onPlay}
          />
        )}
      </div>
    </div>
  );
};
