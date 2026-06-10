import { useEffect, useState } from 'react';
import { useMatchStore } from '../stores/match.store';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Heart, X, Star, MapPin } from 'lucide-react';
import { cn, calculateAge, formatDistance } from '../lib/utils';
import type { DiscoverUser } from '../types';

export function DiscoverPage() {
  const { discoverUsers, isLoadingDiscover, fetchDiscover, likeUser, passUser } = useMatchStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState<'like' | 'pass' | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState<DiscoverUser | null>(null);

  useEffect(() => {
    fetchDiscover();
  }, []);

  const currentUser = discoverUsers[currentIndex];
  const isOutOfCards = !isLoadingDiscover && currentIndex >= discoverUsers.length && discoverUsers.length > 0;

  const handleLike = async () => {
    if (!currentUser || animating) return;
    setAnimating('like');
    setTimeout(async () => {
      const isMatch = await likeUser(currentUser.id);
      if (isMatch) {
        setMatchedUser(currentUser);
        setShowMatch(true);
      }
      setAnimating(null);
      setCurrentIndex((i) => i + 1);
    }, 300);
  };

  const handlePass = async () => {
    if (!currentUser || animating) return;
    setAnimating('pass');
    setTimeout(async () => {
      await passUser(currentUser.id);
      setAnimating(null);
      setCurrentIndex((i) => i + 1);
    }, 300);
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">发现</h1>

        {/* Match popup */}
        {showMatch && matchedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-in fade-in" onClick={() => setShowMatch(false)}>
            <div className="bg-white rounded-3xl p-8 text-center mx-4 max-w-sm" onClick={(e) => e.stopPropagation()}>
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">配对成功！</h2>
              <p className="text-gray-500 mt-2">你和 {matchedUser.nickname} 互相喜欢</p>
              <Button className="mt-6 w-full" onClick={() => setShowMatch(false)}>
                发送消息
              </Button>
            </div>
          </div>
        )}

        {currentUser ? (
          <div className="relative aspect-[3/4] w-full max-w-sm mx-auto">
            {/* Card */}
            <div
              className={cn(
                'absolute inset-0 rounded-3xl overflow-hidden card-shadow bg-white',
                animating === 'like' && 'animate-swipe-right',
                animating === 'pass' && 'animate-swipe-left'
              )}
            >
              {/* Photo area (placeholder) */}
              <div className="w-full h-full bg-gradient-to-b from-pink-200 to-pink-400 flex items-center justify-center">
                {currentUser.photos?.[0] ? (
                  <img src={currentUser.photos[0].url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-white">
                    <div className="w-32 h-32 rounded-full bg-white/30 mx-auto flex items-center justify-center">
                      <span className="text-5xl font-bold text-white/70">
                        {currentUser.nickname[0]}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-6">
                <h3 className="text-2xl font-bold text-white">
                  {currentUser.nickname}, {calculateAge(currentUser.birthDate)}
                </h3>
                {currentUser.bio && (
                  <p className="text-white/80 text-sm mt-1 line-clamp-2">{currentUser.bio}</p>
                )}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {currentUser.tags?.slice(0, 4).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-white/20 rounded-full text-xs text-white">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <button
                onClick={handlePass}
                className="w-14 h-14 rounded-full bg-white card-shadow flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
              >
                <X size={28} className="text-red-400" />
              </button>
              <button
                onClick={handleLike}
                className="w-16 h-16 rounded-full gradient-primary shadow-lg shadow-pink-300 flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
              >
                <Heart size={32} className="text-white" fill="white" />
              </button>
              <button
                onClick={handlePass}
                className="w-14 h-14 rounded-full bg-white card-shadow flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
              >
                <Star size={26} className="text-yellow-400" />
              </button>
            </div>
          </div>
        ) : isOutOfCards ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-24 h-24 rounded-full bg-pink-50 flex items-center justify-center mb-4">
              <MapPin size={40} className="text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">没有更多了</h3>
            <p className="text-gray-400 mt-1">扩大搜索范围或稍后再来看看</p>
            <Button variant="outline" className="mt-6" onClick={() => fetchDiscover()}>
              刷新
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <p className="text-gray-400">暂时没有可推荐的人了</p>
          </div>
        )}
      </div>

      {/* Mobile spacing */}
      <div className="h-24" />
    </AppLayout>
  );
}
