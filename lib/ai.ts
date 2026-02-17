// AI provider abstraction — swap Gemini ↔ Claude ↔ OpenAI via env vars
// Set AI_PROVIDER and AI_MODEL in your .env / Vercel env vars

export type AIProvider = 'gemini' | 'claude' | 'openai';

function getProvider(): AIProvider {
  const p = (process.env.AI_PROVIDER ?? 'openai').toLowerCase();
  if (p === 'gemini' || p === 'claude' || p === 'openai') return p as AIProvider;
  return 'openai';
}

export async function generateText(prompt: string): Promise<string> {
  const provider = getProvider();

  if (provider === 'openai') {
    const OpenAI = (await import('openai')).default;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
    const model = process.env.AI_MODEL ?? 'gpt-4o';

    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
    });
    return completion.choices[0].message.content ?? '';
  }

  if (provider === 'gemini') {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const apiKey = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_API_KEY is not set');
    const model = process.env.AI_MODEL ?? 'gemini-2.0-flash';

    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({ model });
    const result = await genModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  if (provider === 'claude') {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');
    const model = process.env.AI_MODEL ?? 'claude-3-5-haiku-20241022';

    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    return (msg.content[0] as { type: string; text: string }).text;
  }

  throw new Error(`Provider ${provider} not configured`);
}
