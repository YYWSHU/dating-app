import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { apiClient } from '../api/client';
import { ArrowLeft, Heart, Sparkles, ChevronRight, Check } from 'lucide-react';
import { cn } from '../lib/utils';

type Step = 'intro' | 'attachment' | 'love' | 'conflict' | 'communication' | 'social' | 'values' | 'goals' | 'done';

const STEP_ORDER: Step[] = ['intro', 'attachment', 'love', 'conflict', 'communication', 'social', 'values', 'goals', 'done'];
const STEP_TITLES: Record<Step, string> = {
  intro: '心理问卷',
  attachment: '依恋风格',
  love: '爱的语言',
  conflict: '冲突风格',
  communication: '沟通方式',
  social: '社交偏好',
  values: '关系价值观',
  goals: '人生阶段',
  done: '完成',
};

const LIKERT_LABELS = ['非常不同意', '比较不同意', '中立', '比较同意', '非常同意'];

export function QuestionnairePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('intro');
  const [questions, setQuestions] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [valueOrder, setValueOrder] = useState<string[]>([]);
  const [social, setSocial] = useState({ initiative: 0.5, groupSize: 0.5, planning: 0.5 });
  const [lifeGoal, setLifeGoal] = useState('finding_partner');
  const [lifePriority, setLifePriority] = useState('balanced');
  const [submitting, setSubmitting] = useState(false);
  const [existingQ, setExistingQ] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiClient.get('/questionnaire/questions');
        setQuestions(data);
        // Check existing
        const { data: eq } = await apiClient.get('/questionnaire/me').catch(() => ({ data: null }));
        setExistingQ(eq);
        if (eq) setStep('done');
      } catch {}
    })();
  }, []);

  const stepIndex = STEP_ORDER.indexOf(step);
  const progress = Math.round((stepIndex / (STEP_ORDER.length - 1)) * 100);

  const handleAnswer = (questionId: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const handleNext = () => {
    const next = STEP_ORDER[stepIndex + 1];
    if (next && next !== 'done') setStep(next);
    else handleSubmit();
  };

  const handleBack = () => {
    const prev = STEP_ORDER[stepIndex - 1];
    if (prev) setStep(prev);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const body = {
        attachment: questions.attachment.map((q: any) => ({ questionId: q.id, score: answers[q.id] || 3 })),
        loveLanguage: questions.loveLanguage.map((q: any) => ({ questionId: q.id, score: answers[q.id] || 3 })),
        conflict: questions.conflict.map((q: any) => ({ questionId: q.id, score: answers[q.id] || 3 })),
        communication: questions.communication.map((q: any) => ({ questionId: q.id, score: answers[q.id] || 3 })),
        valueOrder,
        social,
        lifeGoal,
        lifePriority,
      };
      await apiClient.post('/questionnaire', body);
      toast('success', '问卷已提交！匹配算法已更新');
      setStep('done');
    } catch { toast('error', '提交失败'); }
    setSubmitting(false);
  };

  const renderLikert = (questions: any[], dim?: string) => (
    <div className="space-y-6">
      {questions.filter((q: any) => !dim || q.dim === dim).map((q: any) => (
        <div key={q.id} className="bg-white rounded-xl p-4 card-shadow">
          <p className="text-sm text-gray-800 mb-3">{q.text}</p>
          <div className="flex justify-between gap-1">
            {[1,2,3,4,5].map((score) => (
              <button key={score} onClick={() => handleAnswer(q.id, score)}
                className={cn(
                  'flex-1 py-2 rounded-lg text-xs font-medium transition-all',
                  answers[q.id] === score
                    ? 'bg-pink-500 text-white shadow'
                    : 'bg-gray-50 text-gray-500 hover:bg-pink-50'
                )}>
                {score}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-1 px-1">
            <span className="text-[10px] text-gray-400">{LIKERT_LABELS[0]}</span>
            <span className="text-[10px] text-gray-400">{LIKERT_LABELS[4]}</span>
          </div>
        </div>
      ))}
    </div>
  );

  if (!questions) return <AppLayout hideNav><div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" /></div></AppLayout>;

  return (
    <AppLayout hideNav>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => step === 'intro' ? navigate(-1) : handleBack()} className="p-1"><ArrowLeft size={22} className="text-gray-700" /></button>
          <div className="flex-1">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <span className="text-xs text-gray-400">{stepIndex + 1}/{STEP_ORDER.length - 1}</span>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Intro */}
        {step === 'intro' && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary shadow-lg shadow-pink-200 mb-6">
              <Sparkles className="text-white" size={36} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">心理问卷</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-2">
              基于心理学理论设计，帮助算法更精准地为你找到合适的人。
            </p>
            <div className="text-left space-y-3 mt-6 mb-8 bg-pink-50 rounded-2xl p-5">
              {[
                { title: '依恋风格', desc: 'Bowlby & Ainsworth 依恋理论，了解你在亲密关系中的模式', icon: '🧩' },
                { title: '爱的语言', desc: 'Gary Chapman 经典理论，发现你如何表达和接收爱', icon: '💝' },
                { title: '冲突风格', desc: 'Thomas-Kilmann 模型，理解你处理分歧的方式', icon: '🤝' },
                { title: '关系价值观', desc: '排序你最看重的 8 项伴侣特质', icon: '🎯' },
              ].map((t) => (
                <div key={t.title} className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{t.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{t.title}</p>
                    <p className="text-xs text-gray-500">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mb-2">约 5 分钟 · 全部选做 · 可随时跳过</p>
            <Button onClick={() => setStep('attachment')} className="w-full">
              开始填写 <ChevronRight size={18} />
            </Button>
          </div>
        )}

        {/* Attachment */}
        {step === 'attachment' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">🧩 依恋风格</h2>
            <p className="text-xs text-gray-400 mb-4">基于 Bowlby & Ainsworth 依恋理论</p>
            {renderLikert(questions.attachment)}
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleBack}>上一步</Button>
              <Button className="flex-1" onClick={handleNext}>下一步</Button>
            </div>
          </div>
        )}

        {/* Love Languages */}
        {step === 'love' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">💝 爱的语言</h2>
            <p className="text-xs text-gray-400 mb-4">基于 Gary Chapman 五种爱的语言理论</p>
            {renderLikert(questions.loveLanguage)}
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleBack}>上一步</Button>
              <Button className="flex-1" onClick={handleNext}>下一步</Button>
            </div>
          </div>
        )}

        {/* Conflict */}
        {step === 'conflict' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">🤝 冲突风格</h2>
            <p className="text-xs text-gray-400 mb-4">基于 Thomas-Kilmann 冲突处理模型</p>
            {renderLikert(questions.conflict)}
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleBack}>上一步</Button>
              <Button className="flex-1" onClick={handleNext}>下一步</Button>
            </div>
          </div>
        )}

        {/* Communication */}
        {step === 'communication' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">💬 沟通方式</h2>
            <p className="text-xs text-gray-400 mb-4">直接型 vs 情感感知型</p>
            {renderLikert(questions.communication)}
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleBack}>上一步</Button>
              <Button className="flex-1" onClick={handleNext}>下一步</Button>
            </div>
          </div>
        )}

        {/* Social */}
        {step === 'social' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">👥 社交偏好</h2>
            <p className="text-xs text-gray-400 mb-4">你的社交舒适区</p>
            <div className="space-y-6">
              {[
                { label: '谁先开口？', left: '等对方先开口', right: '我主动开口', key: 'initiative' },
                { label: '社交规模', left: '小范围深聊', right: '大型聚会', key: 'groupSize' },
                { label: '周末安排', left: '随性临时决定', right: '提前计划好', key: 'planning' },
              ].map((s) => (
                <div key={s.key} className="bg-white rounded-xl p-4 card-shadow">
                  <p className="text-sm font-medium text-gray-800 mb-3">{s.label}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 w-16 text-right">{s.left}</span>
                    <input type="range" min="0" max="1" step="0.1"
                      value={(social as any)[s.key]}
                      onChange={(e) => setSocial((prev) => ({ ...prev, [s.key]: parseFloat(e.target.value) }))}
                      className="flex-1 accent-pink-500" />
                    <span className="text-[10px] text-gray-400 w-16">{s.right}</span>
                  </div>
                  <div className="text-center text-xs text-pink-500 font-bold mt-1">{Math.round((social as any)[s.key] * 100)}%</div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleBack}>上一步</Button>
              <Button className="flex-1" onClick={handleNext}>下一步</Button>
            </div>
          </div>
        )}

        {/* Values */}
        {step === 'values' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">🎯 关系价值观</h2>
            <p className="text-xs text-gray-400 mb-4">按重要性拖拽排序（点击选中，再点击目标位置）</p>
            <div className="space-y-2">
              {questions.values.map((v: any) => {
                const rank = valueOrder.indexOf(v.id);
                const isSelected = rank >= 0;
                return (
                  <button key={v.id}
                    onClick={() => {
                      if (isSelected) {
                        setValueOrder((prev) => prev.filter((x) => x !== v.id));
                      } else {
                        setValueOrder((prev) => [...prev, v.id]);
                      }
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
                      isSelected ? 'border-pink-500 bg-pink-50' : 'border-gray-100 bg-white'
                    )}>
                    <span className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                      isSelected ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-400')}>
                      {isSelected ? rank + 1 : v.icon}
                    </span>
                    <span className={cn('text-sm', isSelected ? 'font-semibold text-pink-700' : 'text-gray-600')}>{v.label}</span>
                    {isSelected && <span className="ml-auto text-xs text-pink-400">第 {rank + 1} 位</span>}
                  </button>
                );
              })}
            </div>
            {valueOrder.length < questions.values.length && (
              <p className="text-xs text-gray-400 mt-3 text-center">已选 {valueOrder.length}/{questions.values.length} · 点击添加排序</p>
            )}
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleBack}>上一步</Button>
              <Button className="flex-1" onClick={handleNext}>下一步</Button>
            </div>
          </div>
        )}

        {/* Goals */}
        {step === 'goals' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">🎯 人生阶段</h2>
            <p className="text-xs text-gray-400 mb-4">你目前在寻找什么？</p>
            <div className="space-y-3">
              {[
                { val: 'casual', label: '随缘交友', desc: '没有特定目标，顺其自然' },
                { val: 'finding_partner', label: '寻找伴侣', desc: '希望建立稳定的恋爱关系' },
                { val: 'marriage', label: '以结婚为目的', desc: '认真寻找人生伴侣' },
                { val: 'family', label: '组建家庭', desc: '想找到一起生活的人' },
                { val: 'exploring', label: '探索自我', desc: '还在了解自己真正想要什么' },
              ].map((g) => (
                <button key={g.val} onClick={() => setLifeGoal(g.val)}
                  className={cn('w-full text-left p-4 rounded-xl border-2 transition-all',
                    lifeGoal === g.val ? 'border-pink-500 bg-pink-50' : 'border-gray-100 bg-white')}>
                  <p className="font-semibold text-sm">{g.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{g.desc}</p>
                </button>
              ))}
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3">⚖️ 优先级</h2>
            <div className="space-y-3">
              {[
                { val: 'career_first', label: '事业优先', desc: '现在主要精力在事业上' },
                { val: 'love_first', label: '感情优先', desc: '愿意为感情投入大量时间' },
                { val: 'balanced', label: '平衡发展', desc: '事业和感情都想兼顾' },
                { val: 'free_spirit', label: '自由自在', desc: '不想被束缚，享受当下' },
              ].map((p) => (
                <button key={p.val} onClick={() => setLifePriority(p.val)}
                  className={cn('w-full text-left p-4 rounded-xl border-2 transition-all',
                    lifePriority === p.val ? 'border-purple-500 bg-purple-50' : 'border-gray-100 bg-white')}>
                  <p className="font-semibold text-sm">{p.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleBack}>上一步</Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={submitting}>
                {submitting ? '提交中...' : '提交问卷'}
              </Button>
            </div>
          </div>
        )}

        {/* Done */}
        {step === 'done' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {existingQ ? '问卷已完成！' : '感谢你的回答！'}
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              {existingQ
                ? '你的心理学画像已就绪，匹配算法正在使用它为你找到更合适的人。'
                : '算法会根据你的依恋风格、爱的语言、冲突风格等，为你匹配合适的人。'}
            </p>
            <div className="bg-pink-50 rounded-2xl p-5 mb-8 text-left space-y-2">
              {existingQ && (
                <>
                  <p className="text-sm"><span className="font-semibold">依恋风格：</span>{existingQ.attachmentLabel === 'secure' ? '安全型' : existingQ.attachmentLabel === 'anxious' ? '焦虑型' : existingQ.attachmentLabel === 'avoidant' ? '回避型' : '恐惧型'}</p>
                  <p className="text-sm"><span className="font-semibold">爱的语言：</span>{existingQ.loveLanguageLabel === 'wordsOfAffirmation' ? '肯定的言语' : existingQ.loveLanguageLabel === 'actsOfService' ? '服务的行为' : existingQ.loveLanguageLabel === 'receivingGifts' ? '接受礼物' : existingQ.loveLanguageLabel === 'qualityTime' ? '精心的时刻' : '身体的接触'}</p>
                  <p className="text-sm"><span className="font-semibold">冲突风格：</span>{existingQ.conflictLabel}</p>
                  <p className="text-sm"><span className="font-semibold">沟通方式：</span>{existingQ.communicationLabel === 'direct' ? '直接型' : '情感感知型'}</p>
                </>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate('/discover')}>
                去发现
              </Button>
              {!existingQ && (
                <Button variant="outline" className="flex-1" onClick={() => setStep('attachment')}>
                  重新填写
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
