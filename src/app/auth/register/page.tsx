'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase/config';
import { useToast } from '@/components/ui/Toast';
import { Sprout, User, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'citizen' | 'farmer' | 'admin'>('citizen');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      if (user) {
        router.push('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      await auth.createUserWithEmailAndPassword(email, password, fullName, role);
      showToast('Registration successful! Welcome.', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
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
            Join the Digital Village 🌾
          </h1>
          <p className="text-emerald-100 leading-relaxed mb-6">
            Register to join the Gram Panchayat ecosystem. Set up your crop profiles, track public services, and receive instant updates.
          </p>
        </div>

        <div className="text-xs text-emerald-200/60 relative z-10">
          &copy; {new Date().getFullYear()} GramVikas Panchayat Hub. Powered by AI and Gemini.
        </div>
      </div>

      {/* Right Register Form Section */}
      <div className="md:w-1/2 p-8 sm:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Create Account</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              Select your role and fill in your details to register.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Role Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                Select Your Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['citizen', 'farmer', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-3 text-xs font-bold capitalize border rounded-xl transition ${
                      role === r
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'bg-white dark:bg-stone-905 border-stone-250 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 dark:text-stone-100 text-sm font-medium transition"
                  placeholder="E.g., Rajesh Kumar"
                />
              </div>
            </div>

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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 dark:text-stone-100 text-sm font-medium transition"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 dark:text-stone-100 text-sm font-medium transition"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm mt-4"
            >
              {loading ? (
                <span className="border-2 border-white/30 border-t-white w-4 h-4 rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-center text-stone-500 dark:text-stone-400 mt-6">
            Already registered?{' '}
            <Link
              href="/auth/login"
              className="font-semibold text-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-500 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
