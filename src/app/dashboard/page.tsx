'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/firebase/config';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import CitizenDashboard from './citizen/CitizenDashboard';
import FarmerDashboard from './farmer/FarmerDashboard';
import AdminDashboard from './admin/AdminDashboard';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      if (!user) {
        // If not logged in, force authentication redirect
        router.push('/auth/login');
      } else {
        setCurrentUser(user);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="flex flex-col items-center gap-4">
          <span className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-stone-500 dark:text-stone-400">
            Authorizing Secure Access...
          </span>
        </div>
      </div>
    );
  }

  const role = currentUser?.role;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex">
        {/* Navigation Sidebar */}
        <Sidebar
          currentUser={currentUser}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 py-8 min-h-[calc(100vh-4rem)]">
          {role === 'citizen' && <CitizenDashboard currentUser={currentUser} />}
          {role === 'farmer' && <FarmerDashboard currentUser={currentUser} />}
          {role === 'admin' && <AdminDashboard currentUser={currentUser} />}
          
          {role !== 'citizen' && role !== 'farmer' && role !== 'admin' && (
            <div className="p-8 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl text-center">
              <h2 className="text-xl font-bold text-rose-600">Unauthorized Role</h2>
              <p className="text-stone-500 mt-2">Your user profile does not contain an authorized GramVikas role attribute.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function DashboardRouter() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="flex flex-col items-center gap-4">
          <span className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-stone-500 dark:text-stone-400">
            Loading Dashboard Shell...
          </span>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
