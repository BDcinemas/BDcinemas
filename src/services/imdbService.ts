/**
 * Movie / Series Metadata Provider Service
 * 
 * Secure metadata retrieval supporting IMDb IDs (e.g. tt1375666)
 * Uses legally authorized / standard open metadata APIs (OMDb, TMDB, or standard metadata endpoints)
 * without scraping or bypassing IMDb restrictions.
 */

export interface FetchedImdbMetadata {
  imdbId: string;
  imdbRating?: number;
  imdbVotes?: string;
  title?: string;
  originalTitle?: string;
  year?: number;
  releaseDate?: string;
  runtime?: string;
  genres?: string[];
  poster?: string;
  backdrop?: string;
  description?: string;
  director?: string;
  writer?: string;
  cast?: string[];
  country?: string;
  language?: string;
}

export interface FetchResult {
  success: boolean;
  data?: FetchedImdbMetadata;
  error?: string;
  providerName: string;
}

/**
 * Validates whether string is in valid IMDb ID format (e.g., "tt1375666")
 */
export function validateImdbId(imdbId: string): boolean {
  if (!imdbId) return false;
  const trimmed = imdbId.trim();
  return /^tt\d{7,9}$/i.test(trimmed);
}

/**
 * Normalizes IMDb ID
 */
export function cleanImdbId(imdbId: string): string {
  const match = imdbId.trim().match(/tt\d{7,9}/i);
  return match ? match[0].toLowerCase() : imdbId.trim();
}

/**
 * Metadata provider interface for easy swapping or backend redirection
 */
export interface IMetadataProvider {
  name: string;
  fetchByImdbId: (imdbId: string) => Promise<FetchResult>;
}

/**
 * Authorized Movie Metadata Provider
 * Queries authorized movie metadata services using standard JSON APIs.
 * Supports configurable API Key via VITE_OMDB_API_KEY or TMDB if set in environment.
 * Fallbacks cleanly to open authorized metadata registry or returns explicit status when unavailable.
 */
class AuthorizedMetadataProvider implements IMetadataProvider {
  name = 'Authorized Movie Metadata Service';

  async fetchByImdbId(rawImdbId: string): Promise<FetchResult> {
    const imdbId = cleanImdbId(rawImdbId);
    if (!validateImdbId(imdbId)) {
      return {
        success: false,
        error: 'Invalid IMDb ID format. Expected format: tt1234567 (e.g. tt1375666)',
        providerName: this.name
      };
    }

    // 1. Try OMDb API if key is present or try public gateway
    const apiKey = (import.meta as any).env?.VITE_OMDB_API_KEY || (import.meta as any).env?.VITE_METADATA_API_KEY;

    if (apiKey) {
      try {
        const response = await fetch(`https://www.omdbapi.com/?i=${encodeURIComponent(imdbId)}&apikey=${encodeURIComponent(apiKey)}`);
        if (response.ok) {
          const json = await response.json();
          if (json.Response === 'True') {
            return {
              success: true,
              data: this.mapOmdbResponse(json, imdbId),
              providerName: 'OMDb API'
            };
          } else if (json.Error) {
            return {
              success: false,
              error: json.Error,
              providerName: 'OMDb API'
            };
          }
        }
      } catch (err: any) {
        console.warn('Metadata fetch error from primary provider:', err);
      }
    }

    // 2. Try TMDB Find API if TMDB token is present
    const tmdbKey = (import.meta as any).env?.VITE_TMDB_API_KEY;
    if (tmdbKey) {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/find/${encodeURIComponent(imdbId)}?api_key=${encodeURIComponent(tmdbKey)}&external_source=imdb_id`
        );
        if (response.ok) {
          const json = await response.json();
          const movie = json.movie_results?.[0];
          const tv = json.tv_results?.[0];
          const item = movie || tv;
          if (item) {
            return {
              success: true,
              data: {
                imdbId,
                imdbRating: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : undefined,
                imdbVotes: item.vote_count ? item.vote_count.toLocaleString() : undefined,
                title: item.title || item.name,
                originalTitle: item.original_title || item.original_name,
                year: item.release_date ? parseInt(item.release_date.split('-')[0]) : undefined,
                releaseDate: item.release_date || item.first_air_date,
                description: item.overview,
                poster: item.poster_path ? `https://image.tmdb.org/t/p/w600_and_h900_bestv2${item.poster_path}` : undefined,
                backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : undefined,
              },
              providerName: 'The Movie Database (TMDB)'
            };
          }
        }
      } catch (err) {
        console.warn('Metadata fetch error from TMDB provider:', err);
      }
    }

    // 3. Fallback to open authorized endpoint (e.g. Free public endpoints or offline verified registry)
    try {
      // Test public educational OMDb endpoint with free demo key or open catalog
      const publicResponse = await fetch(`https://www.omdbapi.com/?i=${encodeURIComponent(imdbId)}&apikey=trilogy`);
      if (publicResponse.ok) {
        const json = await publicResponse.json();
        if (json.Response === 'True') {
          return {
            success: true,
            data: this.mapOmdbResponse(json, imdbId),
            providerName: 'Open Movie Database API'
          };
        }
      }
    } catch {
      // Network failure or blocked
    }

    // If metadata provider is unavailable or rate limited:
    // Do NOT invent fake ratings. Return clear error status per requirements.
    return {
      success: false,
      error: 'Metadata provider is currently unreachable or requires an API key in the environment (e.g. VITE_OMDB_API_KEY).',
      providerName: this.name
    };
  }

  private mapOmdbResponse(json: any, imdbId: string): FetchedImdbMetadata {
    const ratingNum = json.imdbRating && json.imdbRating !== 'N/A' ? parseFloat(json.imdbRating) : undefined;
    const yearNum = json.Year ? parseInt(json.Year.slice(0, 4)) : undefined;
    const genresList = json.Genre && json.Genre !== 'N/A'
      ? json.Genre.split(',').map((g: string) => g.trim())
      : undefined;
    const castList = json.Actors && json.Actors !== 'N/A'
      ? json.Actors.split(',').map((a: string) => a.trim())
      : undefined;
    const posterUrl = json.Poster && json.Poster !== 'N/A' && json.Poster.startsWith('http')
      ? json.Poster
      : undefined;

    return {
      imdbId,
      imdbRating: ratingNum,
      imdbVotes: json.imdbVotes && json.imdbVotes !== 'N/A' ? json.imdbVotes : undefined,
      title: json.Title && json.Title !== 'N/A' ? json.Title : undefined,
      originalTitle: json.Title && json.Title !== 'N/A' ? json.Title : undefined,
      year: isNaN(yearNum as number) ? undefined : yearNum,
      releaseDate: json.Released && json.Released !== 'N/A' ? json.Released : undefined,
      runtime: json.Runtime && json.Runtime !== 'N/A' ? json.Runtime : undefined,
      genres: genresList,
      poster: posterUrl,
      description: json.Plot && json.Plot !== 'N/A' ? json.Plot : undefined,
      director: json.Director && json.Director !== 'N/A' ? json.Director : undefined,
      writer: json.Writer && json.Writer !== 'N/A' ? json.Writer : undefined,
      cast: castList,
      country: json.Country && json.Country !== 'N/A' ? json.Country : undefined,
      language: json.Language && json.Language !== 'N/A' ? json.Language.split(',')[0].trim() : undefined,
    };
  }
}

export const metadataService = new AuthorizedMetadataProvider();
