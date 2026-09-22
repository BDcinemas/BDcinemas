import React, { useState } from 'react';
import { MediaItem } from '../types';
import { Shield, Film, Tv, Video, Eye, Plus, Trash2, EyeOff, CheckCircle2, TrendingUp, Settings } from 'lucide-react';

interface AdminPageProps {
  catalog: MediaItem[];
  onAddMedia: (item: MediaItem) => void;
  onDeleteMedia: (id: string) => void;
  onTogglePublish: (id: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  catalog,
  onAddMedia,
  onDeleteMedia,
  onTogglePublish
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [director, setDirector] = useState('');
  const [year, setYear] = useState('2024');
  const [type, setType] = useState<'movie' | 'series' | 'tv-show'>('movie');
  const [genre, setGenre] = useState('Drama');
  const [language, setLanguage] = useState('Bengali');

  const totalMovies = catalog.filter((i) => i.type === 'movie').length;
  const totalSeries = catalog.filter((i) => i.type === 'series').length;
  const totalTVShows = catalog.filter((i) => i.type === 'tv-show').length;
  const totalEpisodes = catalog.reduce(
    (acc, item) => acc + (item.seasons ? item.seasons.reduce((sAcc, s) => sAcc + s.episodes.length, 0) : 0),
    0
  );
  const totalViews = catalog.reduce((acc, item) => acc + item.views, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: MediaItem = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      originalTitle: originalTitle.trim() || title.trim(),
      description: 'Custom curated cinematic release added via bdcinemas admin console.',
      poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80',
      backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
      year: parseInt(year) || 2024,
      releaseDate: '2024',
      runtime: type === 'movie' ? '2h 10m' : '1 Season',
      rating: 8.5,
      genres: [genre],
      language,
      country: language === 'Bengali' ? 'Bangladesh' : 'International',
      quality: '4K UHD',
      type,
      cast: ['Lead Actor', 'Supporting Cast'],
      director: director.trim() || 'Staff Director',
      writer: director.trim() || 'Staff Writer',
      views: 12000,
      published: true,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
    };

    onAddMedia(newItem);
    setTitle('');
    setOriginalTitle('');
    setDirector('');
    setShowAddForm(false);
  };

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
              Live catalog management, content metadata ingestion, and performance telemetry.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#ff334b] text-white text-xs font-bold flex items-center gap-2 transition shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Title</span>
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

        {/* Add Title Form */}
        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 p-6 rounded-2xl bg-[#18181D] border border-[#E50914]/40 space-y-4 max-w-2xl"
          >
            <h3 className="text-base font-bold text-white mb-2">Ingest New Title</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-white/60 mb-1">Title (English)</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Hawa, Karagar"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1">Original Title (বাংলা নাম)</label>
                <input
                  type="text"
                  value={originalTitle}
                  onChange={(e) => setOriginalTitle(e.target.value)}
                  placeholder="e.g. হাওয়া"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1">Director</label>
                <input
                  type="text"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  placeholder="Director name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1">Release Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1">Content Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-[#18181D] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                >
                  <option value="movie">Movie</option>
                  <option value="series">Web Series</option>
                  <option value="tv-show">TV Show</option>
                </select>
              </div>

              <div>
                <label className="block text-white/60 mb-1">Primary Genre</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-[#18181D] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                >
                  <option value="Action">Action</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Drama">Drama</option>
                  <option value="Crime">Crime</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Romance">Romance</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs hover:bg-white/20 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#ff334b] transition shadow-lg"
              >
                Publish Title
              </button>
            </div>
          </form>
        )}

        {/* Content Management Table */}
        <div className="bg-[#18181D] border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Live Catalog Titles ({catalog.length})</h2>
            <span className="text-xs text-white/40">Status & Operations</span>
          </div>

          <div className="divide-y divide-white/5">
            {catalog.map((item) => (
              <div
                key={item.id}
                className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-10 h-14 rounded-lg object-cover bg-black flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                    <p className="text-xs text-white/40">
                      {item.year} • {item.type} • {item.quality} • {item.language}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onTogglePublish(item.id)}
                    className={`p-2 rounded-lg border transition ${
                      item.published
                        ? 'bg-[#E50914]/10 border-[#E50914]/30 text-[#E50914] hover:bg-[#E50914]/20'
                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                    }`}
                    title={item.published ? 'Published (Click to unpublish)' : 'Unpublished (Click to publish)'}
                  >
                    {item.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => onDeleteMedia(item.id)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white/50 hover:text-red-400 transition"
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
