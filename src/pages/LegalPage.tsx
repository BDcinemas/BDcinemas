import React from 'react';
import { useRouter } from '../lib/router';
import { ShieldCheck, Mail, FileText, HelpCircle, AlertCircle } from 'lucide-react';

interface LegalPageProps {
  pageType: 'about' | 'contact' | 'privacy' | 'terms' | 'copyright';
}

export const LegalPage: React.FC<LegalPageProps> = ({ pageType }) => {
  const { navigate } = useRouter();

  const renderContent = () => {
    switch (pageType) {
      case 'about':
        return (
          <>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">About bdcinemas</h1>
            <p className="text-white/70 leading-relaxed mb-6">
              bdcinemas is an Apple-inspired premium cinematic web platform dedicated to showcasing Bangladeshi cinema, original thriller web series, and curated international masterpieces in high definition.
            </p>
            <h2 className="text-xl font-bold text-white mb-2">Our Mission</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              We bring the depth, beauty, and emotional power of Bengali storytelling into an uncompromising, ultra-modern digital canvas built for all modern screens—combining minimal aesthetics, high contrast readability, and seamless video streaming.
            </p>
            <h2 className="text-xl font-bold text-white mb-2">Architectural Standards</h2>
            <p className="text-white/70 leading-relaxed">
              Engineered with responsive React, TypeScript, and modern web performance optimizations, bdcinemas delivers fast, clean, and intuitive navigation across mobile browsers, tablets, and high-resolution desktop monitors.
            </p>
          </>
        );

      case 'contact':
        return (
          <>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">Contact Editorial Team</h1>
            <p className="text-white/70 leading-relaxed mb-8">
              For questions regarding catalog listings, technical inquiries, or press inquiries, connect with our support desk below:
            </p>

            <div className="bg-[#18181D] border border-white/10 rounded-2xl p-6 space-y-4 max-w-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#E50914]" />
                <div>
                  <p className="text-xs text-white/50">Editorial Inquiries</p>
                  <p className="text-sm font-semibold text-white">editorial@bdcinemas.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#E50914]" />
                <div>
                  <p className="text-xs text-white/50">Legal & Rights</p>
                  <p className="text-sm font-semibold text-white">legal@bdcinemas.com</p>
                </div>
              </div>
            </div>
          </>
        );

      case 'privacy':
        return (
          <>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">Privacy Policy</h1>
            <p className="text-white/70 leading-relaxed mb-4">
              Your privacy is paramount. bdcinemas prioritizes local storage for your watchlist, playback preferences, and viewing history.
            </p>
            <h2 className="text-xl font-bold text-white mb-2">Local Data Storage</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              We do not track your browsing habits across third-party networks. Watchlist titles and continue-watching timestamps are securely preserved locally within your browser using standard HTML5 localStorage.
            </p>
            <h2 className="text-xl font-bold text-white mb-2">Cookies & Analytics</h2>
            <p className="text-white/70 leading-relaxed">
              We use minimal, privacy-conscious session metrics to optimize streaming performance and user experience without harvesting personal identities.
            </p>
          </>
        );

      case 'terms':
        return (
          <>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">Terms of Service</h1>
            <p className="text-white/70 leading-relaxed mb-4">
              By accessing bdcinemas, you agree to comply with our acceptable use policies and respect intellectual property rights.
            </p>
            <h2 className="text-xl font-bold text-white mb-2">Authorized Usage</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              The website is designed for personal, non-commercial entertainment and informational browsing. Any attempt to scrape, disrupt infrastructure, or circumvent platform security is strictly prohibited.
            </p>
          </>
        );

      case 'copyright':
        return (
          <>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">Copyright & DMCA Notice</h1>
            <p className="text-white/70 leading-relaxed mb-4">
              bdcinemas strictly respects intellectual property laws. We only utilize authorized, licensed, or public-domain video sources and sample media.
            </p>
            <div className="p-4 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 text-white/90 text-sm mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#E50914] flex-shrink-0 mt-0.5" />
              <p>
                bdcinemas does NOT host, extract, or facilitate unauthorized copyright infringement or pirated media streams.
              </p>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Takedown Requests</h2>
            <p className="text-white/70 leading-relaxed">
              If you are a copyright owner or authorized agent who believes any content item is infringing, contact our designated agent at <span className="text-[#E50914] font-semibold">dmca@bdcinemas.com</span> with official documentation for immediate expedited review.
            </p>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] pt-24 sm:pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#18181D]/40 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
