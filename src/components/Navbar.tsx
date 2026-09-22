import React, { useState, useEffect } from 'react';
import { Search, Bookmark, Menu, X, Shield, Film, Tv, Sparkles, Flame, Grid, Compass } from 'lucide-react';
import { useRouter } from '../lib/router';

interface NavbarProps {
  watchlistCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ watchlistCount }) => {
  const { currentPath, navigate } = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Movies', path: '/movies' },
    { label: 'TV Shows', path: '/tv-shows' },
    { label: 'Series', path: '/series' },
    { label: 'Latest', path: '/latest' },
    { label: 'Trending', path: '/trending' },
    { label: 'Genres', path: '/genres' }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen
          ? 'bg-[#0A0A0C]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className="flex items-center group text-left cursor-pointer focus:outline-none"
            >
              <span className="text-2xl md:text-3xl font-black tracking-tight text-white transition group-hover:opacity-90">
                bd
              </span>
              <span className="text-2xl md:text-3xl font-light tracking-tight text-white/90">
                cinemas
              </span>
              <span className="w-2 h-2 rounded-full bg-[#E50914] ml-1.5 shadow-[0_0_8px_#E50914]"></span>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navItems.map((item) => {
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? 'text-white bg-white/10 shadow-inner'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Toggle / Input */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Titles, actors, directors..."
                    autoFocus
                    className="w-48 sm:w-64 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-[#E50914] backdrop-blur-md"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="ml-2 p-1.5 text-white/70 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
                  title="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Watchlist */}
            <button
              onClick={() => navigate('/my-list')}
              className="relative p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
              title="My List"
            >
              <Bookmark className="w-5 h-5" />
              {watchlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#E50914] text-[10px] font-bold text-white flex items-center justify-center">
                  {watchlistCount}
                </span>
              )}
            </button>

            {/* Admin Link */}
            <button
              onClick={() => navigate('/admin')}
              className="p-2 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition hidden sm:flex items-center gap-1.5 text-xs"
              title="Admin Dashboard"
            >
              <Shield className="w-4 h-4 text-[#E50914]" />
              <span className="hidden lg:inline text-white/70">Admin</span>
            </button>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white rounded-lg hover:bg-white/10 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A0A0C]/98 border-b border-white/10 px-4 pt-2 pb-6 space-y-2 backdrop-blur-2xl">
          <form onSubmit={handleSearchSubmit} className="mb-4 pt-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies, series, stars..."
                className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-[#E50914]"
              />
              <button type="submit" className="absolute right-3 top-3 text-white/60">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-2.5 rounded-xl text-base font-medium transition ${
                currentPath === item.path
                  ? 'text-white bg-white/15 font-semibold'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="pt-4 border-t border-white/10 flex items-center justify-between px-2">
            <button
              onClick={() => {
                navigate('/my-list');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-sm text-white/80"
            >
              <Bookmark className="w-4 h-4 text-[#E50914]" />
              My List ({watchlistCount})
            </button>
            <button
              onClick={() => {
                navigate('/admin');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-sm text-white/60"
            >
              <Shield className="w-4 h-4 text-[#E50914]" />
              Admin
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
