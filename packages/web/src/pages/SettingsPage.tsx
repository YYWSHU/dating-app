import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import * as userApi from '../api/user.api';
import * as authApi from '../api/auth.api';
import { useAuthStore } from '../stores/auth.store';
import { ArrowLeft, MapPin, Users, Eye, EyeOff, Shield, Crown, LogOut, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [settings, setSettings] = useState({
    maxDistance: 50,
    minAge: 18,
    maxAge: 60,
  });
  const [showProfile, setShowProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await userApi.getMe();
        setSettings({ maxDistance: me.maxDistance, minAge: me.minAge, maxAge: me.maxAge });
      } catch {}
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userApi.updateMe(settings as any);
      toast('success', '设置已保存');
    } catch { toast('error', '保存失败'); }
    setSaving(false);
  };

  const handleLogout = async () => {
    const rt = localStorage.getItem('refreshToken');
    try { if (rt) await authApi.logout(rt); } catch {}
    logout();
    navigate('/auth/login');
  };

  return (
    <AppLayout hideNav>
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={22} className="text-gray-700" /></button>
          <span className="font-semibold text-gray-900">设置</span>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Discovery settings */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">🔍 发现设置</h2>
          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700">最大距离</span>
                <span className="text-sm font-bold text-pink-600">{settings.maxDistance} km</span>
              </div>
              <input type="range" min="1" max="500" value={settings.maxDistance}
                onChange={(e) => setSettings((s) => ({ ...s, maxDistance: parseInt(e.target.value) }))}
                className="w-full accent-pink-500" />
              <div className="flex justify-between text-[10px] text-gray-400"><span>1 km</span><span>500 km</span></div>
            </div>
            <div className="p-4 border-b border-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">年龄范围</span>
                <span className="text-sm font-bold text-pink-600">{settings.minAge} - {settings.maxAge} 岁</span>
              </div>
              <div className="flex gap-4 mt-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-400">最小</label>
                  <input type="number" min={18} max={100} value={settings.minAge}
                    onChange={(e) => setSettings((s) => ({ ...s, minAge: parseInt(e.target.value) }))}
                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm mt-1" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400">最大</label>
                  <input type="number" min={18} max={100} value={settings.maxAge}
                    onChange={(e) => setSettings((s) => ({ ...s, maxAge: parseInt(e.target.value) }))}
                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm mt-1" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <Button onClick={handleSave} disabled={saving} className="w-full" size="sm">
                {saving ? '保存中...' : '保存设置'}
              </Button>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">🔒 隐私</h2>
          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            <button onClick={() => setShowProfile(!showProfile)}
              className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                {showProfile ? <Eye size={18} className="text-pink-500" /> : <EyeOff size={18} className="text-gray-400" />}
                <span className="text-sm text-gray-700">展示在发现列表中</span>
              </div>
              <div className={cn('w-10 h-6 rounded-full transition-colors', showProfile ? 'bg-pink-500' : 'bg-gray-300')}>
                <div className={cn('w-5 h-5 rounded-full bg-white shadow transition-transform mt-0.5', showProfile ? 'translate-x-4 ml-0.5' : 'translate-x-0.5')} />
              </div>
            </button>
            <button onClick={() => navigate('/profile')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-gray-500" />
                <span className="text-sm text-gray-700">管理屏蔽列表</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>
        </section>

        {/* VIP */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">👑 VIP 会员</h2>
          <div className="bg-gradient-to-r from-yellow-50 to-pink-50 rounded-2xl card-shadow p-6 text-center">
            <div className="text-4xl mb-3">👑</div>
            <h3 className="font-bold text-gray-900">升级为 VIP</h3>
            <p className="text-sm text-gray-500 mt-1">无限 Like • 无限 Super Like • 查看谁喜欢你 • 隐身模式 • 优先展示</p>
            <Button className="mt-4 w-full">¥9.9/月 开通 VIP</Button>
          </div>
        </section>

        {/* Account */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">💼 账户</h2>
          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-4 text-red-500 hover:bg-red-50 transition-colors">
              <LogOut size={18} /><span className="text-sm font-medium">退出登录</span>
            </button>
          </div>
        </section>

        <div className="text-center text-xs text-gray-400 pb-8">
          遇见 Dating App v1.0.0
        </div>
      </div>
    </AppLayout>
  );
}
