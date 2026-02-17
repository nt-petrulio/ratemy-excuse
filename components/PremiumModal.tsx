'use client';

import { useState } from 'react';

interface PremiumModalProps {
  onClose: () => void;
}

export default function PremiumModal({ onClose }: PremiumModalProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Enter a valid email please 😅');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'premium-modal' }),
      });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-[fadeInScale_0.2s_ease-out]">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-violet-600 to-pink-500 px-8 pt-8 pb-10 text-center text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl font-bold leading-none"
          >
            ×
          </button>
          <div className="text-5xl mb-3">👑</div>
          <h2 className="text-2xl font-black mb-1">Try Premium Free</h2>
          <p className="text-violet-100 font-semibold text-base">
            First week on us — no credit card needed
          </p>
        </div>

        {/* Features */}
        <div className="px-8 py-5 bg-violet-50 border-b border-violet-100">
          <ul className="space-y-2 text-sm font-semibold text-gray-700">
            {[
              { icon: '🔧', label: 'Excuse Fixer — AI rewrites your excuse to an A+' },
              { icon: '📊', label: 'Full score breakdown + coaching tips' },
              { icon: '🏆', label: 'Leaderboard visibility + Hall of Fame entry' },
              { icon: '♾️', label: 'Unlimited ratings per day' },
            ].map(({ icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="text-lg">{icon}</span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-center text-violet-600 font-black text-lg">
            $1.29<span className="text-gray-400 font-semibold text-sm"> / month after trial</span>
          </p>
        </div>

        {/* Email form / success */}
        <div className="px-8 py-6">
          {submitted ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-xl font-black text-gray-800 mb-2">You&apos;re in!</h3>
              <p className="text-gray-500 font-semibold text-sm">
                We&apos;ll reach out to <span className="text-violet-600 font-bold">{email}</span> with your Premium access details within 24h.
              </p>
              <button
                onClick={onClose}
                className="mt-5 bg-gradient-to-r from-violet-500 to-pink-500 text-white font-black px-8 py-3 rounded-2xl hover:opacity-90 transition"
              >
                Sweet, thanks! 🙌
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-bold text-gray-600 mb-2">
                Your email — we&apos;ll send your access link:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border-2 border-gray-200 focus:border-violet-400 rounded-2xl px-4 py-3 text-base font-semibold outline-none transition text-gray-700 mb-3"
                autoFocus
                required
              />
              {error && (
                <p className="text-red-500 text-sm font-semibold mb-2">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-pink-500 text-white font-black py-4 rounded-2xl hover:opacity-90 transition text-base disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Locking you in...
                  </>
                ) : (
                  '✨ Start Free Week →'
                )}
              </button>
              <p className="text-center text-gray-400 text-xs font-semibold mt-3">
                No spam. Cancel anytime. We&apos;ll contact you personally.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
