import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { AppLayout } from '../components/layout/AppLayout';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { Card, CardContent } from '../components/ui/Card';
import { useGeolocation } from '../hooks/useGeolocation';
import * as userApi from '../api/user.api';
import * as authApi from '../api/auth.api';
import { Camera, MapPin, Settings, LogOut, Plus, X, Sparkles, Shield, AlertTriangle, CheckCircle2, Mail, Star } from 'lucide-react';
import { cn, calculateAge } from '../lib/utils';
import type { User } from '../types';

const MBTI_TYPES = ['INTJ','INTP','INFJ','INFP','ENTJ','ENTP','ENFJ','ENFP','ISTJ','ISFJ','ISTP','ISFP','ESTJ','ESFJ','ESTP','ESFP'];

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [tags, setTags] = useState('');
  const [mbti, setMbti] = useState('');
  const [bigFive, setBigFive] = useState({ openness: 0.5, conscientiousness: 0.5, extraversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 });
  const [saving, setSaving] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { latitude, longitude, requestLocation, loading: locationLoading } = useGeolocation();

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const data = await userApi.getMe();
      setProfile(data); setNickname(data.nickname); setBio(data.bio || '');
      setTags(data.tags?.join(', ') || '');
      setMbti(data.mbti || '');
      if (data.bigFive) setBigFive(data.bigFive);
    } catch { /* silent */ }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: any = { nickname, bio, tags: tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (mbti) updates.mbti = mbti;
      if (bigFive) updates.bigFive = bigFive;
      const updated = await userApi.updateMe(updates);
      setProfile(updated); setEditing(false); setShowQuestionnaire(false);
    } catch { /* silent */ }
    setSaving(false);
  };

  const handleVerifyEmail = async () => {
    setVerifyingEmail(true);
    try { await authApi.verifyEmail(verifyCode); await loadProfile(); } catch { /* silent */ }
    setVerifyingEmail(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { await userApi.uploadPhoto(file); await loadProfile(); } catch { /* silent */ }
    e.target.value = '';
  };

  const handlePhotoDelete = async (photoId: string) => {
    try { await userApi.deletePhoto(photoId); await loadProfile(); } catch { /* silent */ }
  };

  const handleLogout = async () => {
    const rt = localStorage.getItem('refreshToken');
    try { if (rt) await authApi.logout(rt); } catch { /* silent */ }
    logout();
  };

  if (!profile) {
    return <AppLayout><div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">我的</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setEditing(!editing)} className="px-4 py-2 rounded-full bg-pink-50 text-pink-600 text-sm font-medium">
              {editing ? '完成' : '编辑'}
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="mb-4">
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Avatar src={profile.avatarUrl} size="xl" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">{profile.nickname}, {calculateAge(profile.birthDate)}</h2>
                  {profile.campusEmail && <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-[10px] font-medium">🎓 校园认证</span>}
                  {profile.isVip && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-600 rounded-full text-[10px] font-medium">👑 VIP</span>}
                </div>
                {latitude && longitude && <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin size={14} />位置已共享</p>}
              </div>
            </div>

            {/* Email verification status */}
            {!profile.emailVerified && (
              <div className="bg-yellow-50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 text-sm font-medium text-yellow-700 mb-2">
                  <Mail size={16} /> 邮箱未验证
                </div>
                <div className="flex gap-2">
                  <Input placeholder="验证码" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} className="flex-1" />
                  <Button size="sm" onClick={handleVerifyEmail} disabled={verifyingEmail}>{verifyingEmail ? '...' : '验证'}</Button>
                </div>
                <button onClick={async () => { try { await authApi.resendVerification(); } catch {} }} className="text-xs text-pink-500 mt-2">重新发送验证码</button>
              </div>
            )}
            {profile.emailVerified && (
              <div className="flex items-center gap-2 text-sm text-green-600 mb-4">
                <CheckCircle2 size={16} /> 邮箱已验证
              </div>
            )}

            {/* Photos */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">照片 ({profile.photos.length}/6)</h3>
              <div className="grid grid-cols-3 gap-2">
                {profile.photos.map((photo) => (
                  <div key={photo.id} className="aspect-square rounded-xl bg-gray-100 overflow-hidden relative group">
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    {editing && (
                      <button onClick={() => handlePhotoDelete(photo.id)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                        <X size={12} className="text-white" />
                      </button>
                    )}
                  </div>
                ))}
                {editing && profile.photos.length < 6 && (
                  <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-pink-400 transition-colors">
                    <Plus size={24} className="text-gray-400" />
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
          </CardContent>
        </Card>

        {/* Bio + Tags + MBTI + BigFive */}
        <Card className="mb-4">
          <CardContent>
            {editing ? (
              <div className="space-y-4">
                <Input label="昵称" value={nickname} onChange={(e) => setNickname(e.target.value)} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} rows={3}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none" />
                  <p className="text-xs text-gray-400 text-right">{bio.length}/500</p>
                </div>
                <Input label="兴趣标签（逗号分隔）" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="旅行, 摄影, 咖啡" />

                {/* MBTI */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MBTI 人格类型（可选）</label>
                  <select value={mbti} onChange={(e) => setMbti(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white">
                    <option value="">不设置</option>
                    {MBTI_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Big Five sliders */}
                <button type="button" onClick={() => setShowQuestionnaire(!showQuestionnaire)} className="flex items-center gap-2 text-sm text-pink-600 font-medium">
                  <Sparkles size={16} /> {showQuestionnaire ? '收起' : '展开'}人格问卷（Big Five 五维度）
                </button>
                {showQuestionnaire && (
                  <div className="space-y-3 bg-pink-50 rounded-xl p-4">
                    {[
                      { key: 'openness', label: '开放性 (Openness)', desc: '是否乐于尝试新事物' },
                      { key: 'conscientiousness', label: '尽责性 (Conscientiousness)', desc: '是否有条理和自律' },
                      { key: 'extraversion', label: '外向性 (Extraversion)', desc: '是否喜欢社交和热闹' },
                      { key: 'agreeableness', label: '宜人性 (Agreeableness)', desc: '是否友善和富有同情心' },
                      { key: 'neuroticism', label: '情绪稳定性 (Neuroticism)', desc: '是否容易焦虑或情绪波动' },
                    ].map(({ key, label, desc }) => (
                      <div key={key}>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{label}</span>
                          <span>{(bigFive as any)[key].toFixed(1)}</span>
                        </div>
                        <input type="range" min="0" max="1" step="0.1"
                          value={(bigFive as any)[key]}
                          onChange={(e) => setBigFive((prev) => ({ ...prev, [key]: parseFloat(e.target.value) }))}
                          className="w-full accent-pink-500" />
                        <p className="text-[10px] text-gray-400">{desc}</p>
                      </div>
                    ))}
                  </div>
                )}
                <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? '保存中...' : '保存'}</Button>
              </div>
            ) : (
              <div>
                {profile.bio ? <p className="text-gray-700 text-sm leading-relaxed">{profile.bio}</p> : <p className="text-gray-400 text-sm italic">还没有个人简介...</p>}
                {profile.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profile.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-medium">{tag}</span>
                    ))}
                  </div>
                )}
                {profile.mbti && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">MBTI: {profile.mbti}</span>
                    {profile.bigFive && <span className="text-xs text-gray-400">人格问卷已完成 ✅</span>}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-2 mb-4">
          <button onClick={requestLocation} disabled={locationLoading}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl card-shadow text-sm">
            <MapPin size={18} className="text-pink-500" />
            <span>{latitude ? '更新位置' : '共享位置以发现附近的人'}</span>
          </button>
          <button onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl card-shadow text-sm">
            <Settings size={18} className="text-gray-500" />
            <span>设置</span>
          </button>
          <button onClick={() => navigate('/questionnaire')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl card-shadow text-sm">
            <Sparkles size={18} className="text-purple-500" />
            <span>心理问卷</span>
          </button>
          <button onClick={() => navigate('/admin')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl card-shadow text-sm">
            <Shield size={18} className="text-purple-500" />
            <span>管理后台</span>
          </button>
        </div>

        {/* Logout */}
        <div className="mb-4">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl card-shadow text-sm text-red-500">
            <LogOut size={18} /><span>退出登录</span>
          </button>
        </div>

        <div className="h-4" />
      </div>
    </AppLayout>
  );
}
