import { useState, useEffect, useCallback, useMemo } from 'react';
import { Quote } from '../types';
import { updateMotivationCount } from '../lib/supabase';

// Remove this unused eslint-disable directive
// eslint-disable-next-line @next/next/no-page-custom-font
// import { Geist, Geist_Mono } from "next/font/google";

interface QuoteDisplayProps {
  quotes: Quote[];
  motivationCount: number;
  setMotivationCount: (count: number) => void;
}

export default function QuoteDisplay({ quotes, motivationCount, setMotivationCount }: QuoteDisplayProps) {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [fadeIn, setFadeIn] = useState(false);
  const [bgColor, setBgColor] = useState("from-indigo-600 to-violet-700");
  const [isAnimating, setIsAnimating] = useState(false);
  const [showEmoji, setShowEmoji] = useState("✨");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Use useMemo for arrays that don't change
  const bgColors = useMemo(() => [
    "from-indigo-600 via-purple-600 to-violet-800",
    "from-rose-500 via-pink-600 to-purple-800",
    "from-emerald-600 via-teal-600 to-cyan-800",
    "from-blue-600 via-indigo-600 to-purple-800",
    "from-amber-500 via-orange-600 to-red-700",
    "from-purple-600 via-violet-600 to-indigo-800"
  ], []);

  // Curated emoji selection
  const emojis = useMemo(() => ["✨", "🚀", "💫", "⚡", "🌟", "✅", "🔆", "🏆"], []);
  const loadingEmojis = useMemo(() => ["✨", "🚀", "💫", "⚡", "🌟", "✅", "🔆", "🏆"], []);

  // Use useCallback for functions that are dependencies of other hooks
  const triggerConfetti = useCallback(() => {
    if (typeof window !== 'undefined' && window.confetti) {
      window.confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#FF0000', '#FFA500', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
        startVelocity: 45,
        gravity: 1.2,
        shapes: ['circle', 'square'],
        ticks: 200
      });
    }
  }, []);

  const getRandomQuote = useCallback(async () => {
    if (quotes.length === 0) {
      setError("Tidak ada quote yang tersedia. Silakan tambahkan quote terlebih dahulu.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsAnimating(true);
    setFadeIn(false);

    // Simulate loading progress with smoother increments
    setLoadingProgress(0);
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 12);
        return newProgress >= 100 ? 99 : newProgress;
      });
    }, 180);

    // Change background color
    const newColor = bgColors[Math.floor(Math.random() * bgColors.length)];
    setBgColor(newColor);

    // Change emoji
    const newEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    setShowEmoji(newEmoji);

    // Update motivation count
    try {
      const newCount = await updateMotivationCount(motivationCount);
      setMotivationCount(newCount);
    } catch (error) {
      console.error("Error updating motivation count:", error);
      // Continue with the quote display even if count update fails
    }

    setTimeout(() => {
      clearInterval(progressInterval);
      setLoadingProgress(100);

      if (quotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        setQuote(quotes[randomIndex].quote);
        setAuthor(quotes[randomIndex].author);
        setFadeIn(true);
      }
      setIsLoading(false);

      // Trigger confetti after quote is displayed
      setTimeout(() => {
        triggerConfetti();
      }, 300);

      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    }, 800);
  }, [quotes, motivationCount, setMotivationCount, bgColors, emojis, triggerConfetti]);

  useEffect(() => {
    if (quotes.length > 0) {
      getRandomQuote();
    } else {
      setIsLoading(false);
      setError("Tidak ada quote yang tersedia. Silakan tambahkan quote terlebih dahulu.");
    }
  }, [quotes, getRandomQuote]);

  return (
    <>
      <div className={`min-h-screen bg-gradient-to-br ${bgColor} transition-all duration-1000 flex flex-col items-center justify-center p-6 md:p-8 overflow-hidden`}>
        {/* Enhanced background elements */}
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-noise mix-blend-soft-light opacity-30"></div>

        {/* Animated light beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-screen bg-gradient-to-b from-white/30 to-transparent opacity-30 blur-3xl animate-pulse-slow"></div>

        {/* Floating elements with improved animations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {emojis.map((emoji, index) => (
            <div
              key={index}
              className="absolute text-3xl md:text-4xl opacity-20"
              style={{
                top: `${10 + (index * 10) % 80}%`,
                left: `${5 + (index * 12) % 85}%`,
                animation: `float-${['slow', 'medium', 'fast'][index % 3]} ${8 + index % 4}s infinite ease-in-out`,
                filter: 'blur(0.5px)'
              }}
            >
              {emoji}
            </div>
          ))}
        </div>

        <div className="max-w-4xl w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 md:p-10 text-white relative z-10 border border-white/20 transform transition-all duration-500 hover:shadow-glow">
          {/* Premium badge */}
          <div className={`absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-black font-bold px-4 py-2 rounded-lg transform rotate-3 shadow-lg ${isAnimating ? 'animate-bounce' : ''} border border-yellow-300`}>
            SEMANGAT! {showEmoji}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-shadow-glow">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-yellow-200 to-white">Semangat</span>
          </h1>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative w-32 h-32 mb-6">
                {/* Enhanced loading animation */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-white/30 opacity-30 blur-sm"></div>
                <div className="absolute inset-0 border-3 border-white/20 rounded-full"></div>
                <div className="absolute inset-0 border-3 border-transparent border-t-white rounded-full animate-spin"></div>
                <div className="absolute inset-0 border-3 border-transparent border-r-white/50 rounded-full animate-ping"></div>

                {/* Animated emojis with cleaner animations */}
                {loadingEmojis.map((emoji, index) => (
                  <div
                    key={index}
                    className="absolute text-xl"
                    style={{
                      top: `${50 + 40 * Math.sin(2 * Math.PI * index / loadingEmojis.length)}%`,
                      left: `${50 + 40 * Math.cos(2 * Math.PI * index / loadingEmojis.length)}%`,
                      transform: 'translate(-50%, -50%)',
                      animation: `pulse 1.5s infinite ${index * 0.2}s, rotate 3s linear infinite ${index * 0.5}s`
                    }}
                  >
                    {emoji}
                  </div>
                ))}

                {/* Center text with progress */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-shadow-sm">
                      {loadingProgress}%
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xl font-medium text-shadow-sm">Mencari inspirasi...</p>
              <p className="text-sm mt-2 opacity-80">Menyiapkan quote terbaik untuk Anda</p>

              {/* Improved progress bar */}
              <div className="w-full max-w-xs mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-white to-white/80 rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-6 animate-bounce">😢</div>
              <p className="text-xl mb-6 bg-white/10 p-4 rounded-lg backdrop-blur-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-white/90 text-purple-700 hover:bg-yellow-300 hover:text-black font-bold py-3 px-6 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Muat Ulang
                </span>
              </button>
            </div>
          ) : (
            <div className={`transition-all duration-500 ${fadeIn ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
              {quote ? (
                <>
                  <div className="bg-gradient-to-br from-white/15 to-white/5 p-6 md:p-8 rounded-xl backdrop-blur-sm border border-white/20 shadow-inner relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full blur-xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl translate-x-1/3 translate-y-1/3"></div>

                    {/* Quote content */}
                    <div className="relative z-10">
                      <blockquote className="text-xl md:text-2xl italic mb-4 text-center">&ldquo;{quote}&rdquo;</blockquote>

                      <div className="flex items-center justify-between mt-8 border-t border-white/20 pt-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center shadow-inner">
                            <span className="text-lg">{author.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-medium text-lg text-white/90">{author}</p>
                            <p className="text-sm text-white/60">Penulis</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Motivation counter with enhanced design */}
                  <div className="mt-8 flex justify-center">
                    <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20 shadow-inner relative overflow-hidden">
                      {/* Decorative elements */}
                      <div className="absolute -top-6 -left-6 w-12 h-12 bg-yellow-400/30 rounded-full blur-xl"></div>
                      <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-yellow-400/30 rounded-full blur-xl"></div>

                      <div className="relative z-10 flex items-center space-x-4">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300/30 to-amber-500/30 flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-inner">
                            <span className="text-2xl">🔥</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-white/80 uppercase tracking-wider font-medium">Sudah dimotivasi</p>
                          <div className="font-bold text-3xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400">
                            {motivationCount.toLocaleString()}
                          </div>
                          <p className="text-sm text-white/80">kali</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-xl">Tidak ada quote yang tersedia.</p>
                </div>
              )}

              <div className="mt-8 text-center">
                <button
                  onClick={getRandomQuote}
                  disabled={quotes.length === 0 || isLoading}
                  className={`bg-white/90 text-purple-700 hover:bg-yellow-300 hover:text-black font-bold py-3 px-8 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 ${quotes.length === 0 || isLoading ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
                >
                  <span className="flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Memuat...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        Quote Baru
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-25px) rotate(-5deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-35px) rotate(8deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        @keyframes rotate {
          from { transform: rotate(0deg) translateX(20px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
        }
        .text-shadow-glow {
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
        }
        .text-shadow-sm {
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
        .hover\\:shadow-glow:hover {
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        }
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
        .border-3 {
          border-width: 3px;
        }
      `}</style>
    </>
  );
}