import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { toast } from '../components/ui/Toast';
import { apiClient } from '../api/client';
import { ArrowLeft, Users, Heart, MessageCircle, AlertTriangle, Activity, Shield, Trash2, Search, X, Check } from 'lucide-react';

export function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'dashboard' | 'users' | 'reports'>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any>({ users: [], total: 0 });
  const [reports, setReports] = useState<any>({ reports: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const { data } = await apiClient.get('/admin/stats');
      setStats(data);
    } catch { navigate('/discover'); }
    setLoading(false);
  };

  const fetchUsers = async (p = 1) => {
    setLoading(true);
    const { data } = await apiClient.get('/admin/users', { params: { page: p, limit: 20, search: search || undefined } });
    setUsers(data); setPage(p); setLoading(false);
  };

  const fetchReports = async (p = 1) => {
    setLoading(true);
    const { data } = await apiClient.get('/admin/reports', { params: { page: p } });
    setReports(data); setPage(p); setLoading(false);
  };

  const handleToggleAdmin = async (userId: string) => {
    try {
      await apiClient.put(`/admin/users/${userId}/toggle-admin`);
      fetchUsers(page);
    } catch { toast('error', '操作失败'); }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('确定删除此用户？此操作不可撤销。')) return;
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      toast('success', '用户已删除');
      fetchUsers(page);
    } catch { toast('error', '删除失败'); }
  };

  const handleResolveReport = async (reportId: string, status: string) => {
    try {
      await apiClient.put(`/admin/reports/${reportId}`, { status });
      toast('success', `举报已${status === 'resolved' ? '处理' : '忽略'}`);
      fetchReports(page);
    } catch { toast('error', '操作失败'); }
  };

  const StatCard = ({ icon, label, value, color }: any) => (
    <div className="bg-white rounded-xl p-4 card-shadow">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value ?? '-'}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );

  if (loading && !stats) return <AppLayout><div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" /></div></AppLayout>;

  return (
    <AppLayout hideNav>
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={22} className="text-gray-700" /></button>
          <span className="font-semibold text-gray-900">管理后台</span>
        </div>
        <div className="flex border-b border-gray-100 px-4">
          {[
            { key: 'dashboard', label: '仪表盘' },
            { key: 'users', label: '用户管理' },
            { key: 'reports', label: `举报审核${stats?.pendingReports ? ` (${stats.pendingReports})` : ''}` },
          ].map((t) => (
            <button key={t.key} onClick={() => { setTab(t.key as any); if (t.key === 'users') fetchUsers(); if (t.key === 'reports') fetchReports(); }}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Dashboard Tab */}
        {tab === 'dashboard' && stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={<Users size={18} className="text-blue-600" />} label="总用户" value={stats.totalUsers} color="bg-blue-100" />
              <StatCard icon={<Activity size={18} className="text-green-600" />} label="今日活跃" value={stats.onlineToday} color="bg-green-100" />
              <StatCard icon={<Heart size={18} className="text-pink-600" />} label="总匹配" value={stats.totalMatches} color="bg-pink-100" />
              <StatCard icon={<MessageCircle size={18} className="text-purple-600" />} label="总消息" value={stats.totalMessages} color="bg-purple-100" />
            </div>

            <div className="bg-white rounded-xl p-4 card-shadow">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">性别分布</h3>
              <div className="flex gap-2">
                {Object.entries(stats.genderDistribution || {}).map(([k, v]: any) => (
                  <div key={k} className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-gray-900">{v}</p>
                    <p className="text-xs text-gray-500">{k === 'male' ? '男' : k === 'female' ? '女' : '其他'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 card-shadow">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">城市分布</h3>
              <div className="space-y-2">
                {(stats.cityDistribution || []).map((c: any) => (
                  <div key={c.city} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{c.city}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500 rounded-full" style={{ width: `${(c.count / stats.totalUsers) * 100}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-6">{c.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4 card-shadow">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">待处理举报: {stats.pendingReports} 条</span>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="搜索用户邮箱或昵称..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
              <Button size="sm" onClick={() => fetchUsers(1)}><Search size={14} /></Button>
            </div>
            <p className="text-xs text-gray-400">共 {users.total} 个用户</p>
            <div className="space-y-2">
              {users.users.map((u: any) => (
                <div key={u.id} className="bg-white rounded-xl p-3 card-shadow flex items-center gap-3">
                  <Avatar size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{u.nickname}</span>
                      {u.admin && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded text-[10px] font-medium">管理员</span>}
                      {u.isVip && <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-600 rounded text-[10px] font-medium">VIP</span>}
                    </div>
                    <p className="text-xs text-gray-400">{u.email} · {u.gender} · {u.emailVerified ? '已验证' : '未验证'}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleToggleAdmin(u.id)} className="px-2 py-1 text-[10px] rounded bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-600">
                      {u.admin ? '取消管理' : '设为管理'}
                    </button>
                    <button onClick={() => handleDeleteUser(u.id)} className="px-2 py-1 text-[10px] rounded bg-gray-100 text-red-500 hover:bg-red-50">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {users.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => fetchUsers(page - 1)}>上一页</Button>
                <span className="text-sm text-gray-500 self-center">{page}/{users.totalPages}</span>
                <Button size="sm" variant="outline" disabled={page >= users.totalPages} onClick={() => fetchUsers(page + 1)}>下一页</Button>
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {tab === 'reports' && (
          <div className="space-y-4">
            <p className="text-xs text-gray-400">共 {reports.total} 条举报</p>
            {reports.reports.map((r: any) => (
              <div key={r.id} className="bg-white rounded-xl p-4 card-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{r.reporter.nickname}</span>
                    <span className="text-xs text-gray-400">举报了</span>
                    <span className="text-sm font-medium text-gray-900">{r.reported.nickname}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    r.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {r.status === 'pending' ? '待处理' : r.status === 'resolved' ? '已处理' : '已忽略'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-600">{r.reason}</span>
                  {r.detail && <p className="text-xs text-gray-500">{r.detail}</p>}
                </div>
                {r.status === 'pending' && (
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={() => handleResolveReport(r.id, 'dismissed')}><X size={14} className="mr-1" />忽略</Button>
                    <Button size="sm" onClick={() => handleResolveReport(r.id, 'resolved')}><Check size={14} className="mr-1" />处理</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
