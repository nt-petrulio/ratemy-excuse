import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/lib/ai';
import { sanitizeInput, stripGuardrailTags, SYSTEM_GUARD } from '@/lib/guardrails';

const SCENARIOS = [
  'late to work',
  'skipped gym',
  'missed a call',
  'forgot birthday',
  'late to meeting',
];

const FALLBACK_EXCUSES: Record<string, string> = {
  'late to work': "Honestly, my alarm went off but I was so deep in this weird dream I just... couldn't. It's been a crazy week.",
  'skipped gym': "I totally meant to go, but then I remembered I left my water bottle at home and it just kind of spiraled from there.",
  'missed a call': "Ugh, I had my phone on silent and didn't notice until like an hour later — sorry, it's been one of those days.",
  'forgot birthday': "I honestly thought it was next week — I've had so much going on I've completely lost track of what day it is.",
  'late to meeting': "I was literally on my way out the door and my neighbor stopped me, you know how that goes — I couldn't just walk away.",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawContext = searchParams.get('context') || 'work';

  // Guardrail: sanitize the context param (it's user-supplied via URL)
  const sanitized = sanitizeInput(rawContext);
  const safeContext = sanitized.safe ? sanitized.text.slice(0, 50) : 'work';

  const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
  const today = new Date().toISOString().split('T')[0];

  const prompt = `${SYSTEM_GUARD}You are writing excuses that real humans actually use. Write in a casual, natural voice — like a real person talking, not an AI. Use contractions, slight imperfection, natural hesitation phrases ("honestly", "I totally forgot", "it's been crazy"). Context: excuse for ${safeContext}. The situation is: "${scenario}". Keep it 1-2 sentences max. Make it believable and relatable. Just write the excuse text directly, no preamble or quotation marks.`;

  try {
    const excuse = await generateText(prompt);
    return NextResponse.json({
      excuse: stripGuardrailTags(excuse.trim()),
      scenario,
      date: today,
      context: safeContext,
    });
  } catch (error) {
    console.error('AI error, using fallback:', error);
    return NextResponse.json({
      excuse: FALLBACK_EXCUSES[scenario],
      scenario,
      date: today,
      context: safeContext,
      fallback: true,
    });
  }
}
