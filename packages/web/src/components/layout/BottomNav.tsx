import { NavLink } from 'react-router-dom';
import { Compass, MessageCircle, Heart, User } from 'lucide-react';

const navItems = [
  { to: '/discover', icon: Compass, label: '发现' },
  { to: '/matches', icon: Heart, label: '匹配' },
  { to: '/chat', icon: MessageCircle, label: '消息' },
  { to: '/profile', icon: User, label: '我' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1 transition-colors ${
                isActive ? 'text-pink-600' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            <Icon size={22} strokeWidth={2} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
