import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error.js';

// ===== 问卷题目定义 =====

// 依恋风格 (ECR-R 简化版, 12题)
export const ATTACHMENT_QUESTIONS = [
  { id: 'a1', text: '我害怕别人会离开我', dim: 'anxious' },
  { id: 'a2', text: '当别人靠得太近时，我会感到不舒服', dim: 'avoidant' },
  { id: 'a3', text: '我经常担心伴侣不是真的爱我', dim: 'anxious' },
  { id: 'a4', text: '我不太习惯依赖别人', dim: 'avoidant' },
  { id: 'a5', text: '我相信大多数关系都能长久', dim: 'secure', reverse: true },
  { id: 'a6', text: '我很容易和别人亲近', dim: 'secure' },
  { id: 'a7', text: '我担心自己对别人太依赖', dim: 'fearful' },
  { id: 'a8', text: '即使别人看起来很爱我，我也难以完全信任', dim: 'fearful' },
  { id: 'a9', text: '在亲密关系中，我需要很多确认和保证', dim: 'anxious' },
  { id: 'a10', text: '当关系变得太亲密时，我会想逃开', dim: 'avoidant' },
  { id: 'a11', text: '我能够舒适地依赖伴侣，也愿意让他依赖我', dim: 'secure' },
  { id: 'a12', text: '我渴望亲密关系，但又害怕受伤', dim: 'fearful' },
];

// 爱的语言 (5维度, 10题)
export const LOVE_LANGUAGE_QUESTIONS = [
  { id: 'l1', text: '听到赞美会让我感受到被爱', dim: 'wordsOfAffirmation' },
  { id: 'l2', text: '对方帮我做事情比说一万句话都管用', dim: 'actsOfService' },
  { id: 'l3', text: '收到精心挑选的礼物让我很开心', dim: 'receivingGifts' },
  { id: 'l4', text: '和伴侣共度独处时光最重要', dim: 'qualityTime' },
  { id: 'l5', text: '拥抱和身体接触让我感到安全', dim: 'physicalTouch' },
  { id: 'l6', text: '我喜欢收到手写的信或留言', dim: 'wordsOfAffirmation' },
  { id: 'l7', text: '在我疲惫时帮我分担家务是最好的爱', dim: 'actsOfService' },
  { id: 'l8', text: '礼物的价值不重要，重要的是心意', dim: 'receivingGifts' },
  { id: 'l9', text: '放下手机专心陪伴是最珍贵的', dim: 'qualityTime' },
  { id: 'l10', text: '牵手和拥抱是我表达爱的方式', dim: 'physicalTouch' },
];

// 冲突风格 (Thomas-Kilmann 简化, 10题)
export const CONFLICT_QUESTIONS = [
  { id: 'c1', text: '发生分歧时，我倾向于避免直接对抗', dim: 'avoiding' },
  { id: 'c2', text: '我会坚持自己的观点直到对方接受', dim: 'competing' },
  { id: 'c3', text: '我试图找到一个折中的解决方案', dim: 'compromising' },
  { id: 'c4', text: '为了维持和谐，我愿意让步', dim: 'accommodating' },
  { id: 'c5', text: '我希望找到一个让我们都满意的解决方案', dim: 'collaborating' },
  { id: 'c6', text: '我通常选择不争论，等待事情自然过去', dim: 'avoiding' },
  { id: 'c7', text: '我认为直接表达不满是最有效的方式', dim: 'competing' },
  { id: 'c8', text: '我愿意各退一步来解决问题', dim: 'compromising' },
  { id: 'c9', text: '对方的感受比我赢了争论更重要', dim: 'accommodating' },
  { id: 'c10', text: '我喜欢坐下来深入沟通，直到双方都理解', dim: 'collaborating' },
];

