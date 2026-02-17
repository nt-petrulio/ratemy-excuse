// AI provider abstraction — swap Gemini ↔ Claude ↔ OpenAI by changing one line
export type AIProvider = 'gemini' | 'claude' | 'openai';

const PROVIDER: AIProvider = 'openai';

export async function generateText(prompt: string): Promise<string> {
  if (PROVIDER === 'openai') {
    const OpenAI = (await import('openai')).default;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });
    return completion.choices[0].message.content ?? '';
  }

  if (PROVIDER === 'gemini') {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  if (PROVIDER === 'claude') {
    // Future: use @anthropic-ai/sdk
    // const Anthropic = (await import('@anthropic-ai/sdk')).default;
    // const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    // const msg = await client.messages.create({ model: 'claude-3-5-sonnet-20241022', max_tokens: 1024, messages: [{ role: 'user', content: prompt }] });
    // return (msg.content[0] as { type: string; text: string }).text;
    throw new Error('Claude provider not yet configured');
  }

  throw new Error(`Provider ${PROVIDER} not configured`);
}
