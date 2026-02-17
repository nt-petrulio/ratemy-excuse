'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const PremiumModal = dynamic(() => import('@/components/PremiumModal'), { ssr: false });

const SCENARIO_EMOJIS: Record<string, string> = {
  'late to work': '⏰',
  'skipped gym': '🏋️',
  'missed a call': '📱',
  'forgot birthday': '🎂',
  'late to meeting': '📅',
};

const PRESET_CONTEXTS = ['Work', 'Mom', 'School'] as const;
type PresetContext = typeof PRESET_CONTEXTS[number];

const LEADERBOARD_SEED = [
  { rank: 1, excuse: "My therapist called mid-commute and said it was either this session or a breakdown — I chose growth.", grade: 'A+', votes: 2847, ctx: 'Work' },
  { rank: 2, excuse: "My dog ate my charger and I had to wait for my neighbor's kid to explain it wasn't funny.", grade: 'A', votes: 1923, ctx: 'Mom' },
  { rank: 3, excuse: "I was finishing a Stack Overflow answer that apparently 147 people were waiting on. You're welcome, internet.", grade: 'A', votes: 1654, ctx: 'Work' },
  { rank: 4, excuse: "My Duolingo streak was at 364 days. I made the only reasonable choice.", grade: 'B', votes: 1201, ctx: 'School' },
  { rank: 5, excuse: "The bus driver and I had a philosophical disagreement about whether 'on time' is a social construct.", grade: 'B', votes: 987, ctx: 'Work' },
];

type VoteMap = Record<number, 'up' | 'down'>;

