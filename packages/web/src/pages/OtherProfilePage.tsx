import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { toast } from '../components/ui/Toast';
import * as userApi from '../api/user.api';
import * as matchApi from '../api/match.api';
import { ArrowLeft, ShieldOff, AlertTriangle, Star, Heart, X, MapPin, UserX } from 'lucide-react';
import { calculateAge } from '../lib/utils';

export function OtherProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('inappropriate');
  const [reportDetail, setReportDetail] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [showBlock, setShowBlock] = useState(false);

  useEffect(() => {
    if (userId) loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const data = await userApi.getUserById(userId!);
      setProfile(data);
    } catch { toast('error', '加载用户资料失败'); }
    setLoading(false);
  };

  const handleBlock = async () => {
    try {
      await matchApi.blockUser(userId!);
      toast('success', '已屏蔽该用户');
      navigate(-1);
    } catch { toast('error', '操作失败'); }
  };

  const handleReport = async () => {
    try {
      await matchApi.reportUser(userId!, reportReason, reportDetail || undefined);
      toast('success', '举报已提交');
      setShowReport(false);
    } catch { toast('error', '举报失败'); }
  };

  const handleRate = async (score: number) => {
    try {
      await matchApi.rateUser(userId!, score);
      toast('success', '评分已提交');
      setShowRating(false);
    } catch { toast('error', '评分失败'); }
  };

  if (loading) {
    return <AppLayout><div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" /></div></AppLayout>;
  }

  if (!profile) {
    return <AppLayout><EmptyState title="用户不存在" description="该用户可能已注销" /></AppLayout>;
  }

  return (
    <AppLayout hideNav>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={22} className="text-gray-700" /></button>
          <span className="font-semibold text-gray-900">{profile.nickname}</span>
          <div className="w-8" />
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Profile header */}
        <div className="flex flex-col items-center mb-6">
          <Avatar src={profile.avatarUrl} size="xl" />
          <h1 className="text-xl font-bold mt-3">{profile.nickname}, {calculateAge(profile.birthDate)}</h1>
          {profile.distanceKm && (
            <p className="text-sm text-gray-400 flex items-center gap-1 mt-1"><MapPin size={14} />{Math.round(profile.distanceKm)} km away</p>
          )}
          {profile.isMatched && <p className="text-sm text-pink-500 mt-1">💕 已匹配</p>}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="bg-white rounded-2xl p-4 card-shadow mb-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">简介</h3>
            <p className="text-gray-700 text-sm">{profile.bio}</p>
          </div>
        )}

        {/* Tags */}
        {profile.tags?.length > 0 && (
          <div className="bg-white rounded-2xl p-4 card-shadow mb-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">兴趣</h3>
            <div className="flex flex-wrap gap-2">
              {profile.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-medium">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* MBTI */}
        {profile.mbti && (
          <div className="bg-white rounded-2xl p-4 card-shadow mb-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">人格类型</h3>
            <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm font-medium">{profile.mbti}</span>
            {profile.bigFive && <span className="ml-2 text-xs text-gray-400">已填写五维度问卷</span>}
          </div>
        )}

        {/* Photos */}
        {profile.photos?.length > 0 && (
          <div className="bg-white rounded-2xl p-4 card-shadow mb-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">照片</h3>
            <div className="grid grid-cols-3 gap-2">
              {profile.photos.map((p: any) => (
                <img key={p.id} src={p.url} alt="" className="aspect-square rounded-xl object-cover bg-gray-100" />
              ))}
            </div>
          </div>
        )}

        {/* Rating */}
        {profile.isMatched && (
          <div className="bg-white rounded-2xl p-4 card-shadow mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-500">评分</h3>
              <button onClick={() => setShowRating(!showRating)} className="text-pink-500 text-sm">评分</button>
            </div>
            {showRating && (
              <div className="flex gap-1 mt-2 justify-center">
                {[1,2,3,4,5].map((s) => (
                  <button key={s} onClick={() => handleRate(s)} className={`text-2xl ${s <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    onMouseEnter={() => setRating(s)} onMouseLeave={() => setRating(0)}>★</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button onClick={() => setShowBlock(!showBlock)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl card-shadow text-sm text-red-500">
            <ShieldOff size={18} /> {showBlock ? '确认屏蔽？点击再次确认' : '屏蔽此用户'}
          </button>
          {showBlock && (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowBlock(false)}>取消</Button>
              <Button variant="destructive" className="flex-1" onClick={handleBlock}><UserX size={16} className="mr-1" />确认屏蔽</Button>
            </div>
          )}

          <button onClick={() => setShowReport(!showReport)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl card-shadow text-sm text-orange-500">
            <AlertTriangle size={18} /> 举报此用户
          </button>
          {showReport && (
            <div className="bg-white rounded-xl p-4 card-shadow space-y-3">
              <select value={reportReason} onChange={(e) => setReportReason(e.target.value)}
                className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm bg-white">
                <option value="inappropriate">不适内容</option>
                <option value="fake">虚假账号</option>
                <option value="spam">垃圾信息</option>
                <option value="harassment">骚扰行为</option>
                <option value="other">其他</option>
              </select>
              <textarea value={reportDetail} onChange={(e) => setReportDetail(e.target.value)} placeholder="补充说明（选填）" rows={2} maxLength={1000}
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-500" />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowReport(false)}>取消</Button>
                <Button className="flex-1" onClick={handleReport}>提交举报</Button>
              </div>
            </div>
          )}
        </div>
        <div className="h-8" />
      </div>
    </AppLayout>
  );
}
