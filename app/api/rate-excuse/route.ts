import { NextResponse } from 'next/server';
import { generateText } from '@/lib/ai';

export interface RatingResult {
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  verdict: string;
  tips: string[];
  believability: number;
  creativity: number;
}

const FALLBACK_RATING: RatingResult = {
  grade: 'B',
  score: 72,
  verdict: "Okay, not bad — I've heard worse, but I've also definitely heard better.",
  tips: [
    "Add a specific detail, like a name or a time — it makes the whole thing way more believable.",
    "You sound a little rehearsed, maybe stumble a bit more when you say it out loud.",
    "Throw in a small inconvenient detail that nobody would bother making up.",
  ],
  believability: 68,
  creativity: 75,
};

export async function POST(request: Request) {
  const body = await request.json();
  const { excuse, context } = body as { excuse: string; context?: string };

  if (!excuse || excuse.trim().length === 0) {
    return NextResponse.json({ error: 'No excuse provided' }, { status: 400 });
  }

  const contextLine = context ? `Context: this is an excuse for ${context}.\n` : '';

  const prompt = `You're a witty, slightly sarcastic friend rating someone's excuse. Be honest but funny. Use casual language, not corporate speak. Grade from A+ to F.

The excuse: "${excuse.trim()}"
${contextLine}
Return ONLY a valid JSON object (no markdown, no explanation) with these exact fields:
{
  "grade": "A+", "A", "B", "C", "D", or "F",
  "score": number between 0-100,
  "verdict": "1 funny sentence — your honest reaction as a friend",
  "tips": ["tip 1 written like a friend giving real advice", "tip 2", "tip 3"],
  "believability": number between 0-100,
  "creativity": number between 0-100
}

Grading (be a tough but fair friend):
- A+ (90-100): Honestly I'd believe this myself. Masterpiece.
- A (80-89): Pretty solid, I'd probably let it slide.
- B (65-79): Not bad, but I can kinda tell.
- C (50-64): Ehh, you're gonna need to work on your delivery.
- D (30-49): Bro. Just... no.
- F (0-29): Please just tell the truth, it's less embarrassing.

Return ONLY the JSON object.`;

  try {
    const raw = await generateText(prompt);

    // Strip any markdown code fences
    const cleaned = raw
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    // Extract JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const rating = JSON.parse(jsonMatch[0]) as RatingResult;

    // Validate required fields
    if (!rating.grade || rating.score === undefined || !rating.verdict || !rating.tips) {
      throw new Error('Invalid rating structure');
    }

    return NextResponse.json(rating);
  } catch (error) {
    console.error('Rating error, using fallback:', error);
    return NextResponse.json({ ...FALLBACK_RATING, fallback: true });
  }
}
