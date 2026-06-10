import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMatchStore } from '../stores/match.store';
import { AppLayout } from '../components/layout/AppLayout';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { Heart, MessageCircle, Calendar } from 'lucide-react';
import { formatTime } from '../lib/utils';

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (86400000));
}

export function MatchesPage() {
  const { matches, isLoadingMatches, fetchMatches } = useMatchStore();

  useEffect(() => { fetchMatches(); }, []);

  return (
    <AppLayout>
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">匹配</h1>

        {isLoadingMatches ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" /></div>
        ) : matches.length === 0 ? (
          <EmptyState
            icon={<Heart size={48} />}
            title="还没有匹配"
            description="去发现页面找到心动的TA"
            action={<Link to="/discover" className="px-6 py-2 gradient-primary text-white rounded-full text-sm font-medium inline-block">去发现</Link>}
          />
        ) : (
          <div className="space-y-3">
            {matches.map((match) => {
              const days = match.matchDate ? daysSince(match.matchDate as any) : daysSince(match.createdAt);
              return (
                <Link key={match.matchId} to={`/chat/${match.matchId}`}
                  className="flex items-center gap-3 p-4 bg-white rounded-2xl card-shadow hover:shadow-md transition-shadow">
                  <Avatar src={match.user.avatarUrl || match.user.photos?.[0]?.url} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm">{match.user.nickname}</h3>
                      <span className="flex items-center gap-1 text-[10px] text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded-full">
                        <Calendar size={10} /> 已匹配 {days} 天
                      </span>
                    </div>
                    {match.lastMessage ? (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {match.lastMessage.isMine ? '你: ' : ''}{match.lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-xs text-pink-500 mt-0.5">你们互相喜欢了！开始聊天吧 💕</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {match.lastMessage && <span className="text-[10px] text-gray-400">{formatTime(match.lastMessage.createdAt)}</span>}
                    <MessageCircle size={16} className="text-pink-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
