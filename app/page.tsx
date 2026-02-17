'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const SCENARIO_EMOJIS: Record<string, string> = {
  'late to work': '⏰',
  'skipped gym': '🏋️',
  'missed a call': '📱',
  'forgot birthday': '🎂',
  'late to meeting': '📅',
};

export default function HomePage() {
  const router = useRouter();
  const [dailyExcuse, setDailyExcuse] = useState<{
    excuse: string;
    scenario: string;
    date: string;
  } | null>(null);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [copied, setCopied] = useState(false);
  const [userExcuse, setUserExcuse] = useState('');
  const [rating, setRating] = useState(false);
  const [loadingTimer, setLoadingTimer] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 3-second fake loading for theatrics
    timerRef.current = setTimeout(() => {
      setLoadingTimer(false);
      fetchDailyExcuse();
    }, 3000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const fetchDailyExcuse = async () => {
    try {
      const res = await fetch('/api/daily-excuse');
      const data = await res.json();
      setDailyExcuse(data);
    } catch {
      setDailyExcuse({
        excuse: "My AI had a coffee break — ironic, I know. Try refreshing!",
        scenario: 'late to work',
        date: new Date().toISOString().split('T')[0],
      });
    } finally {
      setLoadingDaily(false);
    }
  };

  const handleCopy = () => {
    if (dailyExcuse) {
      navigator.clipboard.writeText(dailyExcuse.excuse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRate = async () => {
    if (!userExcuse.trim() || rating) return;
    setRating(true);
    // Store excuse in sessionStorage and navigate to rate page
    sessionStorage.setItem('pendingExcuse', userExcuse.trim());
    router.push('/rate');
  };

  const isLoading = loadingDaily || loadingTimer;

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <span className="text-2xl font-black text-violet-600 tracking-tight">
          ratemy<span className="text-pink-500">.</span>excuse
        </span>
        <button className="bg-gradient-to-r from-violet-500 to-pink-500 text-white text-sm font-bold px-4 py-2 rounded-full hover:opacity-90 transition">
          ✨ Go Premium
        </button>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pb-16">
        {/* Hero */}
        <section className="text-center py-14 md:py-20">
          <div className="inline-block bg-violet-100 text-violet-700 text-sm font-bold px-4 py-1 rounded-full mb-4">
            🤖 AI-powered excuse engineering
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-800 leading-tight mb-4">
            ratemy<span className="text-violet-500">.</span><span className="text-pink-500">excuse</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 font-semibold">
            AI-powered excuses. Rated. Perfected. 🎭
          </p>
        </section>

        {/* Daily Excuse Card */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📅</span>
            <h2 className="text-xl font-black text-gray-700">Today&apos;s Excuse</h2>
            <span className="text-xs text-gray-400 font-semibold ml-auto">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-violet-100 p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-violet-50 rounded-full opacity-60" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-pink-50 rounded-full opacity-60" />

            {isLoading ? (
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="shimmer h-8 w-28 rounded-full" />
                </div>
                <div className="space-y-3">
                  <div className="shimmer h-5 w-full rounded-lg" />
                  <div className="shimmer h-5 w-4/5 rounded-lg" />
                  <div className="shimmer h-5 w-3/5 rounded-lg" />
                </div>
                <div className="mt-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-gray-400 text-sm font-semibold ml-2">Cooking up something believable...</span>
                </div>
              </div>
            ) : (
              <div className="relative bounce-in">
                {dailyExcuse && (
                  <>
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-100 to-pink-100 text-violet-700 font-bold text-sm px-4 py-1.5 rounded-full mb-5">
                      <span>{SCENARIO_EMOJIS[dailyExcuse.scenario] || '🎭'}</span>
                      {dailyExcuse.scenario}
                    </div>
                    <p className="text-gray-700 text-lg md:text-xl font-semibold leading-relaxed mb-6">
                      &ldquo;{dailyExcuse.excuse}&rdquo;
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-3 rounded-2xl transition text-sm"
                      >
                        {copied ? '✅ Copied!' : '📋 Copy Excuse'}
                      </button>
                      <button
                        onClick={fetchDailyExcuse}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-6 py-3 rounded-2xl transition text-sm"
                      >
                        🔄 New Excuse
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Ad Slot */}
        {/* AD SLOT — AdSense banner goes here */}
        <div className="my-8 flex justify-center">
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 text-sm font-semibold" style={{ width: '100%', maxWidth: 728, height: 90 }}>
            Advertisement
          </div>
        </div>

        {/* Rate Your Excuse */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⚖️</span>
            <h2 className="text-xl font-black text-gray-700">Rate My Excuse</h2>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8">
            <p className="text-gray-500 font-semibold mb-5">
              Drop your excuse below and let our AI judge grade it. No judgment… just grades. 😅
            </p>
            <textarea
              value={userExcuse}
              onChange={(e) => setUserExcuse(e.target.value)}
              placeholder="e.g. &quot;My cat sat on my keyboard and sent 47 emails before I noticed...&quot;"
              rows={4}
              className="w-full border-2 border-gray-100 focus:border-violet-300 rounded-2xl p-4 text-gray-700 font-semibold resize-none outline-none transition text-base"
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-400 font-semibold">
                {userExcuse.length}/500 characters
              </span>
              <button
                onClick={handleRate}
                disabled={!userExcuse.trim() || rating || userExcuse.length > 500}
                className="bg-gradient-to-r from-pink-500 to-orange-400 text-white font-black px-8 py-3 rounded-2xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-base flex items-center gap-2"
              >
                {rating ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Judging...
                  </>
                ) : (
                  'Rate it →'
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Premium CTA */}
        <section>
          <div className="bg-gradient-to-r from-violet-600 to-pink-500 rounded-3xl p-8 text-white text-center shadow-2xl">
            <div className="text-4xl mb-3">👑</div>
            <h3 className="text-2xl font-black mb-2">Want better excuses?</h3>
            <p className="text-violet-100 font-semibold mb-5">
              Unlock premium AI excuses, unlimited ratings, and a personal excuse library.
            </p>
            <button className="bg-white text-violet-700 font-black px-8 py-3 rounded-2xl hover:bg-violet-50 transition text-lg">
              Go Premium →
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm font-semibold">
        <p>Made with 🎭 and a sprinkle of AI • ratemy.excuse</p>
      </footer>
    </div>
  );
}
