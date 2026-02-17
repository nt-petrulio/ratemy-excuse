import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, source } = await req.json();
    if (!email || !email.includes('@') || email.length > 254) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      // Dev mode — just log it
      console.log(`[subscribe] New signup: ${cleanEmail} (source: ${source ?? 'unknown'})`);
      return NextResponse.json({ ok: true });
    }

    const ownerEmail = process.env.OWNER_EMAIL ?? 'nt.petrulio@gmail.com';
    const audienceId = process.env.RESEND_AUDIENCE_ID;

    // Fire both in parallel — don't block on either
    await Promise.allSettled([
      // 1. Notify owner
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'ratemy.excuse <onboarding@resend.dev>',
          to: ownerEmail,
          subject: `🎉 New Premium signup: ${cleanEmail}`,
          text: `New Premium interest on ratemy.excuse!\n\nEmail: ${cleanEmail}\nSource: ${source ?? 'unknown'}\nTime: ${new Date().toISOString()}\n\nReach out within 24h to lock them in.`,
        }),
      }),

      // 2. Add to Resend Contacts audience (if configured)
      audienceId
        ? fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: cleanEmail,
              unsubscribed: false,
            }),
          })
        : Promise.resolve(),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('subscribe error:', err);
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }
}
