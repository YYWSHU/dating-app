import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMatchStore } from '../stores/match.store';
import { AppLayout } from '../components/layout/AppLayout';
import { Avatar } from '../components/ui/Avatar';
import { MessageCircle } from 'lucide-react';
import { formatTime } from '../lib/utils';

export function ChatListPage() {
  const { matches, isLoadingMatches, fetchMatches } = useMatchStore();

  useEffect(() => {
    fetchMatches();
  }, []);

  const matchedWithMessages = matches.filter((m) => m.lastMessage);

  return (
    <AppLayout>
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">消息</h1>

        {isLoadingMatches ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" />
          </div>
        ) : matchedWithMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center mb-4">
              <MessageCircle size={32} className="text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">暂无消息</h3>
            <p className="text-gray-400 mt-1">匹配成功后即可开始聊天</p>
          </div>
        ) : (
          <div className="space-y-1">
            {matchedWithMessages.map((match) => (
              <Link
                key={match.matchId}
                to={`/chat/${match.matchId}`}
                className="flex items-center gap-3 p-4 rounded-2xl hover:bg-white transition-colors"
              >
                <Avatar
                  src={match.user.avatarUrl || match.user.photos?.[0]?.url}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{match.user.nickname}</h3>
                    {match.lastMessage && (
                      <span className="text-xs text-gray-400">
                        {formatTime(match.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {match.lastMessage && (
                    <p
                      className={`text-sm mt-0.5 truncate ${
                        !match.lastMessage.isRead && !match.lastMessage.isMine
                          ? 'text-gray-900 font-medium'
                          : 'text-gray-500'
                      }`}
                    >
                      {match.lastMessage.isMine ? '你: ' : ''}
                      {match.lastMessage.content}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
