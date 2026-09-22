import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Subtitles,
  SkipForward,
  Check
} from 'lucide-react';
import { MediaItem, Episode } from '../types';

interface VideoPlayerModalProps {
  media: MediaItem | null;
  episodeId?: string;
  onClose: () => void;
  onProgressUpdate: (mediaId: string, episodeId: string | undefined, currentSeconds: number, totalSeconds: number) => void;
  onSelectEpisode?: (episodeId: string) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  media,
  episodeId,
  onClose,
  onProgressUpdate,
  onSelectEpisode
}) => {
  if (!media) return null;

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedSpeed, setSelectedSpeed] = useState<number>(1);
  const [selectedQuality, setSelectedQuality] = useState<'4K UHD' | '1080p FHD' | '720p HD'>('4K UHD');
  const [selectedSubtitle, setSelectedSubtitle] = useState<'Off' | 'Bangla' | 'English'>('Bangla');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showEpisodesDrawer, setShowEpisodesDrawer] = useState(false);

  // Identify current episode if series
  let currentEpisode: Episode | undefined;
  let allEpisodes: Episode[] = [];
  if (media.seasons) {
    allEpisodes = media.seasons.flatMap((s) => s.episodes);
    currentEpisode = allEpisodes.find((e) => e.id === episodeId) || allEpisodes[0];
  }

  const activeVideoUrl = currentEpisode?.videoUrl || media.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';

  // Controls auto-hide timer
  const controlsTimeoutRef = useRef<number | null>(null);

  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSettingsMenu(false);
      }
    }, 3500);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showEpisodesDrawer) setShowEpisodesDrawer(false);
        else if (showSettingsMenu) setShowSettingsMenu(false);
        else onClose();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft') {
        seekRelative(-10);
      } else if (e.key === 'ArrowRight') {
        seekRelative(10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, showEpisodesDrawer, showSettingsMenu]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
    resetControlsTimeout();
  };

  const seekRelative = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    resetControlsTimeout();
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setCurrentTime(val);
    }
    resetControlsTimeout();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.log(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.log(err));
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleNextEpisode = () => {
    if (!currentEpisode || allEpisodes.length === 0) return;
    const curIdx = allEpisodes.findIndex((e) => e.id === currentEpisode!.id);
    if (curIdx >= 0 && curIdx < allEpisodes.length - 1) {
      const nextEp = allEpisodes[curIdx + 1];
      if (onSelectEpisode) {
        onSelectEpisode(nextEp.id);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onClick={resetControlsTimeout}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={activeVideoUrl}
        autoPlay
        playsInline
        onTimeUpdate={() => {
          if (videoRef.current) {
            const cur = videoRef.current.currentTime;
            const dur = videoRef.current.duration || 1;
            setCurrentTime(cur);
            setDuration(dur);
            onProgressUpdate(media.id, currentEpisode?.id, cur, dur);
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
            videoRef.current.playbackRate = selectedSpeed;
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          handleNextEpisode();
        }}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Subtitles Overlay Preview (Simulated Apple Subtitles) */}
      {selectedSubtitle !== 'Off' && (
        <div className="absolute bottom-28 left-0 right-0 pointer-events-none flex justify-center px-4">
          <span className="bg-black/85 backdrop-blur-md px-4 py-1.5 rounded-lg text-white text-base sm:text-lg font-medium shadow-2xl border border-white/10 text-center max-w-xl">
            {selectedSubtitle === 'Bangla'
              ? (currentEpisode ? 'কখনও কখনও সত্য কল্পনার চেয়েও ভয়ংকর হতে পারে।' : 'হাওয়া যখন দিক পরিবর্তন করে, সমুদ্র তখন নতুন গান গায়।')
              : 'Sometimes the silence beneath the waves speaks louder than words.'}
          </span>
        </div>
      )}

      {/* Controls Container with Fade Transition */}
      <div
        className={`absolute inset-0 flex flex-col justify-between p-4 sm:p-8 bg-gradient-to-t from-black/90 via-transparent to-black/80 transition-opacity duration-300 pointer-events-none ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition hover:scale-105"
              title="Close Player"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div>
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-white flex items-center gap-2">
                <span>{media.title}</span>
                <span className="text-xs font-normal text-white/60">({media.year})</span>
              </h2>
              {currentEpisode && (
                <p className="text-xs text-[#E50914] font-medium">
                  {currentEpisode.title} • {currentEpisode.duration}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {allEpisodes.length > 1 && (
              <button
                onClick={() => setShowEpisodesDrawer(!showEpisodesDrawer)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition"
              >
                Episodes
              </button>
            )}

            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition"
              title="Audio & Subtitle Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Quick Skip & Play Controls */}
        <div className="flex items-center justify-center gap-6 sm:gap-12 pointer-events-auto">
          <button
            onClick={() => seekRelative(-10)}
            className="p-3 sm:p-4 rounded-full bg-black/50 hover:bg-black/80 border border-white/15 text-white/80 hover:text-white backdrop-blur-md transition hover:scale-110 active:scale-95"
            title="Rewind 10 Seconds"
          >
            <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          <button
            onClick={togglePlay}
            className="p-5 sm:p-6 rounded-full bg-white text-black hover:bg-white/90 shadow-2xl transition hover:scale-110 active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 sm:w-10 sm:h-10 fill-black" />
            ) : (
              <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-black ml-1" />
            )}
          </button>

          <button
            onClick={() => seekRelative(10)}
            className="p-3 sm:p-4 rounded-full bg-black/50 hover:bg-black/80 border border-white/15 text-white/80 hover:text-white backdrop-blur-md transition hover:scale-110 active:scale-95"
            title="Fast Forward 10 Seconds"
          >
            <RotateCw className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>

        {/* Bottom Timeline & Controls */}
        <div className="space-y-3 pointer-events-auto max-w-5xl mx-auto w-full">
          {/* Progress Timeline Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-white/70 w-12 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSliderChange}
              className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#E50914] focus:outline-none"
            />
            <span className="text-xs font-mono text-white/70 w-12">
              {formatTime(duration)}
            </span>
          </div>

          {/* Lower Control Bar */}
          <div className="flex items-center justify-between text-xs text-white/80">
            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }
                }}
                className="p-1.5 hover:text-white transition"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  if (videoRef.current) {
                    videoRef.current.volume = val;
                    videoRef.current.muted = false;
                    setIsMuted(false);
                  }
                }}
                className="w-16 sm:w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#E50914]"
              />
            </div>

            {/* Quality, Speed, Fullscreen */}
            <div className="flex items-center gap-3 sm:gap-4">
              {allEpisodes.length > 1 && (
                <button
                  onClick={handleNextEpisode}
                  className="flex items-center gap-1 hover:text-white transition"
                  title="Next Episode"
                >
                  <SkipForward className="w-4 h-4" />
                  <span className="hidden sm:inline">Next</span>
                </button>
              )}

              <button
                onClick={() => {
                  const speeds = [0.75, 1, 1.25, 1.5];
                  const nextIdx = (speeds.indexOf(selectedSpeed) + 1) % speeds.length;
                  const nextSpeed = speeds[nextIdx];
                  setSelectedSpeed(nextSpeed);
                  if (videoRef.current) videoRef.current.playbackRate = nextSpeed;
                }}
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-mono"
                title="Playback Speed"
              >
                {selectedSpeed}x
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-1.5 hover:text-white transition"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Menu Modal */}
      {showSettingsMenu && (
        <div className="absolute top-16 right-4 sm:right-8 w-72 bg-[#18181D]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 shadow-2xl z-50 text-sm">
          <h3 className="font-bold text-white mb-3 flex items-center justify-between">
            <span>Playback Settings</span>
            <button onClick={() => setShowSettingsMenu(false)}>
              <X className="w-4 h-4 text-white/50 hover:text-white" />
            </button>
          </h3>

          {/* Subtitles */}
          <div className="mb-3">
            <p className="text-xs text-white/50 mb-1.5">Subtitles</p>
            <div className="space-y-1">
              {(['Off', 'Bangla', 'English'] as const).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubtitle(sub)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition ${
                    selectedSubtitle === sub ? 'bg-[#E50914] text-white font-semibold' : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <span>{sub}</span>
                  {selectedSubtitle === sub && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div>
            <p className="text-xs text-white/50 mb-1.5">Stream Quality</p>
            <div className="space-y-1">
              {(['4K UHD', '1080p FHD', '720p HD'] as const).map((qual) => (
                <button
                  key={qual}
                  onClick={() => setSelectedQuality(qual)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition ${
                    selectedQuality === qual ? 'bg-white/20 text-white font-semibold' : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <span>{qual}</span>
                  {selectedQuality === qual && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Episodes Drawer for Series */}
      {showEpisodesDrawer && allEpisodes.length > 0 && (
        <div className="absolute inset-y-0 right-0 w-80 sm:w-96 bg-[#0A0A0C]/98 backdrop-blur-2xl border-l border-white/15 p-4 sm:p-6 overflow-y-auto z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-white">Episodes ({allEpisodes.length})</h3>
            <button onClick={() => setShowEpisodesDrawer(false)}>
              <X className="w-5 h-5 text-white/60 hover:text-white" />
            </button>
          </div>

          <div className="space-y-3">
            {allEpisodes.map((ep) => {
              const isSelected = ep.id === currentEpisode?.id;
              return (
                <div
                  key={ep.id}
                  onClick={() => {
                    if (onSelectEpisode) onSelectEpisode(ep.id);
                    setShowEpisodesDrawer(false);
                  }}
                  className={`p-2.5 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-white/15 border-[#E50914]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={ep.thumbnail}
                      alt={ep.title}
                      className="w-20 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{ep.title}</p>
                      <p className="text-[11px] text-white/50">{ep.duration}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-white/70 line-clamp-2 mt-2">
                    {ep.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
