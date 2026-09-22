import React from 'react';
import { useRouter } from '../lib/router';
import { ShieldCheck, Film, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <footer className="mt-20 border-t border-white/10 bg-[#050507] text-white/60 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="col-span-2">
            <div className="flex items-center mb-3">
              <span className="text-xl font-black tracking-tight text-white">bd</span>
              <span className="text-xl font-light tracking-tight text-white/90">cinemas</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] ml-1 shadow-[0_0_6px_#E50914]"></span>
            </div>
            <p className="text-white/50 text-xs leading-relaxed max-w-sm mb-4">
              Apple-inspired cinematic entertainment experience delivering high-definition Bangladeshi cinema, original web series, and curated international masterpieces.
            </p>
            <div className="flex items-center gap-2 text-white/40 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-[#E50914]" />
              <span>Authorized & Public-Domain Certified Streams</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-white/90 text-sm mb-3">Explore</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate('/movies')} className="hover:text-white transition">
                  Movies
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/tv-shows')} className="hover:text-white transition">
                  TV Shows
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/series')} className="hover:text-white transition">
                  Web Series
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/latest')} className="hover:text-white transition">
                  Latest Releases
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/trending')} className="hover:text-white transition">
                  Trending Now
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/genres')} className="hover:text-white transition">
                  Browse Genres
                </button>
              </li>
            </ul>
          </div>

          {/* Personal */}
          <div>
            <h4 className="font-semibold text-white/90 text-sm mb-3">Account</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate('/my-list')} className="hover:text-white transition">
                  My Watchlist
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/search')} className="hover:text-white transition">
                  Instant Search
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/admin')} className="hover:text-white transition">
                  Content Management
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white/90 text-sm mb-3">Legal & Safety</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-white transition">
                  About bdcinemas
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-white transition">
                  Contact Support
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/privacy')} className="hover:text-white transition">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/terms')} className="hover:text-white transition">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/copyright')} className="hover:text-white transition">
                  DMCA & Copyright
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/40">
          <p>© {new Date().getFullYear()} bdcinemas. All rights reserved. Apple-inspired cinematic web platform.</p>
          <p className="text-center sm:text-right">
            Designed with ultra-fast modern web standards for mobile, desktop, and tablets.
          </p>
        </div>
      </div>
    </footer>
  );
};
