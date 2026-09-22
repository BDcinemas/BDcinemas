import React, { createContext, useContext, useState, useEffect } from 'react';

export interface RouteInfo {
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
}

interface RouterContextType {
  currentPath: string;
  params: Record<string, string>;
  query: Record<string, string>;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType>({
  currentPath: '/',
  params: {},
  query: {},
  navigate: () => {}
});

// Get base URL from Vite (e.g., '/BDcinemas/' or '/')
const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, '') || '';

function parseLocation(): { path: string; query: Record<string, string> } {
  // Support both hash routing (#/movies) and pathname (/movies)
  let rawPath = '/';
  let rawSearch = '';

  if (window.location.hash.startsWith('#/')) {
    const hashPart = window.location.hash.slice(1);
    const [pathPart, searchPart] = hashPart.split('?');
    rawPath = pathPart || '/';
    rawSearch = searchPart ? `?${searchPart}` : '';
  } else {
    rawPath = window.location.pathname || '/';
    rawSearch = window.location.search || '';
  }

  // Strip BASE_URL prefix if running under a subdirectory (e.g. /BDcinemas)
  if (BASE_URL && rawPath.startsWith(BASE_URL)) {
    rawPath = rawPath.slice(BASE_URL.length) || '/';
  }

  // Normalize base tag if present
  const baseTag = document.querySelector('base')?.getAttribute('href');
  if (baseTag && rawPath.startsWith(baseTag)) {
    rawPath = rawPath.replace(baseTag, '/') || '/';
  }

  if (!rawPath.startsWith('/')) {
    rawPath = '/' + rawPath;
  }

  const query: Record<string, string> = {};
  if (rawSearch) {
    const searchParams = new URLSearchParams(rawSearch);
    searchParams.forEach((val, key) => {
      query[key] = val;
    });
  }

  return { path: rawPath, query };
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [routeInfo, setRouteInfo] = useState<{ path: string; query: Record<string, string> }>(parseLocation);

  useEffect(() => {
    const handlePopState = () => {
      setRouteInfo(parseLocation());
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = (to: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Format full URL with BASE_URL
    const fullTarget = to.startsWith('/') ? `${BASE_URL}${to}` : to;

    // Use pushState
    try {
      window.history.pushState({}, '', fullTarget);
      setRouteInfo(parseLocation());
    } catch {
      window.location.hash = to;
    }
  };

  // Match route parameters like /movie/:slug, /genre/:genre, /year/:year
  const params: Record<string, string> = {};
  const currentPath = routeInfo.path;

  if (currentPath.startsWith('/movie/')) {
    params.slug = currentPath.replace('/movie/', '').split('/')[0];
  } else if (currentPath.startsWith('/series/')) {
    params.slug = currentPath.replace('/series/', '').split('/')[0];
  } else if (currentPath.startsWith('/tv-show/')) {
    params.slug = currentPath.replace('/tv-show/', '').split('/')[0];
  } else if (currentPath.startsWith('/genre/')) {
    params.genre = currentPath.replace('/genre/', '').split('/')[0];
  } else if (currentPath.startsWith('/year/')) {
    params.year = currentPath.replace('/year/', '').split('/')[0];
  }

  return (
    <RouterContext.Provider
      value={{
        currentPath: routeInfo.path,
        params,
        query: routeInfo.query,
        navigate
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};

export function useRouter() {
  return useContext(RouterContext);
}
