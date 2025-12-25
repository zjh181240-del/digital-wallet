import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Card, Button } from '../App';
import * as authApi from '@/services/auth';
import zxcvbn from 'zxcvbn';

interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
}

const Register: React.FC = () => {
  const { register: authRegister } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>();
  const password = watch('password');

  // 监听密码变化，更新密码强度
  React.useEffect(() => {
    if (password) {
      const result = zxcvbn(password);
      setPasswordStrength(result.score);
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  // 获取密码强度文本
  const getPasswordStrengthText = (score: number): string => {
    const strengthTexts = [
      '非常弱',
      '弱',
      '一般',
      '强',
      '非常强'
    ];
    return strengthTexts[score];
  };

  // 获取密码强度颜色
  const getPasswordStrengthColor = (score: number): string => {
    const strengthColors = [
      'bg-red-100 text-red-600',
      'bg-orange-100 text-orange-600',
      'bg-yellow-100 text-yellow-600',
      'bg-green-100 text-green-600',
      'bg-blue-100 text-blue-600'
    ];
    return strengthColors[score];
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // 调用真实注册API
      const response = await authApi.register({
        username: data.username,
        password: data.password,
        email: data.email
      });
      // 注册成功，保存用户信息
      authRegister({
        id: '1',
        username: data.username,
        email: data.email,
        name: data.username
      });

      // 导航到首页
      navigate('/');

    } catch (err: any) {
      setError(err.message || '注册失败，请检查网络连接');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl rotate-12 mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h6a2 2 0 012 2v2M7 11l5 5m0 0l5-5m-5 5V3" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter">EVM LIGHT</h1>
          <p className="text-gray-500 text-sm">钱包Demo</p>
        </div>

        <Card className="border-2 border-blue-50 shadow-2xl">
          <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">创建账户</h2>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 mb-6 text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                用户名
              </label>
              <input
                type="text"
                className={`w-full p-4 bg-gray-50 border-2 rounded-xl focus:outline-none font-medium transition-all ${errors.username ? 'border-red-500 focus:border-red-600' : 'border-gray-100 focus:border-blue-600 focus:bg-white'}`}
                placeholder="your-username"
                {...register('username', {
                  required: '用户名不能为空',
                  minLength: {
                    value: 3,
                    message: '用户名长度不能少于3位'
                  }
                })}
              />
              {errors.username && (
                <p className="text-red-600 text-xs mt-2 font-bold">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                邮箱地址
              </label>
              <input
                type="email"
                className={`w-full p-4 bg-gray-50 border-2 rounded-xl focus:outline-none font-medium transition-all ${errors.email ? 'border-red-500 focus:border-red-600' : 'border-gray-100 focus:border-blue-600 focus:bg-white'}`}
                placeholder="your@email.com"
                {...register('email', {
                  required: '邮箱不能为空',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: '请输入有效的邮箱地址'
                  }
                })}
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-2 font-bold">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                密码
              </label>
              <input
                type="password"
                className={`w-full p-4 bg-gray-50 border-2 rounded-xl focus:outline-none font-medium transition-all ${errors.password ? 'border-red-500 focus:border-red-600' : 'border-gray-100 focus:border-blue-600 focus:bg-white'}`}
                placeholder="••••••••"
                {...register('password', {
                  required: '密码不能为空',
                  minLength: {
                    value: 6,
                    message: '密码长度不能少于6位'
                  }
                })}
              />
              {errors.password && (
                <p className="text-red-600 text-xs mt-2 font-bold">{errors.password.message}</p>
              )}

              {/* 密码强度指示器 */}
              {password && (
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">密码强度：</span>
                    <span className={`text-xs font-bold ${getPasswordStrengthColor(passwordStrength)} px-2 py-0.5 rounded-full`}>
                      {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                      style={{ width: `${passwordStrength * 25}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                确认密码
              </label>
              <input
                type="password"
                className={`w-full p-4 bg-gray-50 border-2 rounded-xl focus:outline-none font-medium transition-all ${errors.confirmPassword ? 'border-red-500 focus:border-red-600' : 'border-gray-100 focus:border-blue-600 focus:bg-white'}`}
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: '请再次输入密码',
                  validate: (value) => value === password || '两次输入的密码不一致'
                })}
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-xs mt-2 font-bold">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full py-5 text-lg"
              disabled={isLoading}
            >
              {isLoading ? '注册中...' : '立即注册'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              已有账户？ <Link to="/login" className="text-blue-600 font-black hover:underline">立即登录</Link>
            </p>
          </div>
        </Card>

        <div className="mt-12 text-[10px] text-amber-600 bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center leading-relaxed">
          <strong>免责声明：</strong> 此应用仅供演示使用。数据在沙盒环境中通过 UI 交互管理，未加密存储于浏览器。严禁存储高额真实资产。
        </div>
      </div>
    </div>
  );
};

export default Register;
