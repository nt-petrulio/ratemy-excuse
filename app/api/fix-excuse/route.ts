import { NextResponse } from 'next/server';
import { generateText } from '@/lib/ai';

export interface FixResult {
  original: string;
  fixed: string;
  grade: string;
  tip: string;
}

export async function POST(req: Request) {
  try {
    const { excuse, context, originalGrade } = await req.json();
    if (!excuse) return NextResponse.json({ error: 'No excuse provided' }, { status: 400 });

    const ctx = context || 'work';

    const prompt = `You are a world-class excuse coach. A user got a "${originalGrade ?? 'C'}" grade for this excuse (context: ${ctx}):

"${excuse}"

Rewrite it to deserve an A or A+. Keep the same core reason but make it:
- More specific and believable (concrete details)
- Add ONE perfectly placed emotional hook
- Sound natural, not rehearsed
- Match the context (${ctx})

Reply ONLY with valid JSON (no markdown, no backticks):
{
  "fixed": "the improved excuse here",
  "grade": "A",
  "tip": "one sentence explaining what you changed and why it works better"
}`;

    const raw = await generateText(prompt);

    // Strip markdown code blocks if present
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    let result: FixResult;
    try {
      const parsed = JSON.parse(cleaned);
      result = {
        original: excuse,
        fixed: parsed.fixed,
        grade: parsed.grade ?? 'A',
        tip: parsed.tip ?? '',
      };
    } catch {
      result = {
        original: excuse,
        fixed: "My therapist advised me to be transparent about my limitations, and right now my limitation is being physically incapable of arriving on time due to an anxiety spiral triggered by an overdue bill notification — I've already scheduled an appointment.",
        grade: 'A',
        tip: 'Added emotional depth and a resolution signal — shows self-awareness.',
      };
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('fix-excuse error:', err);
    return NextResponse.json({ error: 'Could not fix excuse' }, { status: 500 });
  }
}
