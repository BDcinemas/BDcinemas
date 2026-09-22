export type MediaType = 'movie' | 'series' | 'tv-show';

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  durationSeconds: number;
  releaseDate: string;
  videoUrl?: string;
}

export interface Season {
  seasonNumber: number;
  title: string;
  episodes: Episode[];
}

export interface CastMember {
  name: string;
  character: string;
  avatar?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  slug: string;
  originalTitle: string;
  description: string;
  poster: string;
  backdrop: string;
  year: number;
  releaseDate: string;
  runtime: string;
  rating: number;
  genres: string[];
  language: string;
  country: string;
  quality: '4K UHD' | '1080p FHD' | '720p HD';
  type: MediaType;
  cast: string[];
  director: string;
  writer: string;
  views: number;
  featured?: boolean;
  trending?: boolean;
  comingSoon?: boolean;
  seasons?: Season[];
  videoUrl?: string;
  trailerUrl?: string;
  published: boolean;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  description: string;
  backdrop: string;
  titleCount: number;
}

export interface ContinueWatchingItem {
  mediaId: string;
  episodeId?: string;
  currentPositionSeconds: number;
  totalDurationSeconds: number;
  timestamp: number;
}

export interface FilterState {
  type?: MediaType | 'all';
  genre?: string;
  year?: number | 'all';
  language?: string;
  rating?: number | 'all';
  sort?: 'newest' | 'rating' | 'popular' | 'title';
}
