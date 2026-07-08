'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  Bell,
  Sprout,
  Award,
  CloudSun,
  ShieldCheck,
  ClipboardList,
  Database,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  currentUser: any;
  isOpen: boolean;
  onClose?: () => void;
}

export default function Sidebar({ currentUser, isOpen, onClose }: SidebarProps) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  if (!currentUser) return null;

  const role = currentUser.role;

  // Define sidebar navigation items based on role
  const menuItems = {
    citizen: [
      {
        id: 'overview',
        label: 'Dashboard Overview',
        icon: LayoutDashboard,
        href: '/dashboard?tab=overview',
      },
      {
        id: 'apply',
        label: 'Apply Certificate',
        icon: FileText,
        href: '/dashboard?tab=apply',
      },
      {
        id: 'notifications',
        label: 'Alerts & Messages',
        icon: Bell,
        href: '/dashboard?tab=notifications',
      },
    ],
    farmer: [
      {
        id: 'overview',
        label: 'Farmer Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard?tab=overview',
      },
      {
        id: 'crop-advisor',
        label: 'AI Crop Advisor',
        icon: Sprout,
        href: '/dashboard?tab=crop-advisor',
      },
      {
        id: 'schemes',
        label: 'Scheme Suggester',
        icon: Award,
        href: '/dashboard?tab=schemes',
      },
      {
        id: 'weather',
        label: 'Weather Station',
        icon: CloudSun,
        href: '/dashboard?tab=weather',
      },
    ],
    admin: [
      {
        id: 'overview',
        label: 'Admin Overview',
        icon: LayoutDashboard,
        href: '/dashboard?tab=overview',
      },
      {
        id: 'queue',
        label: 'Verification Queue',
        icon: ClipboardList,
        href: '/dashboard?tab=queue',
      },
      {
        id: 'reference-data',
        label: 'Reference Manager',
        icon: Database,
        href: '/dashboard?tab=reference-data',
      },
    ],
  };

  const items = menuItems[role as 'citizen' | 'farmer' | 'admin'] || [];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-20 bg-stone-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-20 flex w-64 flex-col border-r border-emerald-100 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 py-6 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-5 flex-1">
          <div className="px-3">
            <span className="text-[11px] font-bold tracking-widest text-stone-400 uppercase">
              Main Menu
            </span>
          </div>

          <nav className="flex flex-col gap-1.5 flex-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                      : 'text-stone-600 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-700 dark:hover:text-emerald-400'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-stone-400 dark:text-stone-500'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-stone-150 dark:border-stone-800 pt-4 px-3 flex flex-col gap-3 bg-stone-50 dark:bg-stone-950/20 p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wide">
                Security Node
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
              Path ownership check: Active. Role status: <span className="font-semibold text-emerald-600">{role}</span>.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
