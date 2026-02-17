import { NextResponse } from 'next/server';
import { generateText } from '@/lib/ai';

const SCENARIOS = [
  'late to work',
  'skipped gym',
  'missed a call',
  'forgot birthday',
  'late to meeting',
];

const FALLBACK_EXCUSES: Record<string, string> = {
  'late to work': "My smart alarm misread my location data and thought I was already at the office — turns out the app was tracking my neighbour's commute.",
  'skipped gym': "The elevator was out and I live on the 12th floor, so I did 12 flights of stairs instead — that's basically CrossFit.",
  'missed a call': "My phone went into 'Focus Mode' by itself while I was in an actual moment of intense focus — technology finally understood me.",
  'forgot birthday': "I've been celebrating you in my heart every single day, so one calendar notification just felt redundant.",
  'late to meeting': "I was so well-prepared that I went over my pre-meeting notes and lost track of time — ironically, I was too ready.",
};

export const revalidate = 86400;

export async function GET() {
  const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
  const today = new Date().toISOString().split('T')[0];

  const prompt = `Generate a creative, funny, and surprisingly believable excuse for someone who is: "${scenario}".

The excuse should be:
- 2-3 sentences max
- Specific and detailed (specific details make excuses more believable)
- Slightly absurd but not impossible
- Written in first person

Just write the excuse text directly, no preamble or quotation marks.`;

  try {
    const excuse = await generateText(prompt);
    return NextResponse.json({
      excuse: excuse.trim(),
      scenario,
      date: today,
    });
  } catch (error) {
    console.error('AI error, using fallback:', error);
    return NextResponse.json({
      excuse: FALLBACK_EXCUSES[scenario],
      scenario,
      date: today,
      fallback: true,
    });
  }
}
