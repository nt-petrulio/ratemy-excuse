'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { RatingResult } from '@/app/api/rate-excuse/route';
import type { FixResult } from '@/app/api/fix-excuse/route';

const PremiumModal = dynamic(() => import('@/components/PremiumModal'), { ssr: false });

const GRADE_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  'A+': { bg: 'from-emerald-400 to-green-500', text: 'text-white', ring: 'ring-emerald-300' },
  'A':  { bg: 'from-green-400 to-teal-500',   text: 'text-white', ring: 'ring-green-300' },
  'B':  { bg: 'from-blue-400 to-cyan-500',     text: 'text-white', ring: 'ring-blue-300' },
  'C':  { bg: 'from-yellow-400 to-amber-500',  text: 'text-white', ring: 'ring-yellow-300' },
  'D':  { bg: 'from-orange-400 to-red-400',    text: 'text-white', ring: 'ring-orange-300' },
  'F':  { bg: 'from-red-500 to-rose-600',      text: 'text-white', ring: 'ring-red-300' },
};

const GRADE_LABELS: Record<string, string> = {
  'A+': 'Masterpiece 🏆',
  'A':  'Excellent 🌟',
  'B':  'Solid Effort 👍',
  'C':  'Room to Grow 🤔',
  'D':  'Needs Work 😬',
  'F':  'Just Tell The Truth 💀',
};

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), 300);
    return () => clearTimeout(timer);
  }, [value]);
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="text-sm font-bold text-gray-600">{label}</span>
        <span className="text-sm font-black text-gray-800">{value}/100</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default function RatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<RatingResult | null>(null);
  const [excuse, setExcuse] = useState('');
  const [shared, setShared] = useState(false);
  const [error, setError] = useState('');

  // Fixer state
  const [fixing, setFixing] = useState(false);
  const [fixResult, setFixResult] = useState<FixResult | null>(null);
  const [fixError, setFixError] = useState('');

  // Premium modal
  const [showPremium, setShowPremium] = useState(false);

  useEffect(() => {
    const pending = sessionStorage.getItem('pendingExcuse');
    if (!pending) { router.push('/'); return; }
    setExcuse(pending);
    fetchRating(pending);
  }, [router]);

  const fetchRating = async (excuseText: string) => {
    const context = sessionStorage.getItem('excuseContext') || undefined;
    try {
      const res = await fetch('/api/rate-excuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ excuse: excuseText, context }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRating(data);
    } catch (err) {
      setError('Could not get a rating. Try again!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFix = async () => {
    if (!rating || fixing) return;
    setFixing(true);
    setFixError('');
    const context = sessionStorage.getItem('excuseContext') || undefined;
    try {
      const res = await fetch('/api/fix-excuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ excuse, context, originalGrade: rating.grade }),
      });
      const data: FixResult = await res.json();
      if ('error' in data) throw new Error((data as { error: string }).error);
      setFixResult(data);
    } catch {
      setFixError('Fixer hit a snag. Try again!');
    } finally {
      setFixing(false);
    }
  };

  const handleShare = () => {
    if (!rating) return;
    const text = `My excuse scored ${rating.grade} today 🎭 ratemy.excuse\n\n"${excuse}"`;
    navigator.clipboard.writeText(text);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const gradeStyle = rating ? (GRADE_COLORS[rating.grade] ?? GRADE_COLORS['B']) : GRADE_COLORS['B'];
  const fixedGradeStyle = fixResult ? (GRADE_COLORS[fixResult.grade] ?? GRADE_COLORS['A']) : GRADE_COLORS['A'];

  const needsFixer = rating && !['A+', 'A'].includes(rating.grade);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="text-6xl animate-bounce">⚖️</div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-700 mb-2">Consulting the AI Judge...</h2>
          <p className="text-gray-400 font-semibold">Analysing believability, creativity, and overall audacity</p>
        </div>
        <div className="flex gap-2">
          {['bg-violet-400', 'bg-pink-400', 'bg-orange-400'].map((c, i) => (
            <div key={c} className={`w-3 h-3 rounded-full ${c} animate-bounce`} style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
        <div className="text-6xl">😵</div>
        <h2 className="text-2xl font-black text-gray-700">{error}</h2>
        <button onClick={() => router.push('/')} className="bg-violet-600 text-white font-bold px-6 py-3 rounded-2xl hover:bg-violet-700 transition">← Try Again</button>
      </div>
    );
  }

  if (!rating) return null;

  return (
    <div className="min-h-screen">
      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} />}

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <button onClick={() => router.push('/')} className="text-2xl font-black text-violet-600 tracking-tight">
          ratemy<span className="text-pink-500">.</span>excuse
        </button>
        <button
          onClick={() => setShowPremium(true)}
          className="bg-gradient-to-r from-violet-500 to-pink-500 text-white text-sm font-bold px-4 py-2 rounded-full hover:opacity-90 transition"
        >
          ✨ Go Premium
        </button>
      </nav>

      <main className="max-w-2xl mx-auto px-6 pb-16">
        {/* Grade Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-6">
          <div className={`bg-gradient-to-br ${gradeStyle.bg} p-10 text-center`}>
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-white/20 backdrop-blur ring-4 ${gradeStyle.ring} mb-4`}>
              <span className="text-7xl font-black text-white">{rating.grade}</span>
            </div>
            <p className="text-white font-black text-xl">{GRADE_LABELS[rating.grade] ?? 'Rated!'}</p>
            <p className="text-white/80 font-semibold mt-1">Overall score: {rating.score}/100</p>
          </div>

          <div className="p-8">
            <div className="bg-gray-50 rounded-2xl p-5 mb-6">
              <p className="text-gray-700 font-bold text-base italic">&ldquo;{rating.verdict}&rdquo;</p>
            </div>
            <h3 className="font-black text-gray-700 mb-4 text-base uppercase tracking-wide">Score Breakdown</h3>
            <ScoreBar label="🎭 Believability" value={rating.believability} color="bg-gradient-to-r from-violet-400 to-purple-500" />
            <ScoreBar label="✨ Creativity"    value={rating.creativity}    color="bg-gradient-to-r from-pink-400 to-rose-500" />

            {rating.tips.length > 0 && (
              <div className="mt-6">
                <h3 className="font-black text-gray-700 mb-3 text-base uppercase tracking-wide">💡 Tips to Level Up</h3>
                <ul className="space-y-2">
                  {rating.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600 font-semibold">
                      <span className="flex-shrink-0 w-6 h-6 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center text-xs font-black">{i + 1}</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Fixer Section */}
        {needsFixer && !fixResult && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🔧</div>
              <div className="flex-1">
                <h3 className="font-black text-gray-800 text-lg mb-1">Excuse Fixer <span className="text-xs bg-violet-600 text-white font-bold px-2 py-0.5 rounded-full ml-1">PREMIUM</span></h3>
                <p className="text-gray-600 font-semibold text-sm mb-4">
                  Our AI will rewrite your excuse to deserve an <strong>A or A+</strong>. Same story, 10× more believable.
                </p>
                {fixError && <p className="text-red-500 text-sm font-semibold mb-2">{fixError}</p>}
                <button
                  onClick={handleFix}
                  disabled={fixing}
                  className="bg-gradient-to-r from-amber-500 to-orange-400 text-white font-black px-6 py-3 rounded-2xl hover:opacity-90 transition disabled:opacity-60 flex items-center gap-2 text-sm"
                >
                  {fixing ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      AI is fixing it...
                    </>
                  ) : (
                    '✨ Fix My Excuse (free this week)'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fixer Result */}
        {fixResult && (
          <div className="bg-white rounded-3xl shadow-xl border-2 border-emerald-200 overflow-hidden mb-6">
            <div className={`bg-gradient-to-br ${fixedGradeStyle.bg} px-8 py-5 flex items-center gap-4`}>
              <span className="text-4xl font-black text-white">{fixResult.grade}</span>
              <div>
                <p className="text-white font-black text-lg">Fixed! 🔧✨</p>
                <p className="text-white/80 text-sm font-semibold">Your upgraded excuse</p>
              </div>
            </div>
            <div className="p-8">
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Original</p>
                <p className="text-gray-400 italic text-sm">&ldquo;{fixResult.original.slice(0, 120)}{fixResult.original.length > 120 ? '…' : ''}&rdquo;</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-5 mb-4">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2">✨ Upgraded</p>
                <p className="text-gray-700 font-bold text-base">&ldquo;{fixResult.fixed}&rdquo;</p>
              </div>
              {fixResult.tip && (
                <div className="flex items-start gap-2 text-sm text-gray-500 font-semibold">
                  <span>💡</span>
                  <span>{fixResult.tip}</span>
                </div>
              )}
              <button
                onClick={() => { navigator.clipboard.writeText(fixResult.fixed); }}
                className="mt-5 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl transition text-sm"
              >
                📋 Copy Fixed Excuse
              </button>
            </div>
          </div>
        )}

        {/* Shareable card */}
        <div className="bg-gradient-to-br from-violet-600 to-pink-500 rounded-3xl p-8 mb-6 shadow-xl">
          <div className="text-center text-white">
            <div className="text-4xl mb-2">🎭</div>
            <p className="font-black text-2xl mb-1">My excuse scored <span className="underline decoration-wavy">{rating.grade}</span> today</p>
            <p className="text-violet-100 font-semibold text-sm mb-4">&ldquo;{excuse.slice(0, 100)}{excuse.length > 100 ? '…' : ''}&rdquo;</p>
            <p className="text-white/60 text-xs font-bold tracking-widest uppercase">ratemy.excuse</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleShare} className="flex-1 bg-white border-2 border-violet-200 text-violet-700 font-black py-4 rounded-2xl hover:bg-violet-50 transition flex items-center justify-center gap-2">
            {shared ? '✅ Copied!' : '📤 Share Result'}
          </button>
          <button onClick={() => router.push('/')} className="flex-1 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-black py-4 rounded-2xl hover:opacity-90 transition flex items-center justify-center gap-2">
            🔄 Try Another →
          </button>
        </div>

        {/* Premium CTA */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
          <p className="text-amber-700 font-black">
            👑 Want an A+ every time?{' '}
            <button onClick={() => setShowPremium(true)} className="underline hover:text-amber-900 transition">
              Go Premium →
            </button>
          </p>
          <p className="text-amber-600 text-sm font-semibold mt-1">$1.29/mo · First week free</p>
        </div>
      </main>

      <footer className="text-center py-8 text-gray-400 text-sm font-semibold">
        <p>Made with 🎭 and a sprinkle of AI • ratemy.excuse</p>
      </footer>
    </div>
  );
}
