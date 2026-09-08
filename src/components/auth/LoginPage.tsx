import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldAlert, CheckCircle2, ArrowRight, UserCheck, Package, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { signIn, resetPasswordForEmail } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot password modal / state
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await signIn(email, password);
      if (res.success) {
        // Redirect according to assigned role
        if (res.role === 'admin') {
          navigate('/dashboard', { replace: true });
        } else if (res.role === 'stock') {
          navigate('/inventory', { replace: true });
        } else if (res.role === 'customer') {
          navigate('/store', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setErrorMsg(res.error || 'Failed to sign in. Please check credentials.');
      }
    } catch (err: any) {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoRole: 'admin' | 'stock' | 'customer') => {
    setEmail(demoEmail);
    setPassword('demo123');
    setErrorMsg(null);
    setLoading(true);
    const res = await signIn(demoEmail, 'demo123');
    setLoading(false);
    if (res.success) {
      if (demoRole === 'admin') navigate('/dashboard', { replace: true });
      else if (demoRole === 'stock') navigate('/inventory', { replace: true });
      else navigate('/store', { replace: true });
    } else {
      setErrorMsg(res.error || 'Demo login failed');
    }
  };

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotMsg(null);
    const res = await resetPasswordForEmail(forgotEmail);
    setForgotLoading(false);
    if (res.success) {
      setForgotMsg(res.message || 'Password reset link sent to your email.');
    } else {
      setForgotMsg(res.error || 'Failed to send reset link.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#E31B23] selection:text-white relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Ronix Sports Logo Badge */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#E31B23] text-white font-black text-3xl rounded-2xl shadow-lg shadow-red-200 mb-4 transform hover:scale-105 transition-transform">
          R
        </div>

        <h1 className="text-2xl font-black tracking-tight text-[#111827]">
          RONIX <span className="text-[#E31B23]">SPORTS</span>
        </h1>
        <p className="mt-1 text-xs text-[#6B7280] uppercase font-bold tracking-widest">
          Sports Equipment Enterprise CRM
        </p>

        <div className="mt-4">
          <h2 className="text-xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to access your authorized workspace
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200/80 space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-150">
              <ShieldAlert className="w-4 h-4 text-[#E31B23] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-2xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23] focus:border-transparent transition-all placeholder:font-normal placeholder:text-slate-400"
                  placeholder="name@ronixsports.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-xs font-bold text-[#E31B23] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative rounded-2xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E31B23] focus:border-transparent transition-all placeholder:font-normal placeholder:text-slate-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#E31B23] hover:bg-[#B5121B] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-red-200 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Customer Signup Section */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500 font-medium">Customer?</p>
            <Link
              to="/signup"
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer block text-center"
            >
              <span>Create Customer Account</span>
            </Link>
          </div>
        </div>

        {/* Quick Demo Login Preset Bar */}
        <div className="mt-6 bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5 text-xs">
          <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block text-center">
            ⚡ Quick Demo Accounts for Evaluation
          </span>
          <div className="grid grid-cols-3 gap-2 text-center">
            <button
              onClick={() => handleQuickDemoLogin('admin@gmail.com', 'admin')}
              className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-[11px] font-bold text-red-900 transition-all cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-[#E31B23] mx-auto mb-0.5" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => handleQuickDemoLogin('stock@gmail.com', 'stock')}
              className="p-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-[11px] font-bold text-amber-900 transition-all cursor-pointer"
            >
              <Package className="w-3.5 h-3.5 text-amber-600 mx-auto mb-0.5" />
              <span>Stock Staff</span>
            </button>
            <button
              onClick={() => handleQuickDemoLogin('customer@gmail.com', 'customer')}
              className="p-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl text-[11px] font-bold text-sky-900 transition-all cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-sky-600 mx-auto mb-0.5" />
              <span>Customer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm">Reset Password</h3>
              <button
                onClick={() => {
                  setIsForgotOpen(false);
                  setForgotMsg(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {forgotMsg ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{forgotMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSendReset} className="space-y-3">
                <p className="text-xs text-slate-600">
                  Enter your account email address. We will send you a password reset link through Supabase Auth.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-[#E31B23] focus:outline-none"
                    placeholder="your@email.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 bg-[#E31B23] hover:bg-[#B5121B] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
