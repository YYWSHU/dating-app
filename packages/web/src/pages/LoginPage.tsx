import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../stores/auth.store';

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setServerError('');
      await login(data);
      navigate('/discover');
    } catch (err: any) {
      setServerError(err.response?.data?.error || '登录失败，请重试');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-pink-50 to-white">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary shadow-lg shadow-pink-200 mb-4">
            <Heart className="text-white" size={36} fill="white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">遇见</h1>
          <p className="text-gray-500 mt-2">遇见心动的那个TA</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="邮箱"
            type="email"
            placeholder="your@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="密码"
            type="password"
            placeholder="输入密码"
            error={errors.password?.message}
            {...register('password')}
          />

          {serverError && (
            <div className="text-sm text-red-500 text-center bg-red-50 rounded-lg py-2">
              {serverError}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? '登录中...' : '登录'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          还没有账号？{' '}
          <Link to="/auth/register" className="text-pink-600 font-medium hover:underline">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}
