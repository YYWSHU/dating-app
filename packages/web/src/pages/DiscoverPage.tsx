import { useEffect, useState } from 'react';
import { useMatchStore } from '../stores/match.store';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Heart, X, Star, RotateCcw, MapPin, Sparkles } from 'lucide-react';
import { cn, calculateAge } from '../lib/utils';
import type { DiscoverUser } from '../types';

export function DiscoverPage() {
  const { discoverUsers, isLoadingDiscover, fetchDiscover, likeUser, superLikeUser, passUser, undoLastPass } = useMatchStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState<'like' | 'superlike' | 'pass' | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState<DiscoverUser | null>(null);
  const [superLikesLeft, setSuperLikesLeft] = useState(3);

  useEffect(() => { fetchDiscover(); }, []);

  const currentUser = discoverUsers[currentIndex];
  const isOutOfCards = !isLoadingDiscover && currentIndex >= discoverUsers.length && discoverUsers.length > 0;

  const handleLike = async () => {
    if (!currentUser || animating) return;
    setAnimating('like');
    const user = currentUser;
    // Advance immediately, API runs in background
    setCurrentIndex((i) => i + 1);
    setAnimating(null);
    likeUser(user.id).then((isMatch) => {
      if (isMatch) { setMatchedUser(user); setShowMatch(true); }
    });
  };

  const handleSuperLike = async () => {
    if (!currentUser || animating || superLikesLeft <= 0) return;
    setAnimating('superlike');
    setSuperLikesLeft((c) => c - 1);
    const user = currentUser;
    setCurrentIndex((i) => i + 1);
    setAnimating(null);
    superLikeUser(user.id).then((isMatch) => {
      if (isMatch) { setMatchedUser(user); setShowMatch(true); }
    });
  };

  const handlePass = async () => {
    if (!currentUser || animating) return;
    setAnimating('pass');
    const user = currentUser;
    setCurrentIndex((i) => i + 1);
    setAnimating(null);
    passUser(user.id); // fire-and-forget
  };

  const handleUndo = async () => {
    try {
      const result = await undoLastPass();
      if (result?.undoneUserId) {
        // Refresh to get the undone user back
        setCurrentIndex(0);
        await fetchDiscover();
      }
    } catch { /* no pass to undo */ }
  };

  if (isLoadingDiscover) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-pink-500 border-t-transparent animate-spin mx-auto" />
            <p className="text-gray-400 mt-4">正在找附近的人...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 pt-4">
        {/* Header with undo */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">发现</h1>
          <div className="flex items-center gap-2">
            <button onClick={handleUndo} className="w-9 h-9 rounded-full bg-white card-shadow flex items-center justify-center hover:scale-110 transition-transform" title="撤销上一个跳过">
              <RotateCcw size={16} className="text-gray-500" />
            </button>
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-full">
              <Sparkles size={14} className="text-yellow-500" />
              <span className="text-xs font-medium text-yellow-700">{superLikesLeft}</span>
            </div>
          </div>
        </div>

        {/* Match popup */}
        {showMatch && matchedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowMatch(false)}>
            <div className="bg-white rounded-3xl p-8 text-center mx-4 max-w-sm animate-slide-up" onClick={(e) => e.stopPropagation()}>
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">配对成功！</h2>
              <p className="text-gray-500 mt-2">你和 {matchedUser.nickname} 互相喜欢</p>
              {matchedUser.matchScore !== undefined && (
                <p className="text-sm text-pink-500 mt-1">匹配度: {Math.round(matchedUser.matchScore * 100)}%</p>
              )}
              <Button className="mt-6 w-full" onClick={() => setShowMatch(false)}>发送消息</Button>
            </div>
          </div>
        )}

        {currentUser ? (
          <div className="relative aspect-[3/4] w-full max-w-sm mx-auto">
            {/* Card */}
            <div className={cn(
              'absolute inset-0 rounded-3xl overflow-hidden card-shadow bg-white',
              animating === 'like' && 'animate-swipe-right',
              animating === 'superlike' && 'animate-swipe-right scale-110',
              animating === 'pass' && 'animate-swipe-left',
            )}>
              <div className="w-full h-full bg-gradient-to-b from-pink-200 to-pink-400 flex items-center justify-center">
                {currentUser.photos?.[0] ? (
                  <img src={currentUser.photos[0].url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-white">
                    <div className="w-32 h-32 rounded-full bg-white/30 mx-auto flex items-center justify-center">
                      <span className="text-5xl font-bold text-white/70">{currentUser.nickname[0]}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-6">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-bold text-white">{currentUser.nickname}, {currentUser.age || calculateAge(currentUser.birthDate)}</h3>
                  {currentUser.matchScore !== undefined && (
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs text-white font-medium">
                      {Math.round(currentUser.matchScore * 100)}% 匹配
                    </span>
                  )}
                </div>
                {currentUser.bio && (
                  <p className="text-white/80 text-sm mt-1 line-clamp-2">{currentUser.bio}</p>
                )}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {currentUser.tags?.slice(0, 5).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-white/20 rounded-full text-xs text-white">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* SuperLike overlay */}
            {animating === 'superlike' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="bg-blue-500/90 text-white px-8 py-4 rounded-full text-2xl font-bold animate-bounce">
                  ⭐ SUPER LIKE!
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-3">
              <button onClick={handlePass} className="w-14 h-14 rounded-full bg-white card-shadow flex items-center justify-center hover:scale-110 transition-transform active:scale-95">
                <X size={28} className="text-red-400" />
              </button>
              <button onClick={handleSuperLike} disabled={superLikesLeft <= 0}
                className={cn("w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-transform active:scale-95",
                  superLikesLeft > 0 ? "bg-blue-500 shadow-lg shadow-blue-200" : "bg-gray-200")}>
                <Star size={22} className={superLikesLeft > 0 ? "text-white" : "text-gray-400"} fill={superLikesLeft > 0 ? "white" : "none"} />
              </button>
              <button onClick={handleLike} className="w-16 h-16 rounded-full gradient-primary shadow-lg shadow-pink-300 flex items-center justify-center hover:scale-110 transition-transform active:scale-95">
                <Heart size={32} className="text-white" fill="white" />
              </button>
            </div>
          </div>
        ) : isOutOfCards ? (
          <EmptyState
            icon={<MapPin size={48} />}
            title="没有更多了"
            description="扩大搜索范围或稍后再来看看"
            action={<Button variant="outline" onClick={() => { setCurrentIndex(0); fetchDiscover(); }}>刷新</Button>}
          />
        ) : (
          <EmptyState
            icon={<MapPin size={48} />}
            title="暂时没有可推荐的人了"
            description="试试扩大你的搜索范围"
          />
        )}
      </div>
      <div className="h-24" />
    </AppLayout>
  );
}
