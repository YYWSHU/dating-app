/**
 * AI Client — Ollama (embeddings) + DeepSeek (chat)
 */
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || 'bge-m3';

// DeepSeek API (复用 settings.json 中的配置)
const DEEPSEEK_URL = process.env.DEEPSEEK_URL || process.env.ANTHROPIC_BASE_URL?.replace('/anthropic', '') || 'https://api.deepseek.com';
const DEEPSEEK_KEY = process.env.DEEPSEEK_KEY || process.env.ANTHROPIC_AUTH_TOKEN || '';
const DEEPSEEK_CHAT_MODEL = 'deepseek-chat';

// ===== Ollama: Embeddings =====

export async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: EMBED_MODEL, prompt: text }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Ollama embedding failed: ${res.status}`);
  const data = await res.json() as { embedding: number[] };
  return data.embedding;
}

export async function ollamaAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch { return false; }
}

// ===== DeepSeek: Chat =====

export async function chatCompletion(messages: Array<{ role: string; content: string }>): Promise<string> {
  const key = DEEPSEEK_KEY;
  if (!key) throw new Error('DeepSeek API key not configured');

  const res = await fetch(`${DEEPSEEK_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_CHAT_MODEL,
      messages,
      max_tokens: 200,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`DeepSeek chat failed: ${res.status}`);
  const data = await res.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0].message.content;
}
