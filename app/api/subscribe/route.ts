import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { email, source } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const entry = {
      email: email.trim().toLowerCase(),
      source: source ?? 'premium-modal',
      createdAt: new Date().toISOString(),
    };

    // --- Option 1: Resend (auto-enabled if RESEND_API_KEY is set) ---
    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'ratemy.excuse <onboarding@resend.dev>',
          to: process.env.OWNER_EMAIL ?? 'hello@ratemy.excuse',
          subject: `🎉 New Premium Signup: ${entry.email}`,
          text: `New signup from ratemy.excuse!\n\nEmail: ${entry.email}\nSource: ${entry.source}\nTime: ${entry.createdAt}`,
        }),
      }).catch(console.error);
    }

    // --- Option 2: Formspree (auto-enabled if FORMSPREE_ID is set) ---
    if (process.env.FORMSPREE_ID) {
      await fetch(`https://formspree.io/f/${process.env.FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: entry.email, source: entry.source }),
      }).catch(console.error);
    }

    // --- Always: save to local JSON file (zero-config fallback) ---
    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'subscribers.json');
    try {
      await fs.mkdir(dataDir, { recursive: true });
      let list: typeof entry[] = [];
      try {
        const raw = await fs.readFile(filePath, 'utf-8');
        list = JSON.parse(raw);
      } catch { /* first entry */ }
      // Deduplicate
      if (!list.find((e) => e.email === entry.email)) {
        list.push(entry);
        await fs.writeFile(filePath, JSON.stringify(list, null, 2));
      }
    } catch (e) {
      console.error('Could not write subscribers.json:', e);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('subscribe error:', err);
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }
}