// 沟通风格 (5题)
export const COMMUNICATION_QUESTIONS = [
  { id: 'cm1', text: '我喜欢直接表达我的想法和感受', dim: 'direct' },
  { id: 'cm2', text: '我善于察觉他人的情感变化', dim: 'emotional' },
  { id: 'cm3', text: '我不喜欢猜测，更希望对方说清楚', dim: 'direct' },
  { id: 'cm4', text: '我经常根据对方的表情和语气来理解意图', dim: 'emotional' },
  { id: 'cm5', text: '坦率直言的沟通方式最适合我', dim: 'direct' },
];

// 关系价值观排序 (8项)
export const VALUE_ITEMS = [
  { id: 'appearance', label: '外貌', icon: '✨' },
  { id: 'personality', label: '性格', icon: '💫' },
  { id: 'career', label: '事业', icon: '💼' },
  { id: 'family', label: '家庭', icon: '🏠' },
  { id: 'sharedInterests', label: '共同兴趣', icon: '🎯' },
  { id: 'emotional', label: '情感连接', icon: '💕' },
  { id: 'financial', label: '经济基础', icon: '💰' },
  { id: 'lifestyle', label: '生活方式', icon: '🌿' },
];

// 社交风格 (3题)
export const SOCIAL_QUESTIONS = [
  { id: 's1', text: '你更愿意谁先打破沉默？', dim: 'initiative' }, // 0=等对方, 1=主动
  { id: 's2', text: '你更喜欢什么样的社交场合？', dim: 'groupSize' }, // 0=小聚, 1=大party
  { id: 's3', text: '你的周末计划通常是？', dim: 'planning' }, // 0=临时决定, 1=提前规划
];

// ===== 计分逻辑 =====

function scoreToLabel(scores: Record<string, number>): { label: string; dominant: string } {
  const entries = Object.entries(scores);
  entries.sort((a, b) => b[1] - a[1]);
  return { label: entries[0][0], dominant: entries[0][0] };
}

function normalizeScores(scores: number[], questions: number): Record<string, number> {
  // each question scored 1-5 (Likert), normalize to 0-1
  const maxPerDim = questions * 5;
  const result: Record<string, number> = {};
  let total = 0;
  for (const [i, s] of scores.entries()) {
    result[i.toString()] = s / maxPerDim;
    total += s / maxPerDim;
  }
  // Normalize so they sum to 1
  if (total > 0) {
    for (const k of Object.keys(result)) {
      result[k] = result[k] / total;
    }
  }
  return result;
}

interface Answer { questionId: string; score: number; } // 1-5

function sumByDim(answers: Answer[], questions: Array<{id:string;dim:string;reverse?:boolean}>) {
  const sums: Record<string, number> = {};
  const counts: Record<string, number> = {};
  for (const q of questions) {
    const a = answers.find((a) => a.questionId === q.id);
    if (!a) continue;
    const score = q.reverse ? 6 - a.score : a.score;
    sums[q.dim] = (sums[q.dim] || 0) + score;
    counts[q.dim] = (counts[q.dim] || 0) + 1;
  }
  // Average and normalize to 0-1
  const result: Record<string, number> = {};
  for (const [dim, sum] of Object.entries(sums)) {
    result[dim] = (sum / (counts[dim] * 5)); // 0-1 scale
  }
  return result;
}

function valueOrderToScores(order: string[]) {
  const n = order.length;
  const scores: Record<string, number> = {};
  for (let i = 0; i < n; i++) {
    scores[order[i]] = (n - i) / n; // first=1.0, last=1/n
  }
  return scores;
}

// ===== 主处理函数 =====

interface SubmitInput {
  attachment: Answer[];
  loveLanguage: Answer[];
  conflict: Answer[];
  communication: Answer[];
  valueOrder: string[];
  social: { initiative: number; groupSize: number; planning: number };
  lifeGoal: string;
  lifePriority: string;
}

