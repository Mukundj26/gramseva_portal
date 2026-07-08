'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase/config';
import { useToast } from '@/components/ui/Toast';
import { Sprout, Lock, Mail, ArrowRight, Info } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Track auth state to redirect if already logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      if (user) {
        router.push('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await auth.signInWithEmailAndPassword(email, password);
      showToast('Welcome to GramVikas Portal!', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (role: 'citizen' | 'farmer' | 'admin') => {
    if (role === 'citizen') {
      setEmail('citizen@village.com');
      setPassword('citizen123');
    } else if (role === 'farmer') {
      setEmail('farmer@farm.com');
      setPassword('farmer123');
    } else if (role === 'admin') {
      setEmail('admin@gramvikas.gov.in');
      setPassword('admin123');
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-stone-50 dark:bg-stone-950">
      {/* Left Banner Section */}
      <div className="md:w-1/2 bg-emerald-800 dark:bg-emerald-950 p-8 flex flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.2),transparent_60%)] pointer-events-none" />
        <Link href="/" className="flex items-center gap-2 relative z-10">
          <span className="p-1 bg-white/10 rounded-lg backdrop-blur-md">
            <Sprout className="w-6 h-6 text-emerald-400" />
          </span>
          <span className="font-bold text-lg tracking-wider">GRAMVIKAS PORTAL</span>
        </Link>

        <div className="my-auto max-w-md relative z-10 py-12 md:py-0">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
            Panchayat Digital Gateway 🌾
          </h1>
          <p className="text-emerald-100 leading-relaxed mb-6">
            Log in to submit certificate applications, consult the AI Crop Advisor, verify files, and track Panchayat welfare schemes in real-time.
          </p>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-emerald-700/60 border border-emerald-500/20 text-xs font-bold uppercase rounded-full">Citizens</span>
            <span className="px-3 py-1 bg-emerald-700/60 border border-emerald-500/20 text-xs font-bold uppercase rounded-full">Farmers</span>
            <span className="px-3 py-1 bg-emerald-700/60 border border-emerald-500/20 text-xs font-bold uppercase rounded-full">Admins</span>
          </div>
        </div>

        <div className="text-xs text-emerald-200/60 relative z-10">
          &copy; {new Date().getFullYear()} GramVikas Panchayat Hub. Powered by AI and Gemini.
        </div>
      </div>

      {/* Right Login Form Section */}
      <div className="md:w-1/2 p-8 sm:p-12 md:p-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Portal Login</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5">
              Enter your credentials or use a quick demo account below.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 dark:text-stone-100 text-sm font-medium transition"
                  placeholder="name@village.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 dark:text-stone-100 text-sm font-medium transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm mt-6"
            >
              {loading ? (
                <span className="border-2 border-white/30 border-t-white w-4 h-4 rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-900">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mb-3">
              <Info className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wide">Developer Demo Accounts</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('citizen')}
                className="px-2.5 py-2 text-[11px] font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-center transition"
              >
                Citizen Account
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('farmer')}
                className="px-2.5 py-2 text-[11px] font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-center transition"
              >
                Farmer Account
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="px-2.5 py-2 text-[11px] font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-center transition"
              >
                Admin Account
              </button>
            </div>
          </div>

          <p className="text-sm text-center text-stone-500 dark:text-stone-400 mt-6">
            New to GramVikas?{' '}
            <Link
              href="/auth/register"
              className="font-semibold text-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-500 hover:underline"
            >
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
