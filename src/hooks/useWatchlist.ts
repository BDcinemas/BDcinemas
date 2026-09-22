import { useState, useEffect } from 'react';
import { ContinueWatchingItem } from '../types';

const WATCHLIST_KEY = 'bdcinemas_watchlist_v1';
const CONTINUE_WATCHING_KEY = 'bdcinemas_continue_watching_v1';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WATCHLIST_KEY);
      return saved ? JSON.parse(saved) : ['hawa-2022', 'mohanagar-series'];
    } catch {
      return ['hawa-2022', 'mohanagar-series'];
    }
  });

  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>(() => {
    try {
      const saved = localStorage.getItem(CONTINUE_WATCHING_KEY);
      return saved ? JSON.parse(saved) : [
        {
          mediaId: 'mohanagar-series',
          episodeId: 'mhn-s1-e1',
          currentPositionSeconds: 1240,
          totalDurationSeconds: 2160,
          timestamp: Date.now() - 3600000
        },
        {
          mediaId: 'hawa-2022',
          currentPositionSeconds: 4800,
          totalDurationSeconds: 7860,
          timestamp: Date.now() - 86400000
        }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    } catch (e) {
      console.error('Failed to save watchlist to localStorage', e);
    }
  }, [watchlist]);

  useEffect(() => {
    try {
      localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(continueWatching));
    } catch (e) {
      console.error('Failed to save continue watching to localStorage', e);
    }
  }, [continueWatching]);

  const toggleWatchlist = (id: string) => {
    setWatchlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isInWatchlist = (id: string) => watchlist.includes(id);

  const updateContinueWatching = (
    mediaId: string,
    episodeId: string | undefined,
    currentPositionSeconds: number,
    totalDurationSeconds: number
  ) => {
    setContinueWatching((prev) => {
      const filtered = prev.filter((item) => item.mediaId !== mediaId);
      return [
        {
          mediaId,
          episodeId,
          currentPositionSeconds,
          totalDurationSeconds,
          timestamp: Date.now()
        },
        ...filtered
      ];
    });
  };

  const removeContinueWatching = (mediaId: string) => {
    setContinueWatching((prev) => prev.filter((item) => item.mediaId !== mediaId));
  };

  return {
    watchlist,
    toggleWatchlist,
    isInWatchlist,
    continueWatching,
    updateContinueWatching,
    removeContinueWatching
  };
}
