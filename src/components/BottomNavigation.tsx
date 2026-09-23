import React from 'react';
import {
  Home,
  Film,
  Tv,
  Bookmark,
  Menu as MenuIcon
} from 'lucide-react';
import { useRouter } from '../lib/router';

export const BottomNavigation: React.FC = () => {
  const { currentPath, navigate } = useRouter();

  const items = [
    {
      label: 'Home',
      path: '/',
      icon: Home
    },
    {
      label: 'Movies',
      path: '/movies',
      icon: Film
    },
    {
      label: 'TV Series',
      path: '/series',
      icon: Tv
    },
    {
      label: 'My List',
      path: '/my-list',
      icon: Bookmark
    }
  ];

  const openMenu = () => {
    window.dispatchEvent(new CustomEvent('bdcinemas:open-menu'));
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[60] md:hidden border-t border-white/10 bg-[#0A0A0C]/95 backdrop-blur-xl"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
      aria-label="Bottom navigation"
    >
      <div className="h-16 flex items-center justify-around px-1">
        {items.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.path === '/'
              ? currentPath === '/'
              : currentPath === item.path ||
                currentPath.startsWith(`${item.path}/`);

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`relative flex h-16 min-w-[64px] flex-1 max-w-[90px] flex-col items-center justify-center gap-1 transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-white/45 active:text-white/80'
              }`}
              aria-label={item.label}
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive ? 'text-[#E50914]' : ''
                }`}
                strokeWidth={isActive ? 2.4 : 1.8}
              />

              <span className="text-[10px] font-medium leading-none whitespace-nowrap">
                {item.label}
              </span>

              {isActive && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#E50914]" />
              )}
            </button>
          );
        })}

        <button
          type="button"
          onClick={openMenu}
          className="relative flex h-16 min-w-[64px] flex-1 max-w-[90px] flex-col items-center justify-center gap-1 text-white/45 active:text-white/80 transition-colors"
          aria-label="Menu"
        >
          <MenuIcon
            className="h-5 w-5"
            strokeWidth={1.8}
          />

          <span className="text-[10px] font-medium leading-none">
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
};
