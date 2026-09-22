import React, { useState } from 'react';
import { useRouter } from './lib/router';
import { INITIAL_MEDIA_ITEMS } from './data/mockData';
import { MediaItem } from './types';
import { useWatchlist } from './hooks/useWatchlist';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { VideoPlayerModal } from './components/VideoPlayerModal';

import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { GenresPage } from './pages/GenresPage';
import { SearchPage } from './pages/SearchPage';
import { MediaDetailPage } from './pages/MediaDetailPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { AdminPage } from './pages/AdminPage';
import { LegalPage } from './pages/LegalPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  const { currentPath, params } = useRouter();
  const [catalog, setCatalog] = useState<MediaItem[]>(INITIAL_MEDIA_ITEMS);
  const {
    watchlist,
    toggleWatchlist,
    isInWatchlist,
    continueWatching,
    updateContinueWatching,
    removeContinueWatching
  } = useWatchlist();

  // Video player modal state
  const [playingMedia, setPlayingMedia] = useState<MediaItem | null>(null);
  const [playingEpisodeId, setPlayingEpisodeId] = useState<string | undefined>(undefined);

  const handlePlay = (item: MediaItem, episodeId?: string) => {
    setPlayingMedia(item);
    setPlayingEpisodeId(episodeId);
  };

  const handleClosePlayer = () => {
    setPlayingMedia(null);
    setPlayingEpisodeId(undefined);
  };

  // Admin state actions
  const handleAddMedia = (newItem: MediaItem) => {
    setCatalog((prev) => [newItem, ...prev]);
  };

  const handleDeleteMedia = (id: string) => {
    setCatalog((prev) => prev.filter((item) => item.id !== id));
  };

  const handleTogglePublish = (id: string) => {
    setCatalog((prev) =>
      prev.map((item) => (item.id === id ? { ...item, published: !item.published } : item))
    );
  };

  // Route Rendering Logic
  const renderCurrentPage = () => {
    // 1. Home
    if (currentPath === '/' || currentPath === '') {
      return (
        <HomePage
          catalog={catalog}
          continueWatching={continueWatching}
          isInWatchlist={isInWatchlist}
          onToggleWatchlist={toggleWatchlist}
          onPlay={handlePlay}
          onRemoveContinueWatching={removeContinueWatching}
        />
      );
    }

    // 2. Movies
    if (currentPath === '/movies') {
      return (
        <CatalogPage
          title="All Movies"
          subtitle="Explore Bengali theatrical cinema, Hollywood blockbusters, and international stories."
          items={catalog.filter((i) => i.type === 'movie')}
          defaultType="movie"
          isInWatchlist={isInWatchlist}
          onToggleWatchlist={toggleWatchlist}
          onPlay={handlePlay}
        />
      );
    }

    // 3. TV Shows
    if (currentPath === '/tv-shows') {
      return (
        <CatalogPage
          title="TV Shows"
          subtitle="Premium serialized television productions and multi-episode broadcasts."
          items={catalog.filter((i) => i.type === 'tv-show')}
          defaultType="tv-show"
          isInWatchlist={isInWatchlist}
          onToggleWatchlist={toggleWatchlist}
          onPlay={handlePlay}
        />
      );
    }

    // 4. Series
    if (currentPath === '/series') {
      return (
        <CatalogPage
          title="Web Series"
          subtitle="Original streaming series with high-tension plots, cliffhangers, and deep story arcs."
          items={catalog.filter((i) => i.type === 'series')}
          defaultType="series"
          isInWatchlist={isInWatchlist}
          onToggleWatchlist={toggleWatchlist}
          onPlay={handlePlay}
        />
      );
    }

    // 5. Latest Releases
    if (currentPath === '/latest') {
      return (
        <CatalogPage
          title="Latest Releases"
          subtitle="Recently added movies and series now streaming on bdcinemas."
          items={catalog}
          isInWatchlist={isInWatchlist}
          onToggleWatchlist={toggleWatchlist}
          onPlay={handlePlay}
        />
      );
    }

    // 6. Trending
    if (currentPath === '/trending') {
      return (
        <CatalogPage
          title="Trending Now"
          subtitle="The most-watched and highly rated releases by audiences this week."
          items={catalog.filter((i) => i.trending)}
          isInWatchlist={isInWatchlist}
          onToggleWatchlist={toggleWatchlist}
          onPlay={handlePlay}
        />
      );
    }

    // 7. Genres Root
    if (currentPath === '/genres') {
      return <GenresPage />;
    }

    // 8. Genre Detail (/genre/:genre)
    if (currentPath.startsWith('/genre/')) {
      const genreSlug = params.genre || '';
      const genreName = genreSlug.charAt(0).toUpperCase() + genreSlug.slice(1);
      return (
        <CatalogPage
          title={`${genreName} Titles`}
          subtitle={`Curated ${genreName.toLowerCase()} cinema, series, and dramatic features.`}
          items={catalog}
          defaultGenre={genreSlug}
          isInWatchlist={isInWatchlist}
          onToggleWatchlist={toggleWatchlist}
          onPlay={handlePlay}
        />
      );
    }

    // 9. Year Filter (/year/:year)
    if (currentPath.startsWith('/year/')) {
      const yearNum = parseInt(params.year || '2024') || 2024;
      return (
        <CatalogPage
          title={`Released in ${yearNum}`}
          subtitle={`All cinematic releases and series premiering in ${yearNum}.`}
          items={catalog}
          defaultYear={yearNum}
          isInWatchlist={isInWatchlist}
          onToggleWatchlist={toggleWatchlist}
          onPlay={handlePlay}
        />
      );
    }

    // 10. Search
    if (currentPath.startsWith('/search')) {
      return (
        <SearchPage
          catalog={catalog}
          isInWatchlist={isInWatchlist}
          onToggleWatchlist={toggleWatchlist}
          onPlay={handlePlay}
        />
      );
    }

    // 11. Movie Detail (/movie/:slug)
    if (currentPath.startsWith('/movie/')) {
      const slug = params.slug;
      const item = catalog.find((i) => i.slug === slug || i.id === slug);
      if (item) {
        return (
          <MediaDetailPage
            item={item}
            catalog={catalog}
            isInWatchlist={isInWatchlist}
            onToggleWatchlist={toggleWatchlist}
            onPlay={handlePlay}
          />
        );
      }
      return <NotFoundPage />;
    }

    // 12. Series Detail (/series/:slug)
    if (currentPath.startsWith('/series/')) {
      const slug = params.slug;
      const item = catalog.find((i) => i.slug === slug || i.id === slug);
      if (item) {
        return (
          <MediaDetailPage
            item={item}
            catalog={catalog}
            isInWatchlist={isInWatchlist}
            onToggleWatchlist={toggleWatchlist}
            onPlay={handlePlay}
          />
        );
      }
      return <NotFoundPage />;
    }

    // 13. TV Show Detail (/tv-show/:slug)
    if (currentPath.startsWith('/tv-show/')) {
      const slug = params.slug;
      const item = catalog.find((i) => i.slug === slug || i.id === slug);
      if (item) {
        return (
          <MediaDetailPage
            item={item}
            catalog={catalog}
            isInWatchlist={isInWatchlist}
            onToggleWatchlist={toggleWatchlist}
            onPlay={handlePlay}
          />
        );
      }
      return <NotFoundPage />;
    }

    // 14. Watchlist (/my-list)
    if (currentPath === '/my-list') {
      return (
        <WatchlistPage
          catalog={catalog}
          watchlist={watchlist}
          continueWatching={continueWatching}
          isInWatchlist={isInWatchlist}
          onToggleWatchlist={toggleWatchlist}
          onPlay={handlePlay}
          onRemoveContinueWatching={removeContinueWatching}
        />
      );
    }

    // 15. Admin (/admin)
    if (currentPath === '/admin') {
      return (
        <AdminPage
          catalog={catalog}
          onAddMedia={handleAddMedia}
          onDeleteMedia={handleDeleteMedia}
          onTogglePublish={handleTogglePublish}
        />
      );
    }

    // 16. Legal Pages
    if (['/about', '/contact', '/privacy', '/terms', '/copyright'].includes(currentPath)) {
      const pType = currentPath.replace('/', '') as any;
      return <LegalPage pageType={pType} />;
    }

    // 17. 404
    return <NotFoundPage />;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F5F5F7] flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      <Navbar watchlistCount={watchlist.length} />

      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      <Footer />

      {/* Fullscreen Video Player Modal */}
      {playingMedia && (
        <VideoPlayerModal
          media={playingMedia}
          episodeId={playingEpisodeId}
          onClose={handleClosePlayer}
          onProgressUpdate={updateContinueWatching}
          onSelectEpisode={(epId) => setPlayingEpisodeId(epId)}
        />
      )}
    </div>
  );
};
