import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatStore } from '../stores/chat.store';
import { useSocket } from '../hooks/useSocket';
import { useMatchStore } from '../stores/match.store';
import { AppLayout } from '../components/layout/AppLayout';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Send } from 'lucide-react';
import { formatTime } from '../lib/utils';

export function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { sendMessage: socketSendMessage, sendTyping, sendRead } = useSocket();
  const { messages, fetchMessages, activeMatchId, setActiveMatch } = useChatStore();
  const { matches, fetchMatches } = useMatchStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const matchedUser = matches.find(
    (m) => m.matchId === matchId
  )?.user;

  useEffect(() => {
    if (matchId) {
      setActiveMatch(matchId);
      fetchMessages(matchId);
      fetchMatches();
    }
    return () => setActiveMatch(null);
  }, [matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages[matchId || '']]);

  const chatMessages = messages[matchId || ''] || [];

  const handleSend = () => {
    if (!input.trim() || !matchId) return;
    socketSendMessage(matchId, input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (matchId) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(matchId);
      }, 300);
    }
  };

  return (
    <AppLayout hideNav>
      {/* Chat header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1">
            <ArrowLeft size={22} className="text-gray-700" />
          </button>
          {matchedUser && (
            <>
              <Avatar src={matchedUser.avatarUrl || matchedUser.photos?.[0]?.url} size="sm" />
              <span className="font-semibold text-gray-900">{matchedUser.nickname}</span>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-4 space-y-4 min-h-[calc(100vh-8rem)]">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-gray-400 text-sm">
              你们互相喜欢了！发送第一条消息吧 💕
            </p>
          </div>
        )}

        {chatMessages.map((msg) => {
          const isMine = msg.senderId !== matchedUser?.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              {!isMine && (
                <Avatar
                  src={matchedUser?.avatarUrl}
                  size="sm"
                  className="mr-2 mt-auto flex-shrink-0"
                />
              )}
              <div className={`max-w-[75%] ${isMine ? 'order-1' : ''}`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm ${
                    isMine
                      ? 'gradient-primary text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
                <p className={`text-[10px] text-gray-400 mt-0.5 ${isMine ? 'text-right mr-1' : 'ml-1'}`}>
                  {formatTime(msg.createdAt)}
                  {isMine && msg.isRead && ' · 已读'}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 safe-area-bottom">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            className="flex-1 h-11 px-4 rounded-full bg-gray-100 border-none outline-none text-sm focus:ring-2 focus:ring-pink-500 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-90"
          >
            <Send size={18} className="text-white" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