export async function submitQuestionnaire(userId: string, input: SubmitInput) {
  const att = sumByDim(input.attachment, ATTACHMENT_QUESTIONS);
  const love = sumByDim(input.loveLanguage, LOVE_LANGUAGE_QUESTIONS);
  const conflict = sumByDim(input.conflict, CONFLICT_QUESTIONS);
  const comm = sumByDim(input.communication, COMMUNICATION_QUESTIONS);
  const values = valueOrderToScores(input.valueOrder);

  const attLabel = scoreToLabel(att).dominant;
  const loveLabel = scoreToLabel(love).dominant;
  const conflictLabel = scoreToLabel(conflict).dominant;
  const commLabel = comm.direct > comm.emotional ? 'direct' : 'emotional';

  const q = await prisma.questionnaire.upsert({
    where: { userId },
    update: {
      attachmentSecure: att.secure || 0,
      attachmentAnxious: att.anxious || 0,
      attachmentAvoidant: att.avoidant || 0,
      attachmentFearful: att.fearful || 0,
      attachmentLabel: attLabel,
      loveWordsOfAffirmation: love.wordsOfAffirmation || 0,
      loveActsOfService: love.actsOfService || 0,
      loveReceivingGifts: love.receivingGifts || 0,
      loveQualityTime: love.qualityTime || 0,
      lovePhysicalTouch: love.physicalTouch || 0,
      loveLanguageLabel: loveLabel,
      conflictAvoiding: conflict.avoiding || 0,
      conflictCompeting: conflict.competing || 0,
      conflictCompromising: conflict.compromising || 0,
      conflictAccommodating: conflict.accommodating || 0,
      conflictCollaborating: conflict.collaborating || 0,
      conflictLabel: conflictLabel,
      communicationDirect: comm.direct || 0.5,
      communicationEmotional: comm.emotional || 0.5,
      communicationLabel: commLabel,
      socialInitiative: input.social.initiative,
      socialGroupSize: input.social.groupSize,
      socialPlanning: input.social.planning,
      valueAppearance: values.appearance || 0,
      valuePersonality: values.personality || 0,
      valueCareer: values.career || 0,
      valueFamily: values.family || 0,
      valueSharedInterests: values.sharedInterests || 0,
      valueEmotional: values.emotional || 0,
      valueFinancial: values.financial || 0,
      valueLifestyle: values.lifestyle || 0,
      lifeGoal: input.lifeGoal,
      lifePriority: input.lifePriority,
    },
    create: {
      userId,
      attachmentSecure: att.secure || 0,
      attachmentAnxious: att.anxious || 0,
      attachmentAvoidant: att.avoidant || 0,
      attachmentFearful: att.fearful || 0,
      attachmentLabel: attLabel,
      loveWordsOfAffirmation: love.wordsOfAffirmation || 0,
      loveActsOfService: love.actsOfService || 0,
      loveReceivingGifts: love.receivingGifts || 0,
      loveQualityTime: love.qualityTime || 0,
      lovePhysicalTouch: love.physicalTouch || 0,
      loveLanguageLabel: loveLabel,
      conflictAvoiding: conflict.avoiding || 0,
      conflictCompeting: conflict.competing || 0,
      conflictCompromising: conflict.compromising || 0,
      conflictAccommodating: conflict.accommodating || 0,
      conflictCollaborating: conflict.collaborating || 0,
      conflictLabel: conflictLabel,
      communicationDirect: comm.direct || 0.5,
      communicationEmotional: comm.emotional || 0.5,
      communicationLabel: commLabel,
      socialInitiative: input.social.initiative,
      socialGroupSize: input.social.groupSize,
      socialPlanning: input.social.planning,
      valueAppearance: values.appearance || 0,
      valuePersonality: values.personality || 0,
      valueCareer: values.career || 0,
      valueFamily: values.family || 0,
      valueSharedInterests: values.sharedInterests || 0,
      valueEmotional: values.emotional || 0,
      valueFinancial: values.financial || 0,
      valueLifestyle: values.lifestyle || 0,
      lifeGoal: input.lifeGoal,
      lifePriority: input.lifePriority,
    },
  });

  return q;
}

export async function getQuestionnaire(userId: string) {
  return prisma.questionnaire.findUnique({ where: { userId } });
}

