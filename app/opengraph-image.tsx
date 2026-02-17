import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'ratemy.excuse — AI Excuse Generator & Rater';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 60%, #f97316 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background circles */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 400, height: 400,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '50%', display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: -100, left: -60,
          width: 500, height: 500,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '50%', display: 'flex',
        }} />

        {/* Emoji */}
        <div style={{ fontSize: 90, marginBottom: 24, display: 'flex' }}>🎭</div>

        {/* Title */}
        <div style={{
          fontSize: 80,
          fontWeight: 900,
          color: 'white',
          letterSpacing: '-2px',
          display: 'flex',
          gap: 0,
        }}>
          <span>ratemy</span>
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>.</span>
          <span>excuse</span>
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 32,
          color: 'rgba(255,255,255,0.85)',
          fontWeight: 600,
          marginTop: 20,
          display: 'flex',
        }}>
          AI-powered excuses. Rated. Perfected.
        </div>

        {/* Grade badges */}
        <div style={{ display: 'flex', gap: 16, marginTop: 48 }}>
          {[
            { grade: 'A+', bg: '#10b981', label: 'Masterpiece' },
            { grade: 'B',  bg: '#3b82f6', label: 'Solid Effort' },
            { grade: 'F',  bg: '#ef4444', label: 'Just Say Sorry' },
          ].map(({ grade, bg, label }) => (
            <div key={grade} style={{
              background: bg,
              borderRadius: 16,
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <span style={{ color: 'white', fontWeight: 900, fontSize: 28 }}>{grade}</span>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, fontWeight: 600 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
