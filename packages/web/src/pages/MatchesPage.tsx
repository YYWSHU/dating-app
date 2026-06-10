import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMatchStore } from '../stores/match.store';
import { AppLayout } from '../components/layout/AppLayout';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Heart, MessageCircle, Calendar, Star, Eye, HeartHandshake, Sparkles } from 'lucide-react';
import { formatTime, calculateAge } from '../lib/utils';
import * as matchApi from '../api/match.api';

type Tab = 'matches' | 'likedMe' | 'iLiked';

export function MatchesPage() {
  const navigate = useNavigate();
  const { matches, isLoadingMatches, fetchMatches } = useMatchStore();
  const [tab, setTab] = useState<Tab>('matches');
  const [likedMe, setLikedMe] = useState<any[]>([]);
  const [iLiked, setILiked] = useState<any[]>([]);
  const [loadingLikes, setLoadingLikes] = useState(false);

  useEffect(() => { fetchMatches(); }, []);

  const loadLikes = async (type: 'likedMe' | 'iLiked') => {
    setLoadingLikes(true);
    try {
      if (type === 'likedMe') setLikedMe(await matchApi.whoLikedMe());
      else setILiked(await matchApi.whoILiked());
    } catch {}
    setLoadingLikes(false);
  };

  const daysSince = (d: string) => Math.floor((Date.now() - new Date(d).getTime()) / 86400000);

  const renderUserCard = (u: any, extra?: any) => (
    <div key={u.id} className="flex items-center gap-3 p-4 bg-white rounded-2xl card-shadow hover:shadow-md transition-shadow"
      onClick={() => navigate(`/profile/${u.id}`)}>
      <Avatar src={u.avatarUrl || u.photos?.[0]?.url} size="lg" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 text-sm">{u.nickname}</h3>
          <span className="text-xs text-gray-400">{u.age || calculateAge(u.birthDate)}岁</span>
          {extra?.likeType === 'superlike' && (
            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full text-[10px] font-medium flex items-center gap-0.5">
              <Star size={10} /> Super
            </span>
          )}
        </div>
        {u.bio && <p className="text-xs text-gray-500 truncate mt-0.5">{u.bio}</p>}
        <div className="flex flex-wrap gap-1 mt-1">
          {u.tags?.slice(0, 3).map((t: string) => (
            <span key={t} className="px-1.5 py-0.5 bg-pink-50 text-pink-500 rounded text-[10px]">{t}</span>
          ))}
        </div>
      </div>
      {extra?.isMatched ? (
        <Link to={`/chat/${extra.matchId || ''}`} className="px-3 py-1.5 gradient-primary text-white rounded-full text-xs font-medium" onClick={(e) => e.stopPropagation()}>
          发消息
        </Link>
      ) : tab === 'likedMe' ? (
        <button onClick={(e) => {
          e.stopPropagation();
          matchApi.likeUser(u.id).then(() => { loadLikes('likedMe'); fetchMatches(); });
        }} className="px-3 py-1.5 gradient-primary text-white rounded-full text-xs font-medium">
          回赞
        </button>
      ) : null}
    </div>
  );

  return (
    <AppLayout>
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">匹配</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-full p-1 mb-4">
          {[
            { key: 'matches' as Tab, label: '已匹配', icon: HeartHandshake },
            { key: 'likedMe' as Tab, label: '谁喜欢我', icon: Eye },
            { key: 'iLiked' as Tab, label: '我喜欢谁', icon: Heart },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => { setTab(key); if (key === 'likedMe') loadLikes('likedMe'); if (key === 'iLiked') loadLikes('iLiked'); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-medium transition-all ${
                tab === key ? 'bg-white shadow text-pink-600' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        {/* Matches Tab */}
        {tab === 'matches' && (
          isLoadingMatches ? (
            <div className="flex justify-center py-10"><div className="w-8 h-8 rounded-full border-3 border-pink-500 border-t-transparent animate-spin" /></div>
          ) : matches.length === 0 ? (
            <EmptyState icon={<Heart size={48} />} title="还没有匹配" description="去发现页面找到心动的TA"
              action={<Link to="/discover" className="px-6 py-2 gradient-primary text-white rounded-full text-sm font-medium inline-block">去发现</Link>} />
          ) : (
            <div className="space-y-2">
              {matches.map((match) => {
                const days = daysSince((match.matchDate as any) || match.createdAt);
                return (
                  <Link key={match.matchId} to={`/chat/${match.matchId}`}
                    className="flex items-center gap-3 p-3 bg-white rounded-2xl card-shadow hover:shadow-md transition-shadow">
                    <Avatar src={match.user.avatarUrl || match.user.photos?.[0]?.url} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm">{match.user.nickname}</h3>
                        {(match as any).isSuperLike && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full text-[10px] font-medium flex items-center gap-0.5">
                            <Star size={10} fill="currentColor" /> {(match as any).superLikedByOther ? 'TA Super了你' : '你 Super 了 TA'}
                          </span>
                        )}
                        <span className="text-[10px] text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded-full">已匹配 {days} 天</span>
                      </div>
                      {match.lastMessage ? (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{match.lastMessage.isMine ? '你: ' : ''}{match.lastMessage.content}</p>
                      ) : (
                        <p className="text-xs text-pink-500 mt-0.5">💕 开始聊天吧</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {match.lastMessage && <span className="text-[10px] text-gray-400">{formatTime(match.lastMessage.createdAt)}</span>}
                      <MessageCircle size={16} className="text-pink-400" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        )}

        {/* Liked Me / I Liked Tab */}
        {(tab === 'likedMe' || tab === 'iLiked') && (
          loadingLikes ? (
            <div className="flex justify-center py-10"><div className="w-8 h-8 rounded-full border-3 border-pink-500 border-t-transparent animate-spin" /></div>
          ) : (tab === 'likedMe' ? likedMe : iLiked).length === 0 ? (
            <EmptyState icon={tab === 'likedMe' ? <Eye size={48} /> : <Heart size={48} />}
              title={tab === 'likedMe' ? '还没有人喜欢你' : '你还没有喜欢任何人'}
              description={tab === 'likedMe' ? '去完善资料，让大家更容易发现你' : '去发现页面看看有没有心动的人'} />
          ) : (
            <div className="space-y-2">
              {(tab === 'likedMe' ? likedMe : iLiked).map((u) => renderUserCard(u, { likeType: u.likeType, isMatched: u.isMatched }))}
            </div>
          )
        )}
      </div>
    </AppLayout>
  );
}
