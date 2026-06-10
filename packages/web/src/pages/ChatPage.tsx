import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatStore } from '../stores/chat.store';
import { useSocket } from '../hooks/useSocket';
import { useMatchStore } from '../stores/match.store';
import { AppLayout } from '../components/layout/AppLayout';
import { Avatar } from '../components/ui/Avatar';
import { toast } from '../components/ui/Toast';
import { ArrowLeft, Send, Image, Smile, Trash2 } from 'lucide-react';
import { formatTime } from '../lib/utils';

const QUICK_EMOJIS = ['😊','😂','❤️','😍','🥰','😘','🤗','😅','🙈','💕','🔥','✨','😎','🤔','👍','🎉','💋','😢'];

export function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { sendMessage: socketSendMessage, sendTyping, sendRead } = useSocket();
  const { messages, fetchMessages, setActiveMatch } = useChatStore();
  const { matches, fetchMatches } = useMatchStore();
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const matchedUser = matches.find((m) => m.matchId === matchId)?.user;

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

  const handleSend = (content?: string) => {
    const text = content || input.trim();
    if (!text || !matchId) return;
    socketSendMessage(matchId, text);
    setInput('');
    setShowEmoji(false);
  };

  const handleEmojiClick = (emoji: string) => {
    setInput((prev) => prev + emoji);
  };

  const handleImageSend = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !matchId) return;
    // For now, just show a toast - full image upload coming
    socketSendMessage(matchId, `[图片] ${file.name}`);
    e.target.value = '';
    toast('info', '图片功能即将上线，已发送文件名');
  };

  const handleRecall = (messageId: string) => {
    toast('info', '消息撤回功能开发中');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); handleSend();
    }
  };

  return (
    <AppLayout hideNav>
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={22} className="text-gray-700" /></button>
          <button onClick={() => matchedUser && navigate(`/profile/${matchedUser.id}`)} className="flex items-center gap-2 flex-1">
            <Avatar src={matchedUser?.avatarUrl || matchedUser?.photos?.[0]?.url} size="sm" />
            <span className="font-semibold text-gray-900 text-sm">{matchedUser?.nickname || '...'}</span>
          </button>
        </div>
        {typingUser && <div className="px-4 pb-2 text-xs text-pink-500 italic">{typingUser} 正在输入...</div>}
      </div>

      <div className="flex-1 px-4 py-4 space-y-4 min-h-[calc(100vh-8rem)]">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-4xl mb-3">💕</div>
            <p className="text-gray-400 text-sm">你们互相喜欢了！发送第一条消息吧</p>
          </div>
        )}

        {chatMessages.map((msg) => {
          const isMine = msg.senderId !== matchedUser?.id;
          const isRecalled = (msg as any).isRecalled;
          const msgType = (msg as any).type || 'text';
          const imageUrl = (msg as any).imageUrl;

          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}>
              {!isMine && <Avatar src={matchedUser?.avatarUrl} size="sm" className="mr-2 mt-auto flex-shrink-0" />}
              <div className={`max-w-[70%] ${isMine ? 'order-1' : ''}`}>
                {isRecalled ? (
                  <div className="px-4 py-2 rounded-2xl text-xs text-gray-400 italic bg-gray-50">此消息已被撤回</div>
                ) : msgType === 'image' && imageUrl ? (
                  <img src={imageUrl} alt="" className="max-w-full rounded-2xl max-h-60 object-cover" />
                ) : (
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    isMine ? 'gradient-primary text-white rounded-br-md' : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}>
                    {msg.content}
                  </div>
                )}
                <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end mr-1' : 'ml-1'}`}>
                  <span className="text-[10px] text-gray-400">{formatTime(msg.createdAt)}</span>
                  {isMine && msg.isRead && <span className="text-[10px] text-pink-400">已读</span>}
                  {isMine && !isRecalled && (
                    <button onClick={() => handleRecall(msg.id)} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                      <Trash2 size={10} className="text-gray-400 hover:text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji picker */}
      {showEmoji && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-1 bg-white rounded-xl p-2 card-shadow">
            {QUICK_EMOJIS.map((e) => (
              <button key={e} onClick={() => handleEmojiClick(e)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg text-lg">{e}</button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-3 py-2 safe-area-bottom">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowEmoji(!showEmoji)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <Smile size={20} className={showEmoji ? 'text-pink-500' : 'text-gray-400'} />
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <Image size={20} className="text-gray-400" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSend} />
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="输入消息..." className="flex-1 h-10 px-4 rounded-full bg-gray-100 border-none outline-none text-sm focus:ring-2 focus:ring-pink-500" />
          <button onClick={() => handleSend()} disabled={!input.trim()}
            className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center disabled:opacity-50 transition-all active:scale-90">
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
