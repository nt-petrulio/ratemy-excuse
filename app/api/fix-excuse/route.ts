import { NextResponse } from 'next/server';
import { generateText } from '@/lib/ai';
import { sanitizeInput, wrapUserContent, SYSTEM_GUARD } from '@/lib/guardrails';

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

    // Guardrail: sanitize user input
    const sanitized = sanitizeInput(excuse);
    if (!sanitized.safe) {
      return NextResponse.json({ error: 'Nice try 😏 Provide an actual excuse.' }, { status: 400 });
    }

    const safeContext = context ? sanitizeInput(context).text.slice(0, 50) : 'work';
    const safeGrade = ['A+','A','B','C','D','F'].includes(originalGrade) ? originalGrade : 'C';

    const prompt = `${SYSTEM_GUARD}You are a world-class excuse coach. A user got a "${safeGrade}" grade for their excuse (context: ${safeContext}).

Rewrite the excuse below to deserve an A or A+. Keep the same core reason but make it:
- More specific and believable (concrete details)
- Add ONE perfectly placed emotional hook
- Sound natural, not rehearsed
- Match the context (${safeContext})

The excuse to fix:
${wrapUserContent(sanitized.text)}

Reply ONLY with valid JSON (no markdown, no backticks):
{
  "fixed": "the improved excuse here",
  "grade": "A",
  "tip": "one sentence explaining what you changed and why it works better"
}`;

    const raw = await generateText(prompt);
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    let result: FixResult;
    try {
      const parsed = JSON.parse(cleaned);
      result = {
        original: sanitized.text,
        fixed: parsed.fixed,
        grade: parsed.grade ?? 'A',
        tip: parsed.tip ?? '',
      };
    } catch {
      result = {
        original: sanitized.text,
        fixed: "My therapist advised me to be transparent about my limitations — right now I'm physically incapable of arriving on time after an anxiety spiral triggered by an overdue notification. I've already scheduled an appointment to address it.",
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
