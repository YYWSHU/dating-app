import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { AppLayout } from '../components/layout/AppLayout';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import * as userApi from '../api/user.api';
import { useGeolocation } from '../hooks/useGeolocation';
import {
  Camera,
  MapPin,
  Settings,
  LogOut,
  Plus,
  X,
  GripVertical,
} from 'lucide-react';
import type { User } from '../types';
import { calculateAge } from '../lib/utils';

export function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { latitude, longitude, requestLocation, loading: locationLoading } = useGeolocation();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await userApi.getMe();
      setProfile(data);
      setNickname(data.nickname);
      setBio(data.bio || '');
    } catch {
      // Handle error
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await userApi.updateMe({ nickname, bio } as any);
      setProfile(updated);
      setEditing(false);
    } catch {
      // Handle error
    }
    setSaving(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await userApi.uploadPhoto(file);
      await loadProfile();
    } catch {
      // Handle error
    }
    e.target.value = '';
  };

  const handlePhotoDelete = async (photoId: string) => {
    try {
      await userApi.deletePhoto(photoId);
      await loadProfile();
    } catch {
      // Handle error
    }
  };

  if (!profile) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">我的</h1>
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 rounded-full bg-pink-50 text-pink-600 text-sm font-medium"
          >
            {editing ? '取消' : '编辑'}
          </button>
        </div>

        {/* Profile info */}
        <Card className="mb-6">
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Avatar src={profile.avatarUrl} size="xl" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {profile.nickname}, {calculateAge(profile.birthDate)}
                </h2>
                {latitude && longitude && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={14} />
                    位置已共享
                  </p>
                )}
              </div>
            </div>

            {/* Photos */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                照片 ({profile.photos.length}/6)
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {profile.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-xl bg-gray-100 overflow-hidden relative group"
                  >
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    {editing && (
                      <button
                        onClick={() => handlePhotoDelete(photo.id)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    )}
                  </div>
                ))}
                {editing && profile.photos.length < 6 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-pink-400 transition-colors"
                  >
                    <Plus size={24} className="text-gray-400" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bio + Tags (editable or view) */}
        <Card className="mb-6">
          <CardContent>
            {editing ? (
              <div className="space-y-4">
                <Input
                  label="昵称"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    个人简介
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={500}
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                  />
                  <p className="text-xs text-gray-400 text-right">{bio.length}/500</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? '保存中...' : '保存'}
                </Button>
              </div>
            ) : (
              <div>
                {profile.bio ? (
                  <p className="text-gray-700 text-sm leading-relaxed">{profile.bio}</p>
                ) : (
                  <p className="text-gray-400 text-sm italic">还没有个人简介...</p>
                )}
                {profile.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profile.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-2 mb-4">
          <button
            onClick={requestLocation}
            disabled={locationLoading}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl card-shadow text-sm"
          >
            <MapPin size={18} className="text-pink-500" />
            <span>{latitude ? '更新位置' : '共享位置以发现附近的人'}</span>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl card-shadow text-sm">
            <Settings size={18} className="text-gray-500" />
            <span>设置</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl card-shadow text-sm text-red-500"
          >
            <LogOut size={18} />
            <span>退出登录</span>
          </button>
        </div>

        <div className="h-4" />
      </div>
    </AppLayout>
  );
}