// ===== 匹配兼容性评分 =====
export function getQuestionnaireCompatibility(a: any, b: any): number {
  if (!a || !b) return 0.5;

  let score = 0;
  let count = 0;

  // 1. Attachment style compatibility (secure pairs best)
  const attCompat: Record<string, Record<string, number>> = {
    secure: { secure: 1.0, anxious: 0.7, avoidant: 0.3, fearful: 0.2 },
    anxious: { secure: 0.7, anxious: 0.3, avoidant: 0.5, fearful: 0.6 },
    avoidant: { secure: 0.3, anxious: 0.5, avoidant: 0.2, fearful: 0.1 },
    fearful: { secure: 0.2, anxious: 0.6, avoidant: 0.1, fearful: 0.4 },
  };
  if (a.attachmentLabel && b.attachmentLabel) {
    score += (attCompat[a.attachmentLabel]?.[b.attachmentLabel] || 0.5) * 0.2;
    count += 0.2;
  }

  // 2. Love language similarity
  const loveKeys = ['wordsOfAffirmation', 'actsOfService', 'receivingGifts', 'qualityTime', 'physicalTouch'];
  const lovePrefix = 'love';
  const loveA: number[] = [], loveB: number[] = [];
  for (const k of loveKeys) {
    const key = k.charAt(0).toUpperCase() + k.slice(1);
    loveA.push(a[`${lovePrefix}${key}`] || 0);
    loveB.push(b[`${lovePrefix}${key}`] || 0);
  }
  score += cosineSimilarity(loveA, loveB) * 0.15;
  count += 0.15;

  // 3. Conflict style - collaborative/compromising are most compatible
  const conflictCompat: Record<string, Record<string, number>> = {
    collaborating: { collaborating: 1.0, compromising: 0.9, accommodating: 0.6, avoiding: 0.3, competing: 0.1 },
    compromising: { collaborating: 0.9, compromising: 1.0, accommodating: 0.7, avoiding: 0.5, competing: 0.4 },
    accommodating: { collaborating: 0.6, compromising: 0.7, accommodating: 0.8, avoiding: 0.5, competing: 0.1 },
    avoiding: { collaborating: 0.3, compromising: 0.5, accommodating: 0.5, avoiding: 0.8, competing: 0.1 },
    competing: { collaborating: 0.1, compromising: 0.4, accommodating: 0.1, avoiding: 0.1, competing: 0.2 },
  };
  if (a.conflictLabel && b.conflictLabel) {
    score += (conflictCompat[a.conflictLabel]?.[b.conflictLabel] || 0.5) * 0.15;
    count += 0.15;
  }

  // 4. Value alignment
  const valueKeys = ['appearance','personality','career','family','sharedInterests','emotional','financial','lifestyle'];
  const valA: number[] = [], valB: number[] = [];
  for (const k of valueKeys) {
    const key = k.charAt(0).toUpperCase() + k.slice(1);
    valA.push(a[`value${key}`] || 0);
    valB.push(b[`value${key}`] || 0);
  }
  score += cosineSimilarity(valA, valB) * 0.25;
  count += 0.25;

  // 5. Life goal alignment
  if (a.lifeGoal && b.lifeGoal) {
    score += (a.lifeGoal === b.lifeGoal ? 1.0 : a.lifeGoal === 'exploring' || b.lifeGoal === 'exploring' ? 0.4 : 0.6) * 0.15;
    count += 0.15;
  }

  // 6. Communication complementarity
  const commDiff = Math.abs((a.communicationDirect || 0.5) - (b.communicationDirect || 0.5));
  const commScore = 1 - commDiff; // similar is better (but small diff is ok)
  score += commScore * 0.1;
  count += 0.1;

  return count > 0 ? score / count : 0.5;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += (a[i] || 0) * (b[i] || 0);
    normA += (a[i] || 0) ** 2;
    normB += (b[i] || 0) ** 2;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0.5 : dot / denom;
}
