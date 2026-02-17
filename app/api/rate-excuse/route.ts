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
  verdict: "A solid attempt — believable enough to buy some time, but it won't fool a seasoned excuse-detector.",
  tips: [
    'Add a specific time and location to make it more verifiable.',
    'Mention a third-party witness or evidence to boost credibility.',
    'Practice delivering it with just the right amount of regret.',
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

  const contextLine = context ? `Context: ${context}\n` : '';

  const prompt = `You are a professional excuse evaluator with a PhD in Plausibility Studies.

Rate the following excuse:
"${excuse.trim()}"
${contextLine}
Return ONLY a valid JSON object (no markdown, no explanation) with these exact fields:
{
  "grade": "A+", "A", "B", "C", "D", or "F",
  "score": number between 0-100,
  "verdict": "one sentence verdict (funny but constructive)",
  "tips": ["tip 1", "tip 2", "tip 3"],
  "believability": number between 0-100,
  "creativity": number between 0-100
}

Grading rubric:
- A+ (90-100): Masterpiece. Almost true-sounding. They'll never know.
- A (80-89): Excellent. High believability, creative, well-structured.
- B (65-79): Good attempt. Believable but a bit generic.
- C (50-64): Mediocre. Raises some eyebrows.
- D (30-49): Weak. Too obvious or too outrageous.
- F (0-29): Catastrophic fail. Just tell the truth instead.

Be witty in your verdict and tips. Return ONLY the JSON object.`;

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
