import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Check, X } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../stores/auth.store';
import { cn } from '../lib/utils';

const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(8, '密码至少8位').regex(/[a-z]/, '需要小写字母').regex(/[A-Z]/, '需要大写字母').regex(/[0-9]/, '需要数字'),
  confirmPassword: z.string(),
  nickname: z.string().min(1, '请输入昵称').max(50),
  gender: z.enum(['male', 'female', 'other']),
  interestedIn: z.enum(['male', 'female', 'both']),
  birthDate: z.string().refine((d) => !isNaN(Date.parse(d)), '请选择出生日期'),
}).refine((d) => d.password === d.confirmPassword, { message: '两次密码不一致', path: ['confirmPassword'] });

type RegisterForm = z.infer<typeof registerSchema>;

const pwdChecks = [
  { key: 'min', label: '至少 8 位', test: (p: string) => p.length >= 8 },
  { key: 'lower', label: '包含小写字母', test: (p: string) => /[a-z]/.test(p) },
  { key: 'upper', label: '包含大写字母', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'digit', label: '包含数字', test: (p: string) => /[0-9]/.test(p) },
];

function PasswordStrength({ password }: { password: string }) {
  const passed = pwdChecks.filter((c) => c.test(password)).length;
  const pct = (passed / 4) * 100;
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1,2,3,4].map((i) => (
          <div key={i} className={cn('h-1 flex-1 rounded-full transition-colors', i <= passed ? (passed <= 2 ? 'bg-red-400' : passed === 3 ? 'bg-yellow-400' : 'bg-green-400') : 'bg-gray-200')} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-2">
        {pwdChecks.map((c) => (
          <div key={c.key} className="flex items-center gap-1 text-xs">
            {c.test(password) ? <Check size={10} className="text-green-500" /> : <X size={10} className="text-gray-300" />}
            <span className={c.test(password) ? 'text-green-600' : 'text-gray-400'}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const registerUser = useAuthStore((s) => s.register);
  const [serverError, setServerError] = useState('');
  const [password, setPassword] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { gender: 'male', interestedIn: 'female' },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setServerError('');
      const { confirmPassword, ...input } = data;
      await registerUser(input);
      navigate('/discover');
    } catch (err: any) {
      setServerError(err.response?.data?.error || '注册失败');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-gradient-to-b from-pink-50 to-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary shadow-lg shadow-pink-200 mb-3">
            <Heart className="text-white" size={28} fill="white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">创建账号</h1>
          <p className="text-gray-500 text-sm mt-1">开启你的缘分之旅</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input label="邮箱" type="email" placeholder="your@email.com" error={errors.email?.message} {...register('email')} />
          <div>
            <Input label="密码" type="password" placeholder="至少8位，含大小写字母和数字"
              error={errors.password?.message}
              {...register('password', { onChange: (e) => setPassword(e.target.value) })} />
            {password && <PasswordStrength password={password} />}
          </div>
          <Input label="确认密码" type="password" placeholder="再次输入密码" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
          <Input label="昵称" placeholder="你想被怎么称呼？" error={errors.nickname?.message} {...register('nickname')} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
            <select className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white" {...register('gender')}>
              <option value="male">男</option><option value="female">女</option><option value="other">其他</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">对谁感兴趣</label>
            <select className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white" {...register('interestedIn')}>
              <option value="male">男性</option><option value="female">女性</option><option value="both">不限</option>
            </select>
          </div>
          <Input label="出生日期" type="date" error={errors.birthDate?.message} {...register('birthDate')} />
          {serverError && <div className="text-sm text-red-500 text-center bg-red-50 rounded-lg py-2">{serverError}</div>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? '注册中...' : '注册'}</Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          已有账号？<Link to="/auth/login" className="text-pink-600 font-medium hover:underline">立即登录</Link>
        </p>
      </div>
    </div>
  );
}
