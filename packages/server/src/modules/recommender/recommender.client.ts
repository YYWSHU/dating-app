/**
 * Recommender client - calls Python recommendation service
 */
const RECOMMENDER_URL = process.env.RECOMMENDER_URL || 'http://localhost:5002';

async function fetchRecommender(path: string, body?: any) {
  try {
    const res = await fetch(`${RECOMMENDER_URL}${path}`, {
      method: body ? 'POST' : 'GET',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function embedUser(userId: string, profile: any) {
  return fetchRecommender('/embed-user', { userId, profile });
}

export async function batchEmbedUsers(users: Array<{ userId: string; profile: any }>) {
  return fetchRecommender('/batch-embed', { users });
}

export async function findSimilarUsers(
  userId: string,
  profile: any,
  options?: { topK?: number; excludeIds?: string[]; genderFilter?: string }
) {
  return fetchRecommender('/similar-users', {
    userId,
    profile,
    topK: options?.topK || 20,
    excludeIds: options?.excludeIds || [],
    genderFilter: options?.genderFilter,
  });
}

export async function getMatchExplanation(userA: any, userB: any) {
  return fetchRecommender('/match-explanation', { userA, userB });
}

export async function getChatSuggestion(
  userA: any,
  userB: any,
  context: 'first_message' | 'conversation' | 'date_idea' = 'first_message',
  recentMessages?: Array<{ content: string; isMine: boolean }>
) {
  return fetchRecommender('/chat-suggestion', {
    userA, userB, context, recentMessages,
  });
}

export async function getDailyPicks(userId: string) {
  return fetchRecommender(`/daily-picks/${userId}`);
}

export async function recordLike(userId: string, likedId: string, action: 'like' | 'pass' | 'superlike') {
  return fetchRecommender('/record-like', { userId, likedId, action });
}
