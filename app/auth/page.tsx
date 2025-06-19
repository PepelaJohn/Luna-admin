'use client'
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Shield, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loading } from '@/components/LoadingComponent';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'normal' | 'corporate' | 'admin';
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  status: number;
}

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const authParam = searchParams.get('auth');
  const {loading:userloading, isAuthenticated} = useAuth()
  
  const [isLogin, setIsLogin] = useState(authParam === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'normal'
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Function to update URL without page reload
  const updateURL = (authType: 'login' | 'register') => {
    const currentURL = new URL(window.location.href);
    currentURL.searchParams.set('auth', authType);
    
    // Use router.replace to update URL without page reload
    router.replace(currentURL.pathname + '?' + currentURL.searchParams.toString());
  };

  const handleSetLoginState = (state: 'login' | 'register') => {
    switch (state) {
      case 'login':
        setIsLogin(true);
        updateURL('login');
        break;
      case 'register':
        setIsLogin(false);
        updateURL('register');
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    // Set default auth parameter if none exists
    if (!authParam) {
      updateURL('register');
      setIsLogin(false);
    } else {
      // Update state based on URL parameter
      setIsLogin(authParam === 'login');
    }
  }, [authParam]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!isLogin && (formData.name.length < 2 || formData.name.length > 50)) {
      newErrors.name = 'Name must be between 2 and 50 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin && !formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage(null);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { 
            name: formData.name, 
            email: formData.email, 
            password: formData.password,
            role: 'normal' 
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        if (isLogin) {
          setMessage({ type: 'success', text: data.message || 'Login successful!' });
          // Redirect to dashboard or reload page
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
        } else {
          setMessage({ type: 'success', text: data.message || 'Registration successful!' });
          setShowVerification(true);
          setVerificationEmail(formData.email);
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Something went wrong' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    if (verificationCode.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter a valid 6-digit code' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: verificationEmail, 
          code: verificationCode 
        }),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Email verified successfully! You can now login.' });
        setTimeout(() => {
          setShowVerification(false);
          handleSetLoginState('login');
          setFormData({
            name: '',
            email: verificationEmail,
            password: '',
            confirmPassword: '',
            role: 'normal'
          });
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Verification failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/email/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail }),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Verification code sent!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to resend code' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    handleSetLoginState(isLogin ? 'register' : 'login');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'normal'
    });
    setErrors({});
    setMessage(null);
  };

  useEffect(()=>{
    if(isAuthenticated){
      router.replace('/dashboard')
    }
  },[isAuthenticated])

  if(userloading) return <Loading dark full></Loading>

  if (showVerification) {
    return VerificationComponent(verificationEmail, message, verificationCode, setVerificationCode, handleVerification, loading, resendVerification);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl flex backdrop-blur-sm">
        {/* Left side - Form */}
        <div className="w-full lg:w-1/2 p-8">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white font-bold text-2xl">L</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
                LUNA ADMIN
              </h1>
              <h2 className="text-xl font-semibold text-white">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-slate-400 mt-2">
                {isLogin 
                  ? 'Sign in to your account to continue' 
                  : 'Join us and start your journey today'
                }
              </p>
            </div>

            {/* Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 transform transition-all duration-300 ${
                message.type === 'success' 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name field (signup only) */}
              {!isLogin && (
                <div className="transform transition-all duration-300">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-white placeholder-slate-400 ${
                        errors.name ? 'border-red-500' : 'border-slate-600'
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                  )}
                </div>
              )}

              {/* Email field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-white placeholder-slate-400 ${
                      errors.email ? 'border-red-500' : 'border-slate-600'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className={`w-full pl-10 pr-12 py-3 bg-slate-700/50 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-white placeholder-slate-400 ${
                      errors.password ? 'border-red-500' : 'border-slate-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password field (signup only) */}
              {!isLogin && (
                <div className="transform transition-all duration-300">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className={`w-full pl-10 pr-12 py-3 bg-slate-700/50 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-white placeholder-slate-400 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-slate-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 transform  active:scale-95 shadow-lg"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            {/* Toggle between login/signup */}
            <div className="mt-8 text-center">
              <p className="text-slate-400">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-orange-400 hover:text-orange-300 font-semibold transition-colors"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            {/* Forgot password (login only) */}
            {isLogin && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Decorative */}
        <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-yellow-400/20 via-orange-500/20 to-red-500/20 relative overflow-hidden border-l border-slate-700/50">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm"></div>
          <div className="relative z-10 h-full flex flex-col justify-center items-center p-8 text-white text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-white font-bold text-3xl">L</span>
              </div>
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                {isLogin ? 'Welcome Back!' : 'Join LUNA ADMIN'}
              </h3>
              <p className="text-xl text-slate-300">
                {isLogin 
                  ? 'Access your account and continue managing your dashboard with powerful admin tools.'
                  : 'Create an account and unlock the full potential of our management portal.'
                }
              </p>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-r from-red-500/10 to-yellow-400/10 rounded-full animate-pulse delay-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VerificationComponent(verificationEmail: string, message: { type: "success" | "error"; text: string; } | null, verificationCode: string, setVerificationCode: React.Dispatch<React.SetStateAction<string>>, handleVerification: () => Promise<void>, loading: boolean, resendVerification: () => Promise<void>) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-500 scale-100 backdrop-blur-sm">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Mail className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
                <p className="text-slate-300">
                    We sent a verification code to
                    <br />
                    <span className="font-semibold text-orange-400">{verificationEmail}</span>
                </p>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                    {message.type === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <AlertCircle className="w-5 h-5" />
                    )}
                    <span className="text-sm">{message.text}</span>
                </div>
            )}

            <form className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Verification Code
                    </label>
                    <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit code"
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-center text-2xl tracking-widest text-white placeholder-slate-400"
                        maxLength={6} />
                </div>

                <button
                    type="button"
                    onClick={handleVerification}
                    disabled={loading || verificationCode.length !== 6}
                    className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        'Verify Email'
                    )}
                </button>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={resendVerification}
                        disabled={loading}
                        className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
                    >
                        Didn't receive the code? Resend
                    </button>
                </div>
            </form>
        </div>
    </div>;
}