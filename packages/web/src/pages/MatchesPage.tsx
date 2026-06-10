import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMatchStore } from '../stores/match.store';
import { AppLayout } from '../components/layout/AppLayout';
import { Avatar } from '../components/ui/Avatar';
import { Heart, MessageCircle } from 'lucide-react';
import { formatTime } from '../lib/utils';

export function MatchesPage() {
  const { matches, isLoadingMatches, fetchMatches } = useMatchStore();

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <AppLayout>
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">匹配</h1>

        {isLoadingMatches ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" />
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center mb-4">
              <Heart size={32} className="text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">还没有匹配</h3>
            <p className="text-gray-400 mt-1">
              去发现页面找到心动的TA
            </p>
            <Link
              to="/discover"
              className="mt-4 px-6 py-2 gradient-primary text-white rounded-full text-sm font-medium"
            >
              去发现
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <Link
                key={match.matchId}
                to={`/chat/${match.matchId}`}
                className="flex items-center gap-3 p-4 bg-white rounded-2xl card-shadow hover:shadow-md transition-shadow"
              >
                <Avatar
                  src={match.user.avatarUrl || match.user.photos?.[0]?.url}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{match.user.nickname}</h3>
                  {match.lastMessage ? (
                    <p className="text-sm text-gray-500 truncate">
                      {match.lastMessage.isMine ? '你: ' : ''}
                      {match.lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-sm text-pink-500">你们互相喜欢了！开始聊天吧 💕</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {match.lastMessage && (
                    <span className="text-xs text-gray-400">
                      {formatTime(match.lastMessage.createdAt)}
                    </span>
                  )}
                  <MessageCircle size={18} className="text-pink-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