function Leaderboard() {
  const [votes, setVotes] = useState<VoteMap>({});
  const [counts, setCounts] = useState<Record<number, number>>(
    Object.fromEntries(LEADERBOARD_SEED.map((e) => [e.rank, e.votes]))
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rme_votes');
      if (stored) {
        const parsed: VoteMap = JSON.parse(stored);
        setVotes(parsed);
        // Apply stored votes to counts
        const adjusted = { ...Object.fromEntries(LEADERBOARD_SEED.map((e) => [e.rank, e.votes])) };
        for (const [rank, dir] of Object.entries(parsed)) {
          adjusted[Number(rank)] = (adjusted[Number(rank)] ?? 0) + (dir === 'up' ? 1 : -1);
        }
        setCounts(adjusted);
      }
    } catch { /* ignore */ }
  }, []);

  const handleVote = (rank: number, dir: 'up' | 'down') => {
    if (votes[rank]) return; // already voted
    const newVotes = { ...votes, [rank]: dir };
    const newCounts = { ...counts, [rank]: (counts[rank] ?? 0) + (dir === 'up' ? 1 : -1) };
    setVotes(newVotes);
    setCounts(newCounts);
    try { localStorage.setItem('rme_votes', JSON.stringify(newVotes)); } catch { /* ignore */ }
  };

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🏆</span>
        <h2 className="text-xl font-black text-gray-700">Hall of Fame</h2>
        <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full ml-1">FREE</span>
        <span className="text-xs text-gray-400 font-semibold ml-auto">This week&apos;s legends</span>
      </div>
      <div className="bg-white rounded-3xl shadow-xl border border-yellow-100 overflow-hidden">
        {LEADERBOARD_SEED.map((entry, i) => {
          const voted = votes[entry.rank];
          const count = counts[entry.rank] ?? entry.votes;
          return (
            <div
              key={entry.rank}
              className={`flex items-center gap-4 px-6 py-4 ${i < LEADERBOARD_SEED.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50 transition`}
            >
              {/* Rank badge */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                entry.rank === 1 ? 'bg-yellow-400 text-white' :
                entry.rank === 2 ? 'bg-gray-300 text-gray-700' :
                entry.rank === 3 ? 'bg-amber-600 text-white' :
                'bg-gray-100 text-gray-500'
              }`}>
                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
              </div>

              {/* Excuse text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-700 leading-snug line-clamp-2">&ldquo;{entry.excuse}&rdquo;</p>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">{entry.ctx} · {count.toLocaleString()} votes</p>
              </div>

              {/* Grade */}
              <div className={`flex-shrink-0 px-2.5 py-1 rounded-lg font-black text-sm ${
                entry.grade === 'A+' ? 'bg-emerald-100 text-emerald-700' :
                entry.grade === 'A'  ? 'bg-green-100 text-green-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {entry.grade}
              </div>

              {/* Vote buttons */}
              <div className="flex-shrink-0 flex items-center gap-1">
                <button
                  onClick={() => handleVote(entry.rank, 'up')}
                  disabled={!!voted}
                  title="Good excuse"
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition ${
                    voted === 'up'
                      ? 'bg-violet-600 text-white'
                      : voted
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-gray-100 hover:bg-violet-100 hover:text-violet-600 text-gray-500'
                  }`}
                >
                  ▲
                </button>
                <button
                  onClick={() => handleVote(entry.rank, 'down')}
                  disabled={!!voted}
                  title="Weak excuse"
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition ${
                    voted === 'down'
                      ? 'bg-pink-500 text-white'
                      : voted
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-gray-100 hover:bg-pink-100 hover:text-pink-500 text-gray-500'
                  }`}
                >
                  ▼
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [showPremium, setShowPremium] = useState(false);
  const [dailyExcuse, setDailyExcuse] = useState<{
    excuse: string;
    scenario: string;
    date: string;
    context?: string;
  } | null>(null);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [copied, setCopied] = useState(false);
  const [userExcuse, setUserExcuse] = useState('');
  const [rating, setRating] = useState(false);
  const [loadingTimer, setLoadingTimer] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Context selector state
  const [activeContext, setActiveContext] = useState<PresetContext | 'Custom'>('Work');
  const [customContext, setCustomContext] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const getContextValue = () => {
    if (activeContext === 'Custom') return customContext.trim() || 'work';
    return activeContext.toLowerCase();
  };

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setLoadingTimer(false);
      fetchDailyExcuse('work');
    }, 3000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const fetchDailyExcuse = async (context?: string) => {
    setLoadingDaily(true);
    try {
      const ctx = context ?? getContextValue();
      const res = await fetch(`/api/daily-excuse?context=${encodeURIComponent(ctx)}`);
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

  const handleContextChange = (ctx: PresetContext | 'Custom') => {
    setActiveContext(ctx);
    if (ctx === 'Custom') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      if (!loadingTimer) fetchDailyExcuse(ctx.toLowerCase());
    }
  };

  const handleCustomSubmit = () => {
    if (customContext.trim() && !loadingTimer) {
      fetchDailyExcuse(customContext.trim());
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
    sessionStorage.setItem('pendingExcuse', userExcuse.trim());
    sessionStorage.setItem('excuseContext', getContextValue());
    router.push('/rate');
  };

  const isLoading = loadingDaily || loadingTimer;

  return (
    <div className="min-h-screen">
      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} />}

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <span className="text-2xl font-black text-violet-600 tracking-tight">
          ratemy<span className="text-pink-500">.</span>excuse
        </span>
        <button
          onClick={() => setShowPremium(true)}
          className="bg-gradient-to-r from-violet-500 to-pink-500 text-white text-sm font-bold px-4 py-2 rounded-full hover:opacity-90 transition"
        >
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

        {/* Context Selector */}
        <section className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-bold text-gray-500 whitespace-nowrap">Excuse for:</span>
            {PRESET_CONTEXTS.map((ctx) => (
              <button
                key={ctx}
                onClick={() => handleContextChange(ctx)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition border-2 ${
                  activeContext === ctx
                    ? 'bg-violet-600 border-violet-600 text-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-600'
                }`}
              >
                {ctx}
              </button>
            ))}
            <button
              onClick={() => handleContextChange('Custom')}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition border-2 ${
                activeContext === 'Custom'
                  ? 'bg-pink-500 border-pink-500 text-white shadow-md'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-pink-300 hover:text-pink-500'
              }`}
            >
              Custom...
            </button>
            {showCustomInput && (
              <div className="flex items-center gap-2 mt-1 w-full sm:w-auto sm:mt-0">
                <input
                  type="text"
                  value={customContext}
                  onChange={(e) => setCustomContext(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                  placeholder="e.g. my boss, my gym teacher..."
                  className="border-2 border-pink-200 focus:border-pink-400 rounded-full px-4 py-1.5 text-sm font-semibold outline-none transition text-gray-700 w-56"
                  autoFocus
                />
                <button
                  onClick={handleCustomSubmit}
                  disabled={!customContext.trim()}
                  className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-4 py-1.5 rounded-full text-sm transition disabled:opacity-40"
                >
                  Go →
                </button>
              </div>
            )}
          </div>
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
                        onClick={() => fetchDailyExcuse()}
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

        {/* Leaderboard */}
        <Leaderboard />

        {/* Premium CTA */}
        <section>
          <div className="bg-gradient-to-r from-violet-600 to-pink-500 rounded-3xl p-8 text-white text-center shadow-2xl">
            <div className="text-4xl mb-3">👑</div>
            <h3 className="text-2xl font-black mb-2">Want better excuses?</h3>
            <p className="text-violet-100 font-semibold mb-2">
              Unlock the <strong>Excuse Fixer</strong>, leaderboard entries, and unlimited ratings.
            </p>
            <p className="text-white/80 font-bold text-lg mb-5">$1.29<span className="text-white/60 font-semibold text-sm">/month · First week free</span></p>
            <button
              onClick={() => setShowPremium(true)}
              className="bg-white text-violet-700 font-black px-8 py-3 rounded-2xl hover:bg-violet-50 transition text-lg"
            >
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
