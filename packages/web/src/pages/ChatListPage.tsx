import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMatchStore } from '../stores/match.store';
import { AppLayout } from '../components/layout/AppLayout';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { MessageCircle } from 'lucide-react';
import { formatTime } from '../lib/utils';

export function ChatListPage() {
  const { matches, isLoadingMatches, fetchMatches } = useMatchStore();

  useEffect(() => { fetchMatches(); }, []);

  const matchedWithMessages = matches.filter((m) => m.lastMessage);

  return (
    <AppLayout>
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">消息</h1>

        {isLoadingMatches ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" /></div>
        ) : matchedWithMessages.length === 0 ? (
          <EmptyState icon={<MessageCircle size={48} />} title="暂无消息" description="匹配成功后即可开始聊天" />
        ) : (
          <div className="space-y-1">
            {matchedWithMessages.map((match) => {
              const hasUnread = match.lastMessage && !match.lastMessage.isRead && !match.lastMessage.isMine;
              return (
                <Link key={match.matchId} to={`/chat/${match.matchId}`}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white transition-colors relative">
                  <div className="relative">
                    <Avatar src={match.user.avatarUrl || match.user.photos?.[0]?.url} size="lg" />
                    {hasUnread && <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-pink-500 border-2 border-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={cn(hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-900', 'text-sm')}>
                        {match.user.nickname}
                      </h3>
                      {match.lastMessage && (
                        <span className="text-[10px] text-gray-400">{formatTime(match.lastMessage.createdAt)}</span>
                      )}
                    </div>
                    {match.lastMessage && (
                      <p className={cn('text-xs mt-0.5 truncate', hasUnread ? 'text-gray-900 font-medium' : 'text-gray-500')}>
                        {match.lastMessage.isMine ? '你: ' : ''}{match.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {hasUnread && <div className="w-2 h-2 rounded-full bg-pink-500 flex-shrink-0" />}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function cn(...args: any[]) { return args.filter(Boolean).join(' '); }
