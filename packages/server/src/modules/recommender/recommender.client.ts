/**
 * Recommender — pgvector + Ollama (pure Node.js, no Python needed)
 */
import { prisma } from '../../lib/prisma.js';
import { getEmbedding, chatCompletion, ollamaAvailable } from './ollama.client.js';

export { ollamaAvailable };

function buildProfileText(profile: any): string {
  const parts: string[] = [];
  parts.push(`Gender: ${profile.gender || 'unknown'}`);
  parts.push(`Age: ${profile.age || 0}`);
  if (profile.bio) parts.push(`Bio: ${profile.bio}`);
  if (profile.tags?.length) parts.push(`Interests: ${profile.tags.join(', ')}`);
  if (profile.mbti) parts.push(`MBTI: ${profile.mbti}`);
  if (profile.bigFive) {
    const bf = profile.bigFive;
    parts.push(`Personality: O:${bf.openness || 0.5} C:${bf.conscientiousness || 0.5} E:${bf.extraversion || 0.5} A:${bf.agreeableness || 0.5} N:${bf.neuroticism || 0.5}`);
  }
  if (profile.questionnaire) {
    const q = profile.questionnaire;
    if (q.attachmentLabel) parts.push(`Attachment: ${q.attachmentLabel}`);
    if (q.loveLanguageLabel) parts.push(`Love language: ${q.loveLanguageLabel}`);
    if (q.conflictLabel) parts.push(`Conflict style: ${q.conflictLabel}`);
    if (q.lifeGoal) parts.push(`Looking for: ${q.lifeGoal}`);
  }
  return parts.join('\n');
}

export async function embedUser(userId: string, profile: any) {
  try {
    const text = buildProfileText(profile);
    const embedding = await getEmbedding(text);
    // Truncate/pad to 1024
    const vec = embedding.slice(0, 1024);
    while (vec.length < 1024) vec.push(0);

    const vecStr = `[${vec.join(',')}]`;
    await prisma.$executeRawUnsafe(
      `UPDATE "Questionnaire" SET profile_embedding = $1::vector WHERE "userId" = $2::text`,
      vecStr, userId
    );
    return { status: 'ok', dim: vec.length };
  } catch { return null; }
}

export async function batchEmbedUsers(users: Array<{ userId: string; profile: any }>) {
  const results = [];
  for (const u of users) {
    const r = await embedUser(u.userId, u.profile);
    results.push(r);
  }
  return results;
}

export async function findSimilarUsers(
  userId: string,
  profile: any,
  options?: { topK?: number; excludeIds?: string[] }
): Promise<Array<{ userId: string; score: number }>> {
  try {
    // First ensure the current user is embedded
    await embedUser(userId, profile);

    const excludeIds = options?.excludeIds || [];
    const excludeList = [userId, ...excludeIds].map((id) => `'${id}'`).join(',');

    const topK = options?.topK || 20;

    const rows = await prisma.$queryRawUnsafe<Array<{ user_id: string; similarity: number }>>(
      `WITH target AS (
         SELECT profile_embedding AS emb FROM "Questionnaire" WHERE "userId" = $1::text
       )
       SELECT q."userId" AS user_id,
              1 - (q.profile_embedding <=> target.emb) AS similarity
       FROM "Questionnaire" q, target
       WHERE q."userId" NOT IN (${excludeList})
         AND q.profile_embedding IS NOT NULL
       ORDER BY similarity DESC
       LIMIT $2::int`,
      userId, topK
    );

    return rows.map((r) => ({ userId: r.user_id, score: Math.round(r.similarity * 10000) / 10000 }));
  } catch (err) {
    console.error('findSimilarUsers error:', err);
    return [];
  }
}

export async function getMatchExplanation(userA: any, userB: any) {
  try {
    const prompt = `你是约会匹配顾问。根据两个人的资料，用2-3句中文解释为什么他们可能适合。要具体、温暖。

A: ${JSON.stringify({ nickname: userA.nickname || 'A', gender: userA.gender, age: userA.age, bio: userA.bio, tags: userA.tags, mbti: userA.mbti, questionnaire: userA.questionnaire }, null, 2)}
B: ${JSON.stringify({ nickname: userB.nickname || 'B', gender: userB.gender, age: userB.age, bio: userB.bio, tags: userB.tags, mbti: userB.mbti, questionnaire: userB.questionnaire }, null, 2)}

中文解释：`;

    const explanation = await chatCompletion([{ role: 'user', content: prompt }]);
    return { explanation: explanation.trim() };
  } catch {
    const commonTags = (userA.tags || []).filter((t: string) => (userB.tags || []).includes(t));
    let fb = '你们有很多共同点';
    if (commonTags.length) fb += `，比如共同的兴趣：${commonTags.slice(0, 3).join('、')}`;
    return { explanation: fb, fallback: true };
  }
}

export async function getChatSuggestion(
  userA: any, userB: any,
  context: 'first_message' | 'conversation' | 'date_idea' = 'first_message',
  recentMessages?: Array<{ content: string; isMine: boolean }>
) {
  try {
    let prompt: string;
    if (context === 'first_message') {
      prompt = `两个人在约会app上刚匹配。根据他们的资料，写3条自然的开场消息（中文，每条不超过30字，自然不做作）：

A: ${JSON.stringify(userA)}
B: ${JSON.stringify(userB)}

3条开场消息（用换行分隔）：`;
    } else if (context === 'conversation') {
      const convo = (recentMessages || []).map((m) => `${m.isMine ? 'A' : 'B'}: ${m.content}`).join('\n');
      prompt = `根据对话，建议2-3条自然的中文回复：

${convo}

建议回复：`;
    } else {
      prompt = `根据两个人的共同兴趣（A: ${(userA.tags || []).join(',')}, B: ${(userB.tags || []).join(',')}），建议3个约会地点/活动（中文，各一句话）：`;
    }

    const content = await chatCompletion([{ role: 'user', content: prompt }]);
    const suggestions = content.split('\n').map((s) => s.replace(/^\d+[\.\)]\s*/, '').trim()).filter(Boolean);
    return { suggestions: suggestions.slice(0, 5) };
  } catch {
    return { suggestions: ['Hi！看了你的资料觉得很有意思 😊', '你也喜欢旅行吗？最近去了哪里？', '很高兴认识你！'], fallback: true };
  }
}

export async function getDailyPicks(userId: string, profile: any) {
  try {
    const similar = await findSimilarUsers(userId, profile, { topK: 10 });
    return { picks: similar };
  } catch { return { picks: [] }; }
}
