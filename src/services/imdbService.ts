/**
 * Movie / Series Metadata Provider Service
 *
 * Metadata is fetched server-side through Google Apps Script.
 * No IMDb scraping or client-side API key exposure.
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

export function validateImdbId(imdbId: string): boolean {
  if (!imdbId) return false;

  const trimmed = imdbId.trim();

  return /^tt\d{7,9}$/i.test(trimmed);
}

export function cleanImdbId(imdbId: string): string {
  const match = imdbId.trim().match(/tt\d{7,9}/i);

  return match ? match[0].toLowerCase() : imdbId.trim();
}

export interface IMetadataProvider {
  name: string;
  fetchByImdbId: (imdbId: string) => Promise<FetchResult>;
}

class GoogleAppsScriptMetadataProvider implements IMetadataProvider {
  name = 'Google Apps Script Metadata Service';

  async fetchByImdbId(rawImdbId: string): Promise<FetchResult> {
    const imdbId = cleanImdbId(rawImdbId);

    if (!validateImdbId(imdbId)) {
      return {
        success: false,
        error:
          'Invalid IMDb ID format. Expected format: tt1234567 (e.g. tt1375666)',
        providerName: this.name
      };
    }

    const apiUrl = (
      (import.meta as any).env?.VITE_GOOGLE_SCRIPT_URL || ''
    ).trim();

    if (!apiUrl) {
      return {
        success: false,
        error:
          'Google Apps Script URL is not configured. Add VITE_GOOGLE_SCRIPT_URL to the environment.',
        providerName: this.name
      };
    }

    try {
      const url = new URL(apiUrl);

      url.searchParams.set('action', 'metadata');
      url.searchParams.set('imdbId', imdbId);

      const response = await fetch(url.toString(), {
        method: 'GET',
        cache: 'no-store'
      });

      const text = await response.text();

      let json: any;

      try {
        json = JSON.parse(text);
      } catch {
        return {
          success: false,
          error: `Google Apps Script returned an invalid response (${response.status}).`,
          providerName: this.name
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error:
            json?.error ||
            json?.message ||
            `Google Apps Script request failed (${response.status}).`,
          providerName: this.name
        };
      }

      if (!json.success || !json.data) {
        return {
          success: false,
          error:
            json?.error ||
            json?.message ||
            'IMDb metadata could not be retrieved.',
          providerName: this.name
        };
      }

      return {
        success: true,
        data: json.data as FetchedImdbMetadata,
        providerName: this.name
      };
    } catch (error: any) {
      console.warn(
        'Google Apps Script metadata request failed:',
        error
      );

      return {
        success: false,
        error:
          error?.message ||
          'Unable to connect to the metadata service.',
        providerName: this.name
      };
    }
  }
}

export const metadataService =
  new GoogleAppsScriptMetadataProvider();
