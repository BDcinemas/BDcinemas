import { MediaItem } from '../types';

const API_URL = (import.meta.env.VITE_GOOGLE_SCRIPT_URL || '').trim();

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  sessionId?: string;
  admin?: {
    id: string;
    email: string;
    role: string;
  };
  contentId?: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  error?: string;
  sessionId?: string;
  admin?: {
    id: string;
    email: string;
    role: string;
  };
}

function getApiUrl(): string {
  if (!API_URL) {
    throw new Error(
      'VITE_GOOGLE_SCRIPT_URL is not configured. Add it to your environment variables.'
    );
  }

  return API_URL;
}

async function parseResponse<T>(
  response: Response
): Promise<ApiResponse<T>> {
  const text = await response.text();

  let json: ApiResponse<T>;

  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(
      `Google Apps Script returned an invalid response (${response.status}).`
    );
  }

  if (!response.ok) {
    throw new Error(
      json.error ||
        json.message ||
        `Google Apps Script request failed (${response.status}).`
    );
  }

  return json;
}

async function get<T>(
  action: string,
  params: Record<string, string> = {}
): Promise<ApiResponse<T>> {
  const url = new URL(getApiUrl());

  url.searchParams.set('action', action);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    cache: 'no-store'
  });

  return parseResponse<T>(response);
}

async function post<T>(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<ApiResponse<T>> {
  const response = await fetch(getApiUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify({
      action,
      ...payload
    })
  });

  return parseResponse<T>(response);
}

export const googleAppsScriptService = {
  async health() {
    return get<{ message: string }>('health');
  },

  async getPublished(): Promise<ApiResponse<MediaItem[]>> {
    return get<MediaItem[]>('published');
  },

  async getContent(
    sessionId: string
  ): Promise<ApiResponse<MediaItem[]>> {
    return get<MediaItem[]>('getContent', {
      sessionId
    });
  },

  async login(
    email: string,
    password: string
  ): Promise<LoginResponse> {
    return post('login', {
      email,
      password
    });
  },

  async checkSession(
    sessionId: string
  ): Promise<ApiResponse> {
    return post('checkSession', {
      sessionId
    });
  },

  async logout(
    sessionId: string
  ): Promise<ApiResponse> {
    return post('logout', {
      sessionId
    });
  },

  async createContent(
    sessionId: string,
    content: Record<string, unknown>
  ): Promise<ApiResponse> {
    return post('createContent', {
      sessionId,
      content
    });
  },

  async publishContent(
    sessionId: string,
    id: string,
    published: boolean
  ): Promise<ApiResponse> {
    return post('publishContent', {
      sessionId,
      contentId: id,
      published
    });
  },

  async deleteContent(
    sessionId: string,
    id: string
  ): Promise<ApiResponse> {
    return post('deleteContent', {
      sessionId,
      contentId: id
    });
  }
};
