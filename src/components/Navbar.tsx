'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase/config';
import { LogOut, User, Menu, Sprout } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface NavbarProps {
  onMenuToggle?: () => void;
  currentUser: any;
}

export default function Navbar({ onMenuToggle, currentUser }: NavbarProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      showToast('Logged out successfully', 'success');
      router.push('/');
    } catch (e: any) {
      showToast(e.message || 'Logout failed', 'error');
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-emerald-100 dark:border-stone-800">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {currentUser && (
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-lg lg:hidden hover:bg-stone-100 dark:hover:bg-stone-850 transition"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <Link href="/" className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-600 rounded-xl text-white">
              <Sprout className="w-6 h-6 animate-pulse" />
            </span>
            <span className="font-bold text-xl tracking-tight text-emerald-950 dark:text-emerald-50">
              GramVikas <span className="text-emerald-600 font-medium">Portal</span> 🌾
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <div className="hidden md:flex flex-col items-end text-right">
                <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                  {currentUser.displayName}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 mt-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-350">
                  {currentUser.role}
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-stone-850 border border-emerald-200 dark:border-stone-700 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                <User className="w-4 h-4" />
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-rose-200 dark:hover:border-rose-950 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-stone-600 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 text-sm font-medium transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 px-3 py-1.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/25 transition"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
