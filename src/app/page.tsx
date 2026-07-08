'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '@/firebase/config';
import { Sprout, FileText, ShieldCheck, ArrowRight, CloudSun, Award, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Top Header/Navigation */}
      <header className="w-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-emerald-100 dark:border-stone-800 sticky top-0 z-35">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-600 rounded-xl text-white">
              <Sprout className="w-5 h-5" />
            </span>
            <span className="font-extrabold text-xl tracking-tight text-emerald-950 dark:text-emerald-50">
              GramVikas <span className="text-emerald-600 font-medium">Portal</span> 🌾
            </span>
          </div>

          <div className="flex items-center gap-3">
            {loading ? (
              <span className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            ) : currentUser ? (
              <Link
                href="/dashboard"
                className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-semibold text-emerald-750 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 px-3 py-2 rounded-xl transition"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition shadow-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-b from-emerald-50/50 to-stone-50 dark:from-emerald-950/10 dark:to-stone-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/45 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-350 text-xs font-bold uppercase tracking-wider mb-6">
            <Sprout className="w-3.5 h-3.5 text-emerald-600" /> Digital Panchayat Hub
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-stone-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Empowering Gram Panchayats through{' '}
            <span className="text-emerald-600 underline decoration-wavy decoration-emerald-500/30">AI Innovation</span> and Transparency
          </h1>
          <p className="text-lg text-stone-600 dark:text-stone-300 mt-6 max-w-2xl mx-auto leading-relaxed">
            Welcome to GramVikas. We provide citizens with instant, real-time public services and farmers with state-of-the-art AI-driven agricultural crop advisory and scheme recommendation engines.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href={currentUser ? "/dashboard" : "/auth/register"}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-600/10 transition flex items-center gap-2"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/login"
              className="bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 hover:bg-stone-50 dark:hover:bg-stone-850 font-bold px-8 py-3.5 rounded-xl transition text-stone-700 dark:text-stone-200"
            >
              Access Demo Accounts
            </Link>
          </div>
        </div>
      </section>

      {/* Main Core Columns Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 bg-white dark:bg-stone-900 border border-emerald-50/50 dark:border-stone-850 rounded-2xl shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:border-emerald-600/25 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-50">Citizen Services</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
              Submit digital applications for Birth, Death, Income, and Residence certificates. Track verification status in real time and manage docs online.
            </p>
            <ul className="text-xs text-stone-500 dark:text-stone-450 space-y-2 mt-2">
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Real-time tracking</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Secure file verification</li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="p-8 bg-white dark:bg-stone-900 border border-emerald-50/50 dark:border-stone-850 rounded-2xl shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:border-emerald-600/25 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-50">Agricultural Hub</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
              Access the AI Crop Advisor powered by Gemini 1.5 Flash. Get custom fertilizer regimes, eligibility checks on Kisan schemes, and active weather forecast updates.
            </p>
            <ul className="text-xs text-stone-500 dark:text-stone-450 space-y-2 mt-2">
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> AI advisor report</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> PM-Kisan & KCC matching</li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="p-8 bg-white dark:bg-stone-900 border border-emerald-50/50 dark:border-stone-850 rounded-2xl shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:border-emerald-600/25 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-50">Admin Verification</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
              Empower Panchayat admins with queue management. Review certificates, sign-offs, reference dataset config (crops, schemes, weather) with immediate updates.
            </p>
            <ul className="text-xs text-stone-500 dark:text-stone-450 space-y-2 mt-2">
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> One-click approvals</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Instant user alerts</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Info Stats Section */}
      <section className="bg-emerald-900 dark:bg-emerald-950/60 py-12 text-white border-t border-emerald-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-3xl font-extrabold">100%</h4>
            <p className="text-xs text-emerald-200 uppercase mt-1 tracking-wider font-bold">Secure Path RBAC</p>
          </div>
          <div>
            <h4 className="text-3xl font-extrabold">Instant</h4>
            <p className="text-xs text-emerald-200 uppercase mt-1 tracking-wider font-bold">Real-time Updates</p>
          </div>
          <div>
            <h4 className="text-3xl font-extrabold">Gemini 1.5</h4>
            <p className="text-xs text-emerald-200 uppercase mt-1 tracking-wider font-bold">Advisory Engine</p>
          </div>
          <div>
            <h4 className="text-3xl font-extrabold">Zero-Setup</h4>
            <p className="text-xs text-emerald-200 uppercase mt-1 tracking-wider font-bold">Offline Simulation Ready</p>
          </div>
        </div>
      </section>
    </div>
  );
}
