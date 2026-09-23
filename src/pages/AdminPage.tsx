import React, { useEffect, useState } from 'react';
import { MediaItem, Season, Episode } from '../types';
import {
  Shield, Film, Tv, Video, Eye, Plus, Trash2, EyeOff, Pencil, LogOut,
  Search, Loader2, CheckCircle2, AlertCircle, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { metadataService, validateImdbId, cleanImdbId, FetchedImdbMetadata } from '../services/imdbService';
import { googleAppsScriptService } from '../services/googleAppsScriptService';

interface AdminPageProps {
  catalog: MediaItem[];
  onAddMedia: (item: MediaItem) => void;
  onDeleteMedia: (id: string) => void;
  onTogglePublish: (id: string) => void;
  onSetCatalog: (items: MediaItem[]) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  catalog,
  onAddMedia,
  onDeleteMedia,
  onTogglePublish,
  onSetCatalog
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminRole, setAdminRole] = useState('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSyncingCatalog, setIsSyncingCatalog] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [updatingPublishId, setUpdatingPublishId] = useState<string | null>(null);
  const [publishStatusSuccess, setPublishStatusSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const storedSessionId = sessionStorage.getItem('bdcinemas_admin_session');

      if (!storedSessionId) {
        if (!cancelled) setIsCheckingSession(false);
        return;
      }

      try {
        const response = await googleAppsScriptService.checkSession(storedSessionId);

        if (cancelled) return;

        if (response.success) {
          setSessionId(storedSessionId);
          setAdminEmail(sessionStorage.getItem('bdcinemas_admin_email') || '');
          setAdminRole(sessionStorage.getItem('bdcinemas_admin_role') || 'admin');

          try {
            const contentResponse =
              await googleAppsScriptService.getContent(storedSessionId);

            if (
              !cancelled &&
              contentResponse.success &&
              Array.isArray(contentResponse.data)
            ) {
              onSetCatalog(contentResponse.data);
            }
          } catch (error) {
            console.error('Failed to load admin catalog:', error);
          }
        } else {
          sessionStorage.removeItem('bdcinemas_admin_session');
          sessionStorage.removeItem('bdcinemas_admin_email');
          sessionStorage.removeItem('bdcinemas_admin_role');
        }
      } catch (error) {
        console.error('Failed to restore admin session:', error);
        sessionStorage.removeItem('bdcinemas_admin_session');
        sessionStorage.removeItem('bdcinemas_admin_email');
        sessionStorage.removeItem('bdcinemas_admin_role');
      } finally {
        if (!cancelled) setIsCheckingSession(false);
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [onSetCatalog]);

  const refreshAdminCatalog = async (activeSessionId: string) => {
    setIsSyncingCatalog(true);
    setActionError(null);

    try {
      const response =
        await googleAppsScriptService.getContent(activeSessionId);

      if (!response.success || !Array.isArray(response.data)) {
        throw new Error(
          response.error || 'Failed to load catalog from Google Sheets.'
        );
      }

      onSetCatalog(response.data);
    } catch (error: any) {
      setActionError(
        error?.message ||
          'Failed to synchronize catalog with Google Sheets.'
      );
      throw error;
    } finally {
      setIsSyncingCatalog(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoginError(null);

    const email = loginEmail.trim().toLowerCase();
    const password = loginPassword;

    if (!email || !password) {
      setLoginError('Email and password are required.');
      return;
    }

    setIsLoggingIn(true);

    try {
      const response =
        await googleAppsScriptService.login(email, password);

      if (!response.success || !response.sessionId) {
        setLoginError(response.error || 'Invalid email or password.');
        return;
      }

      sessionStorage.setItem(
        'bdcinemas_admin_session',
        response.sessionId
      );
      sessionStorage.setItem(
        'bdcinemas_admin_email',
        response.admin?.email || email
      );
      sessionStorage.setItem(
        'bdcinemas_admin_role',
        response.admin?.role || 'admin'
      );

      setSessionId(response.sessionId);
      setAdminEmail(response.admin?.email || email);
      setAdminRole(response.admin?.role || 'admin');
      setLoginPassword('');

      await refreshAdminCatalog(response.sessionId);
    } catch (error) {
      setLoginError(
        error instanceof Error
          ? error.message
          : 'Unable to connect to the admin service.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    const activeSessionId = sessionId;

    try {
      if (activeSessionId) {
        await googleAppsScriptService.logout(activeSessionId);
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      sessionStorage.removeItem('bdcinemas_admin_session');
      sessionStorage.removeItem('bdcinemas_admin_email');
      sessionStorage.removeItem('bdcinemas_admin_role');

      setSessionId(null);
      setAdminEmail('');
      setAdminRole('');
      setShowAddForm(false);
      setActionError(null);
    }
  };


  // Form Fields per NEW ADMIN WORKFLOW:
  // 1. Content Type (default 'movie')
  // 2. IMDb ID
  // 3. Watch Link
  // 4. Custom Poster URL (Optional override)
  // 5. Optional manual edits: Title, Year, Genre, Description, Backdrop
  const [type, setType] = useState<'movie' | 'series' | 'tv-show'>('movie');
  const [imdbId, setImdbId] = useState('');
  const [watchLink, setWatchLink] = useState('');

  // Season / Episode editor
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [newSeasonTitle, setNewSeasonTitle] = useState('');
  const [newEpisodeSeasonNumber, setNewEpisodeSeasonNumber] = useState<number | null>(null);
  const [newEpisodeTitle, setNewEpisodeTitle] = useState('');
  const [newEpisodeVideoUrl, setNewEpisodeVideoUrl] = useState('');
  const [editingEpisodeId, setEditingEpisodeId] = useState<string | null>(null);
  const [customPoster, setCustomPoster] = useState('');

  // Automatically populated fields (can be reviewed / adjusted before publishing)
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [genre, setGenre] = useState('Drama');
  const [description, setDescription] = useState('');
  const [backdrop, setBackdrop] = useState('');
  const [featured, setFeatured] = useState(false);
  const [trending, setTrending] = useState(false);

  // Retrieved IMDb metadata
  const [retrievedRating, setRetrievedRating] = useState<number | undefined>(undefined);
  const [retrievedVotes, setRetrievedVotes] = useState<string | undefined>(undefined);
  const [retrievedPoster, setRetrievedPoster] = useState<string | undefined>(undefined);
  const [retrievedMetadata, setRetrievedMetadata] = useState<FetchedImdbMetadata | null>(null);

  // Fetch status indicators
  const [isFetchingImdb, setIsFetchingImdb] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchSuccessMessage, setFetchSuccessMessage] = useState<string | null>(null);

  // Resolved poster for preview & final save: customPoster overrides automatically retrieved poster
  const resolvedPoster = customPoster.trim() || retrievedPoster || '';

  const totalMovies = catalog.filter((i) => i.type === 'movie').length;
  const totalSeries = catalog.filter((i) => i.type === 'series').length;
  const totalTVShows = catalog.filter((i) => i.type === 'tv-show').length;
  const totalEpisodes = catalog.reduce(
    (acc, item) => acc + (Array.isArray(item.seasons) ? item.seasons.reduce((sAcc, s) => sAcc + (Array.isArray(s.episodes) ? s.episodes.length : 0), 0) : 0),
    0
  );
  const totalViews = catalog.reduce((acc, item) => acc + (Number(item.views) || 0), 0);

  // Reset form helper
  const resetForm = () => {
    setEditingId(null);
    setType('movie');
    setImdbId('');
    setWatchLink('');
    setSeasons([]);
    setNewSeasonTitle('');
    setNewEpisodeSeasonNumber(null);
    setNewEpisodeTitle('');
    setNewEpisodeVideoUrl('');
    setEditingEpisodeId(null);
    setCustomPoster('');
    setTitle('');
    setYear('');
    setGenre('Drama');
    setDescription('');
    setBackdrop('');
    setFeatured(false);
    setTrending(false);
    setRetrievedRating(undefined);
    setRetrievedVotes(undefined);
    setRetrievedPoster(undefined);
    setRetrievedMetadata(null);
    setFetchError(null);
    setFetchSuccessMessage(null);
  };

  /**
   * Action: Fetch IMDb Data
   * 1. Validates IMDb ID.
   * 2. Automatically retrieves metadata + best available poster.
   * 3. Populates poster, rating, votes, title, year, runtime, genres, description, cast.
   * 4. Displays rich poster preview with metadata for Admin review.
   */
  const handleFetchImdb = async () => {
    setFetchError(null);
    setFetchSuccessMessage(null);

    const cleanedId = cleanImdbId(imdbId);
    if (!cleanedId) {
      setFetchError('Please enter an IMDb ID (e.g. tt1375666).');
      return;
    }

    if (!validateImdbId(cleanedId)) {
      setFetchError('Invalid IMDb ID format. Must begin with "tt" followed by 7-9 digits (e.g. tt1375666).');
      return;
    }

    setIsFetchingImdb(true);

    try {
      const res = await metadataService.fetchByImdbId(cleanedId);

      if (res.success && res.data) {
        const data = res.data;
        setRetrievedMetadata(data);

        // 1. Automatically retrieve & populate best available poster
        if (data.poster) {
          setRetrievedPoster(data.poster);
        } else {
          setRetrievedPoster(undefined);
        }

        // 2. Automatically retrieve ratings and votes
        if (data.imdbRating !== undefined) {
          setRetrievedRating(data.imdbRating);
        }
        if (data.imdbVotes) {
          setRetrievedVotes(data.imdbVotes);
        }

        // 3. Automatically populate title, year, genres, description, backdrop
        if (data.title) {
          setTitle(data.title);
        }
        if (data.year) {
          setYear(data.year.toString());
        }
        if (data.genres && data.genres.length > 0) {
          setGenre(data.genres[0]);
        }
        if (data.description) {
          setDescription(data.description);
        }
        if (data.backdrop) {
          setBackdrop(data.backdrop);
        }

        const ratingText = data.imdbRating ? `IMDb: ${data.imdbRating}` : 'Metadata linked';
        const posterText = data.poster ? 'Poster imported' : 'Poster unavailable';
        setFetchSuccessMessage(`Successfully retrieved "${data.title || cleanedId}" (${ratingText}, ${posterText}) via ${res.providerName}.`);
      } else {
        // Provider unavailable:
        // Do not invent fake ratings or fake posters.
        // Clearly indicate that IMDb metadata could not be retrieved.
        // Still allow Admin to publish with manual information.
        setRetrievedRating(undefined);
        setRetrievedVotes(undefined);
        setRetrievedPoster(undefined);
        setRetrievedMetadata(null);
        setFetchError(res.error || 'IMDb metadata could not be retrieved. You may enter information manually.');
      }
    } catch (err: any) {
      setRetrievedRating(undefined);
      setRetrievedVotes(undefined);
      setRetrievedPoster(undefined);
      setFetchError('Connection error contacting movie metadata provider. You may enter details manually.');
    } finally {
      setIsFetchingImdb(false);
    }
  };

  const addSeason = () => {
    const nextSeasonNumber =
      seasons.length > 0
        ? Math.max(
            ...seasons.map(
              (season) => Number(season.seasonNumber) || 0
            )
          ) + 1
        : 1;

    const newSeason: Season = {
      seasonNumber: nextSeasonNumber,
      title:
        newSeasonTitle.trim() ||
        `Season ${nextSeasonNumber}`,
      episodes: []
    };

    setSeasons((current) => [...current, newSeason]);
    setNewSeasonTitle('');
  };

  const updateSeasonTitle = (
    seasonNumber: number,
    value: string
  ) => {
    setSeasons((current) =>
      current.map((season) =>
        season.seasonNumber === seasonNumber
          ? { ...season, title: value }
          : season
      )
    );
  };

  const removeSeason = (seasonNumber: number) => {
    setSeasons((current) =>
      current.filter(
        (season) => season.seasonNumber !== seasonNumber
      )
    );

    if (newEpisodeSeasonNumber === seasonNumber) {
      setNewEpisodeSeasonNumber(null);
      setNewEpisodeTitle('');
      setNewEpisodeVideoUrl('');
      setEditingEpisodeId(null);
    }
  };

  const startAddEpisode = (seasonNumber: number) => {
    setNewEpisodeSeasonNumber(seasonNumber);
    setEditingEpisodeId(null);
    setNewEpisodeTitle('');
    setNewEpisodeVideoUrl('');
    setFetchError(null);
  };

  const addOrUpdateEpisode = (seasonNumber: number) => {
    const episodeTitle = newEpisodeTitle.trim();
    const episodeVideoUrl = newEpisodeVideoUrl.trim();

    if (!episodeTitle) {
      setFetchError('Episode title is required.');
      return;
    }

    if (!episodeVideoUrl) {
      setFetchError('Episode Watch Link is required.');
      return;
    }

    setSeasons((current) =>
      current.map((season) => {
        if (season.seasonNumber !== seasonNumber) {
          return season;
        }

        if (editingEpisodeId) {
          return {
            ...season,
            episodes: season.episodes.map((episode) =>
              episode.id === editingEpisodeId
                ? {
                    ...episode,
                    title: episodeTitle,
                    videoUrl: episodeVideoUrl
                  }
                : episode
            )
          };
        }

        const nextEpisodeNumber =
          season.episodes.length > 0
            ? Math.max(
                ...season.episodes.map(
                  (episode) =>
                    Number(episode.episodeNumber) || 0
                )
              ) + 1
            : 1;

        const episode: Episode = {
          id: `episode-${Date.now()}-${nextEpisodeNumber}`,
          episodeNumber: nextEpisodeNumber,
          title: episodeTitle,
          description: '',
          thumbnail: '',
          duration: '',
          durationSeconds: 0,
          releaseDate: '',
          videoUrl: episodeVideoUrl
        };

        return {
          ...season,
          episodes: [...season.episodes, episode]
        };
      })
    );

    setNewEpisodeTitle('');
    setNewEpisodeVideoUrl('');
    setEditingEpisodeId(null);
    setNewEpisodeSeasonNumber(null);
    setFetchError(null);
  };

  const startEditEpisode = (
    seasonNumber: number,
    episode: Episode
  ) => {
    setNewEpisodeSeasonNumber(seasonNumber);
    setEditingEpisodeId(episode.id);
    setNewEpisodeTitle(episode.title || '');
    setNewEpisodeVideoUrl(episode.videoUrl || '');
    setFetchError(null);
  };

  const removeEpisode = (
    seasonNumber: number,
    episodeId: string
  ) => {
    setSeasons((current) =>
      current.map((season) =>
        season.seasonNumber === seasonNumber
          ? {
              ...season,
              episodes: season.episodes.filter(
                (episode) => episode.id !== episodeId
              )
            }
          : season
      )
    );

    if (editingEpisodeId === episodeId) {
      setEditingEpisodeId(null);
      setNewEpisodeSeasonNumber(null);
      setNewEpisodeTitle('');
      setNewEpisodeVideoUrl('');
    }
  };

  const handleEditBackend = (item: MediaItem) => {
    setActionError(null);
    setPublishSuccess(null);
    setPublishStatusSuccess(null);

    setEditingId(item.id);

    setSeasons(
      Array.isArray(item.seasons)
        ? item.seasons
        : []
    );
    setNewSeasonTitle('');
    setNewEpisodeSeasonNumber(null);
    setNewEpisodeTitle('');
    setNewEpisodeVideoUrl('');
    setEditingEpisodeId(null);
    setShowAddForm(true);

    setType(item.type);
    setImdbId(item.imdbId || '');
    setWatchLink(item.videoUrl || '');
    setCustomPoster(item.poster || '');
    setTitle(item.title || '');
    setYear(item.year ? String(item.year) : '');
    setGenre(item.genres?.[0] || 'Drama');
    setDescription(item.description || '');
    setBackdrop(item.backdrop || '');
    setFeatured(Boolean(item.featured));
    setTrending(Boolean(item.trending));

    setRetrievedRating(
      item.imdbRating ?? item.rating ?? undefined
    );

    setRetrievedVotes(item.imdbVotes || undefined);
    setRetrievedPoster(item.poster || undefined);
    setRetrievedMetadata(null);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleTogglePublishBackend = async (item: MediaItem) => {
    if (!sessionId) {
      setActionError('Your admin session has expired. Please log in again.');
      return;
    }

    setActionError(null);
    setPublishStatusSuccess(null);
    setUpdatingPublishId(item.id);

    const nextPublishedState = !item.published;

    try {
      const response = await googleAppsScriptService.publishContent(
        sessionId,
        item.id,
        nextPublishedState
      );

      if (!response.success) {
        throw new Error(
          response.error ||
          response.message ||
          'Publish status could not be updated.'
        );
      }

      setPublishStatusSuccess(
        `"${item.title}" ${nextPublishedState ? 'Published Successfully' : 'Unpublished Successfully'}`
      );

      await refreshAdminCatalog(sessionId);
    } catch (error: any) {
      console.error('Failed to update publish status:', error);
      setActionError(
        error?.message ||
        'Failed to update publish status.'
      );
    } finally {
      setUpdatingPublishId(null);
    }
  };

  const handleDeleteBackend = async (item: MediaItem) => {
    if (!sessionId) {
      setActionError('Your admin session has expired. Please log in again.');
      return;
    }

    const confirmed = window.confirm(
      `Delete "${item.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setActionError(null);

    try {
      const response = await googleAppsScriptService.deleteContent(
        sessionId,
        item.id
      );

      if (!response.success) {
        throw new Error(
          response.error ||
          response.message ||
          'Content could not be deleted.'
        );
      }

      await refreshAdminCatalog(sessionId);
    } catch (error: any) {
      console.error('Failed to delete content:', error);
      setActionError(
        error?.message ||
        'Failed to delete content.'
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionId) {
      setFetchError('Your admin session has expired. Please log in again.');
      return;
    }

    if (!title.trim()) {
      setFetchError('Title is required to publish. Please fetch IMDb data or enter a title.');
      return;
    }

    if (!watchLink.trim()) {
      setFetchError('Watch Link is required to publish.');
      return;
    }

    const cleanedId = imdbId.trim() ? cleanImdbId(imdbId) : undefined;
    const finalYear = parseInt(year) || (retrievedMetadata?.year) || new Date().getFullYear();

    // Final resolved poster: customPoster > retrievedPoster > fallback
    const finalPoster = resolvedPoster || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80';
    const finalBackdrop = backdrop.trim() || retrievedMetadata?.backdrop || finalPoster;
    const finalWatchLink = watchLink.trim();
    const isEpisodicType =
      type === 'series' || type === 'tv-show';

    const newItem: MediaItem = {
      id: `title-${Date.now()}`,
      title: title.trim(),
      slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      originalTitle: retrievedMetadata?.originalTitle || title.trim(),
      description: description.trim() || retrievedMetadata?.description || 'Curated release on bdcinemas.',
      poster: finalPoster,
      backdrop: finalBackdrop,
      year: finalYear,
      releaseDate: retrievedMetadata?.releaseDate || `${finalYear}`,
      runtime: retrievedMetadata?.runtime || (type === 'movie' ? '2h 05m' : '1 Season'),
      rating: retrievedRating || 0,
      imdbId: cleanedId,
      imdbRating: retrievedRating,
      imdbVotes: retrievedVotes,
      genres: [genre],
      language: retrievedMetadata?.language || 'Bengali',
      country: retrievedMetadata?.country || 'Bangladesh',
      quality: '4K UHD',
      type,
      cast: retrievedMetadata?.cast || ['Cast Members'],
      director: retrievedMetadata?.director || 'Director',
      writer: retrievedMetadata?.writer || 'Writer',
      views: 1200,
      featured,
      trending,
      published: true,
      videoUrl: finalWatchLink,
    seasons: isEpisodicType ? seasons : []
    };

    try {
      setFetchError(null);
      setPublishSuccess(null);
      setIsPublishing(true);

      const contentPayload = {
        title: newItem.title,
        type: newItem.type,
        imdbId: newItem.imdbId || '',
        imdbRating: newItem.imdbRating ?? '',
        imdbVotes: newItem.imdbVotes ?? '',
        poster: newItem.poster,
        backdrop: newItem.backdrop,
        year: newItem.year,
        runtime: newItem.runtime,
        genres: newItem.genres.join(', '),
        description: newItem.description,
        cast: newItem.cast.join(', '),
        director: newItem.director,
        writer: newItem.writer,
        watchUrl: newItem.videoUrl || '',
        featured: newItem.featured,
        trending: newItem.trending,
        latest: true,
      seasons: newItem.seasons || []
      };

      let response;

      if (editingId) {
        response = await googleAppsScriptService.updateContent(
          sessionId,
          editingId,
          contentPayload
        );
      } else {
        response = await googleAppsScriptService.createContent(
          sessionId,
          {
            ...contentPayload,
            published: true
          }
        );
      }

      if (!response.success) {
        throw new Error(
          response.error ||
          response.message ||
          editingId ? 'Content could not be updated.' : 'Content could not be saved to Google Sheets.'
        );
      }

      await refreshAdminCatalog(sessionId);

      setPublishSuccess(
        editingId
          ? `"${newItem.title}" updated successfully.`
          : `"${newItem.title}" has been published successfully.`
      );

      resetForm();
      setShowAddForm(false);
    } catch (error: any) {
      console.error('Failed to create content:', error);

      setFetchError(
        error?.message ||
        'Failed to save content to Google Sheets.'
      );
    } finally {
      setIsPublishing(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-[#18181D] border border-white/10 p-8 text-center shadow-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-[#E50914] mx-auto mb-4" />
          <h1 className="text-lg font-bold text-white">
            Checking Admin Session
          </h1>
          <p className="text-xs text-white/40 mt-2">
            Please wait while your secure session is verified.
          </p>
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center px-4 py-16">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-2xl bg-[#18181D] border border-white/10 p-6 sm:p-8 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#E50914]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Admin Login</h1>
              <p className="text-xs text-white/40 mt-0.5">
                bdcinemas Admin Console
              </p>
            </div>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Email
              </label>
              <input
                type="email"
                autoComplete="username"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full px-4 py-3 rounded-xl bg-[#E50914] hover:bg-[#ff334b] text-white text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] pt-24 sm:pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#E50914]" />
              <h1 className="text-2xl sm:text-3xl font-black text-white">Admin Console</h1>
            </div>
            <p className="text-xs sm:text-sm text-white/50 mt-1">
              Automated IMDb metadata & poster ingestion, live catalog administration, and telemetry.
            </p>
          </div>

          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (!showAddForm) resetForm();
            }}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#ff334b] text-white text-xs font-bold flex items-center gap-2 transition shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Close Form' : 'Add New Title'}</span>
          </button>
        </div>

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-[#18181D] border border-white/10">
            <div className="flex items-center justify-between text-white/50 text-xs mb-1">
              <span>Movies</span>
              <Film className="w-4 h-4 text-[#E50914]" />
            </div>
            <p className="text-2xl font-bold text-white">{totalMovies}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#18181D] border border-white/10">
            <div className="flex items-center justify-between text-white/50 text-xs mb-1">
              <span>Web Series</span>
              <Tv className="w-4 h-4 text-[#E50914]" />
            </div>
            <p className="text-2xl font-bold text-white">{totalSeries}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#18181D] border border-white/10">
            <div className="flex items-center justify-between text-white/50 text-xs mb-1">
              <span>TV Shows</span>
              <Video className="w-4 h-4 text-[#E50914]" />
            </div>
            <p className="text-2xl font-bold text-white">{totalTVShows}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#18181D] border border-white/10">
            <div className="flex items-center justify-between text-white/50 text-xs mb-1">
              <span>Episodes</span>
              <Film className="w-4 h-4 text-[#E50914]" />
            </div>
            <p className="text-2xl font-bold text-white">{totalEpisodes}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#18181D] border border-white/10 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-white/50 text-xs mb-1">
              <span>Total Views</span>
              <Eye className="w-4 h-4 text-[#E50914]" />
            </div>
            <p className="text-2xl font-bold text-white">{(totalViews / 1000000).toFixed(1)}M+</p>
          </div>
        </div>

        {/* Add Title Form with Automatic Poster & IMDb Ingestion */}
        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 p-6 sm:p-8 rounded-2xl bg-[#18181D] border border-[#E50914]/40 space-y-6 max-w-4xl shadow-2xl transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#E50914]" />
                  <span>Ingest Content via IMDb Metadata & Poster</span>
                </h3>
                <span className="text-xs text-white/40">Automated Admin Workflow</span>
              </div>
              <p className="text-xs text-white/50 mt-1">
                Select Content Type, enter the IMDb ID, and click <strong className="text-white">Fetch IMDb Data</strong>. The best available poster, rating, and metadata will be automatically retrieved. Then enter your Watch Link and publish.
              </p>
            </div>

            {/* Step 1 & 2: Content Type & IMDb Ingestion Field */}
            <div className="bg-black/40 border border-white/10 p-4 sm:p-5 rounded-xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Content Type */}
                <div>
                  <label className="block text-xs font-semibold text-white/90 mb-1.5">
                    1. Content Type <span className="text-[#E50914]">*</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-[#18181D] border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                  >
                    <option value="movie">Movie</option>
                    <option value="series">Web Series</option>
                    <option value="tv-show">TV Show</option>
                  </select>
                </div>

                {/* 2. IMDb ID */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-white/90 mb-1.5">
                    2. IMDb ID <span className="text-[#E50914]">*</span> (Format: tt1234567)
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <input
                      type="text"
                      value={imdbId}
                      onChange={(e) => setImdbId(e.target.value)}
                      placeholder="e.g. tt1375666 (Inception)"
                      className="flex-1 bg-[#18181D] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                    />
                    <button
                      type="button"
                      onClick={handleFetchImdb}
                      disabled={isFetchingImdb}
                      className="px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#ff334b] text-white text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md cursor-pointer flex-shrink-0"
                    >
                      {isFetchingImdb ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Fetching IMDb Data...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>Fetch IMDb Data</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status & Results Banner */}
              {fetchSuccessMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-start gap-2.5 text-xs text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{fetchSuccessMessage}</p>
                    {retrievedRating !== undefined && (
                      <p className="text-white mt-1">
                        Retrieved Rating: <span className="font-black text-[#FFD700] text-sm">★ {retrievedRating.toFixed(1)}</span>
                        {retrievedVotes && <span className="text-white/50 text-[11px] ml-1.5">({retrievedVotes} votes)</span>}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {fetchError && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2.5 text-xs text-amber-300">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <p className="font-semibold">Notice</p>
                    <p className="text-amber-200/90">{fetchError}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Poster Preview & Information Review Section */}
            {(resolvedPoster || title || isFetchingImdb) && (
              <div className="bg-black/30 border border-white/10 rounded-xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                  <span className="text-xs font-bold text-white tracking-wider uppercase flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#E50914]" />
                    <span>Poster Preview & Imported Details</span>
                  </span>
                  {customPoster ? (
                    <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                      Custom Poster Override Active
                    </span>
                  ) : retrievedPoster ? (
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                      Automatically Retrieved Poster
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {/* Poster Preview Container (2:3 Aspect Ratio) */}
                  <div className="w-36 sm:w-44 flex-shrink-0">
                    <div className="aspect-[2/3] w-full rounded-xl overflow-hidden bg-black/80 border border-white/10 relative shadow-2xl flex items-center justify-center">
                      {isFetchingImdb ? (
                        <div className="flex flex-col items-center justify-center gap-2 text-white/50 text-xs">
                          <Loader2 className="w-6 h-6 animate-spin text-[#E50914]" />
                          <span>Retrieving poster...</span>
                        </div>
                      ) : resolvedPoster ? (
                        <img
                          src={resolvedPoster}
                          alt={title || 'Poster preview'}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300"
                          onError={(e) => {
                            // Graceful fallback for broken image URLs
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-3 text-center text-white/40 text-xs gap-1.5">
                          <ImageIcon className="w-8 h-8 stroke-1 text-white/20" />
                          <span className="font-medium text-white/60">Poster unavailable</span>
                          <span className="text-[10px] text-white/30">Enter a custom poster URL below if needed</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata Summary Review */}
                  <div className="flex-1 space-y-2.5 text-xs">
                    <div>
                      <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Title</span>
                      <h4 className="text-base sm:text-lg font-bold text-white">
                        {title || <span className="text-white/30 italic">No title yet</span>}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {retrievedRating !== undefined && (
                        <div className="bg-[#FFD700]/20 border border-[#FFD700]/40 text-[#FFD700] px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
                          <span>IMDb:</span>
                          <span className="text-white font-black">{retrievedRating.toFixed(1)}</span>
                          {retrievedVotes && <span className="text-white/50 text-[10px]">({retrievedVotes})</span>}
                        </div>
                      )}

                      {year && (
                        <div className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-white/80">
                          Year: <strong className="text-white">{year}</strong>
                        </div>
                      )}

                      {genre && (
                        <div className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-white/80">
                          Genre: <strong className="text-white">{genre}</strong>
                        </div>
                      )}
                    </div>

                    {description && (
                      <p className="text-white/70 line-clamp-3 leading-relaxed text-xs pt-1">
                        {description}
                      </p>
                    )}

                    {retrievedMetadata?.cast && (
                      <p className="text-white/40 text-[11px] pt-1">
                        <strong className="text-white/60">Cast:</strong> {retrievedMetadata.cast.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Watch Link & Custom Poster Override */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Watch Link (Required) */}
              <div className="sm:col-span-2">
                <label className="block text-white/90 mb-1 font-semibold">
                  3. Watch Link <span className="text-[#E50914]">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={watchLink}
                  onChange={(e) => setWatchLink(e.target.value)}
                  placeholder="https://... direct video stream or MP4 link"
                  className="w-full bg-[#18181D] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                />
                <span className="text-[11px] text-white/40 mt-1 block">
                  The playable media stream URL for the public player modal.
                </span>
              </div>

              {(type === 'series' || type === 'tv-show') && (
                <div className="sm:col-span-2 bg-black/30 border border-white/10 rounded-xl p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Video className="w-4 h-4 text-[#E50914]" />
                        Season & Episode Management
                      </h4>
                      <p className="text-[10px] text-white/40 mt-1">
                        Add seasons and episodes with individual watch links.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newSeasonTitle}
                        onChange={(e) => setNewSeasonTitle(e.target.value)}
                        placeholder={`Season ${seasons.length + 1} title`}
                        className="w-full sm:w-48 bg-[#18181D] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                      />

                      <button
                        type="button"
                        onClick={addSeason}
                        className="shrink-0 px-3 py-2 rounded-lg bg-[#E50914] hover:bg-[#ff334b] text-white text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Season
                      </button>
                    </div>
                  </div>

                  {seasons.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-white/10 p-5 text-center">
                      <p className="text-xs text-white/30">
                        No seasons added yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {seasons.map((season) => (
                        <div
                          key={season.seasonNumber}
                          className="rounded-xl border border-white/10 bg-[#18181D] overflow-hidden"
                        >
                          <div className="p-3 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="shrink-0 w-8 h-8 rounded-lg bg-[#E50914]/10 border border-[#E50914]/20 flex items-center justify-center text-xs font-black text-[#E50914]">
                                {season.seasonNumber}
                              </span>

                              <input
                                type="text"
                                value={season.title}
                                onChange={(e) =>
                                  updateSeasonTitle(
                                    season.seasonNumber,
                                    e.target.value
                                  )
                                }
                                className="min-w-0 flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                              />

                              <span className="text-[10px] text-white/30 whitespace-nowrap">
                                {season.episodes.length} episode{season.episodes.length === 1 ? '' : 's'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  startAddEpisode(season.seasonNumber)
                                }
                                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 transition"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Episode
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  removeSeason(season.seasonNumber)
                                }
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                                title="Delete Season"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {newEpisodeSeasonNumber === season.seasonNumber && (
                            <div className="p-3 border-b border-white/10 bg-black/20">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={newEpisodeTitle}
                                  onChange={(e) =>
                                    setNewEpisodeTitle(e.target.value)
                                  }
                                  placeholder={`Episode ${season.episodes.length + 1} title`}
                                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                                />

                                <input
                                  type="url"
                                  value={newEpisodeVideoUrl}
                                  onChange={(e) =>
                                    setNewEpisodeVideoUrl(e.target.value)
                                  }
                                  placeholder="Episode Watch / Video URL"
                                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                                />
                              </div>

                              <div className="flex justify-end gap-2 mt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewEpisodeSeasonNumber(null);
                                    setEditingEpisodeId(null);
                                    setNewEpisodeTitle('');
                                    setNewEpisodeVideoUrl('');
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-[11px]"
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    addOrUpdateEpisode(
                                      season.seasonNumber
                                    )
                                  }
                                  className="px-3 py-1.5 rounded-lg bg-[#E50914] hover:bg-[#ff334b] text-white text-[11px] font-bold"
                                >
                                  {editingEpisodeId
                                    ? 'Update Episode'
                                    : 'Add Episode'}
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="divide-y divide-white/5">
                            {season.episodes.length === 0 ? (
                              <div className="p-4 text-center text-[11px] text-white/25">
                                No episodes in this season.
                              </div>
                            ) : (
                              season.episodes.map((episode) => (
                                <div
                                  key={episode.id}
                                  className="p-3 flex items-center gap-3"
                                >
                                  <span className="shrink-0 text-[11px] font-bold text-white/40 w-8">
                                    E{String(episode.episodeNumber).padStart(2, '0')}
                                  </span>

                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-white truncate">
                                      {episode.title}
                                    </p>
                                    <p className="text-[10px] text-white/30 truncate mt-0.5">
                                      {episode.videoUrl || 'No video URL'}
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      startEditEpisode(
                                        season.seasonNumber,
                                        episode
                                      )
                                    }
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
                                    title="Edit Episode"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeEpisode(
                                        season.seasonNumber,
                                        episode.id
                                      )
                                    }
                                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                                    title="Delete Episode"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Custom Poster Override (Optional) */}
              <div className="sm:col-span-2">
                <label className="block text-white/70 mb-1 font-medium">
                  Custom Poster URL (Optional)
                </label>
                <input
                  type="url"
                  value={customPoster}
                  onChange={(e) => setCustomPoster(e.target.value)}
                  placeholder="https://... enter to override automatically retrieved poster"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                />
                <span className="text-[10px] text-white/40 mt-1 block">
                  Defaults to the automatically retrieved IMDb poster. If entered, this custom poster will be used instead.
                </span>
              </div>

              {/* Reviewed / Editable Title */}
              <div>
                <label className="block text-white/70 mb-1 font-medium">
                  Title <span className="text-[#E50914]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Inception"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                />
              </div>

              {/* Release Year */}
              <div>
                <label className="block text-white/70 mb-1 font-medium">Release Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g. 2010"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                />
              </div>

              {/* Genre */}
              <div>
                <label className="block text-white/70 mb-1 font-medium">Genre</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-[#18181D] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                >
                  <option value="Action">Action</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Drama">Drama</option>
                  <option value="Crime">Crime</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Romance">Romance</option>
                  <option value="Horror">Horror</option>
                  <option value="Adventure">Adventure</option>
                </select>
              </div>

              {/* Backdrop */}
              <div>
                <label className="block text-white/70 mb-1 font-medium">Backdrop Image URL (Optional)</label>
                <input
                  type="url"
                  value={backdrop}
                  onChange={(e) => setBackdrop(e.target.value)}
                  placeholder="https://... wide backdrop URL"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-white/70 mb-1 font-medium">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Plot summary or synopsis"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#E50914] resize-none"
                />
              </div>

              {/* Toggles */}
              <div className="sm:col-span-2 flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[#E50914] focus:ring-0 bg-white/10 border-white/20"
                  />
                  <span className="text-white/80">Feature on Hero Banner</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={trending}
                    onChange={(e) => setTrending(e.target.checked)}
                    className="w-4 h-4 rounded text-[#E50914] focus:ring-0 bg-white/10 border-white/20"
                  />
                  <span className="text-white/80">Tag as Trending</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
              <div className="min-h-[20px]">
                {publishSuccess && (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{publishSuccess}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isPublishing}
                  onClick={() => {
                    resetForm();
                    setShowAddForm(false);
                    setPublishSuccess(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs hover:bg-white/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-6 py-2.5 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#ff334b] transition shadow-lg cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingId ? 'Saving...' : 'Publishing...'}
                    </>
                  ) : (
                    editingId ? 'Save Changes' : 'Publish Content'
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {publishStatusSuccess && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-emerald-400">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{publishStatusSuccess}</span>
            <button
              type="button"
              onClick={() => setPublishStatusSuccess(null)}
              className="ml-auto text-emerald-400/60 hover:text-emerald-400 text-lg leading-none"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {/* Content Management Table */}
        <div className="bg-[#18181D] border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Live Catalog Titles ({catalog.length})</h2>
            <span className="text-xs text-white/40">IMDb Rating & Status</span>
          </div>

          <div className="divide-y divide-white/5">
            {catalog.map((item) => (
              <div
                key={item.id}
                className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-14 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/10">
                    <img
                      src={item.poster}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                      {((item.imdbRating && item.imdbRating > 0) || (item.rating && item.rating > 0)) && (
                        <span className="bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-[10px] font-bold px-1.5 py-0.5 rounded">
                          IMDb {(item.imdbRating || item.rating).toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">
                      {item.year} • {item.type} • {item.genres.join(', ')} • {item.language}
                      {item.imdbId && <span className="ml-2 font-mono text-[11px] text-white/30">[{item.imdbId}]</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditBackend(item)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white transition cursor-pointer"
                    title="Edit Title"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleTogglePublishBackend(item)}
                    disabled={updatingPublishId === item.id}
                    className={`p-2 rounded-lg border transition cursor-pointer disabled:opacity-60 disabled:cursor-wait ${
                      item.published
                        ? 'bg-[#E50914]/10 border-[#E50914]/30 text-[#E50914] hover:bg-[#E50914]/20'
                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                    }`}
                    title={item.published ? 'Published (Click to unpublish)' : 'Unpublished (Click to publish)'}
                  >
                    {updatingPublishId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : item.published ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteBackend(item)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white/50 hover:text-red-400 transition cursor-pointer"
                    title="Delete Title"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
