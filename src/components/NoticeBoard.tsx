'use client';

import React, { useState } from 'react';
import { useCollection } from '@/firebase/useCollection';
import { db } from '@/firebase/config';
import { useToast } from './ui/Toast';
import {
  Megaphone,
  Award,
  Calendar,
  Heart,
  Sparkles,
  Users,
  Search,
  Plus,
  Trash2,
  MapPin,
  Clock,
  User
} from 'lucide-react';

interface NoticeBoardProps {
  isAdmin?: boolean;
}

const CATEGORY_MAP: Record<string, { label: string; color: string; icon: any }> = {
  announcement: { label: 'Announcement', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300', icon: Megaphone },
  government: { label: 'Government Notice', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', icon: Award },
  event: { label: 'Village Event', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300', icon: Calendar },
  meeting: { label: 'Meeting Schedule', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300', icon: Users },
  health: { label: 'Health Camp', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300', icon: Heart },
  festival: { label: 'Festival Notice', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300', icon: Sparkles }
};

export default function NoticeBoard({ isAdmin = false }: NoticeBoardProps) {
  const { showToast } = useToast();
  const { data: notices, loading } = useCollection<any>('notices');

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Admin Create Notice form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [formCategory, setFormCategory] = useState('announcement');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formOrganizedBy, setFormOrganizedBy] = useState('');
  const [formVenue, setFormVenue] = useState('');
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim() || !formOrganizedBy.trim()) {
      showToast('Please fill in required fields.', 'warning');
      return;
    }

    setPublishing(true);
    try {
      await db.simulator.submitNotice(
        formCategory,
        formTitle,
        formContent,
        formOrganizedBy,
        formVenue || undefined
      );
      showToast('Notice published successfully!', 'success');
      // Reset form
      setFormTitle('');
      setFormContent('');
      setFormOrganizedBy('');
      setFormVenue('');
      setShowAddForm(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to publish notice.', 'error');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this notice?')) {
      try {
        await db.simulator.deleteNotice(id);
        showToast('Notice deleted successfully.', 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to delete notice.', 'error');
      }
    }
  };

  // Filter notices
  const filteredNotices = notices?.filter((notice: any) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || notice.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-xl font-extrabold text-stone-900 dark:text-white">Village Notice Board</h3>
          <p className="text-xs text-stone-500 mt-0.5">Stay updated with official notices, scheduled health camps, meetings, and festivals.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Close Editor' : 'Publish Notice'}
          </button>
        )}
      </div>

      {/* Admin Editor Form Panel */}
      {showAddForm && isAdmin && (
        <form onSubmit={handlePublish} className="p-6 bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm space-y-4 max-w-2xl animate-in slide-in-from-top-5 duration-200">
          <h4 className="font-extrabold text-stone-850 dark:text-white text-sm">Create Official Announcement</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">Notice Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-semibold text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="announcement">Panchayat Announcement</option>
                <option value="government">Government Notice</option>
                <option value="event">Village Event</option>
                <option value="meeting">Meeting Schedule</option>
                <option value="health">Health Camp Notice</option>
                <option value="festival">Festival Announcement</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">Notice Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-medium dark:text-stone-105 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="E.g. Polio Vaccination Drive"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">Notice Content / Details</label>
            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-medium dark:text-stone-105 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Provide complete details including target audience, requirements..."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">Organized By / Authority</label>
              <input
                type="text"
                value={formOrganizedBy}
                onChange={(e) => setFormOrganizedBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-medium dark:text-stone-105 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="E.g. Primary Health Center"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">Venue / Location (Optional)</label>
              <input
                type="text"
                value={formVenue}
                onChange={(e) => setFormVenue(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-medium dark:text-stone-105 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="E.g. Village Panchayat Hall"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-stone-200 dark:border-stone-850 hover:bg-stone-50 rounded-xl text-xs font-bold transition text-stone-600 dark:text-stone-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={publishing}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              {publishing ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      )}

      {/* Filters Area */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="w-full md:w-80 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notices by keyword..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-medium dark:text-stone-105 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Categories Scroller */}
        <div className="flex gap-2 overflow-x-auto w-full pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 text-stone-500 hover:bg-stone-50'
            }`}
          >
            All Notices
          </button>
          {Object.entries(CATEGORY_MAP).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                selectedCategory === key
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 text-stone-500 hover:bg-stone-50'
              }`}
            >
              {value.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
          <div className="h-36 bg-stone-100 dark:bg-stone-850 rounded-2xl animate-pulse" />
          <div className="h-36 bg-stone-100 dark:bg-stone-850 rounded-2xl animate-pulse" />
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl">
          <Megaphone className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
          <h5 className="font-extrabold text-stone-700 dark:text-stone-300">No Announcements Found</h5>
          <p className="text-xs text-stone-400 mt-1">There are no notices published matching the search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNotices.map((notice: any) => {
            const cat = CATEGORY_MAP[notice.category] || CATEGORY_MAP.announcement;
            const CatIcon = cat.icon;
            return (
              <div key={notice.id} className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-200 relative group">
                
                {/* Delete button for Admin */}
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(notice.id)}
                    className="absolute top-4 right-4 p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg opacity-0 group-hover:opacity-100 transition duration-150"
                    title="Remove Notice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <div className="space-y-3">
                  {/* Category badge */}
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cat.color}`}>
                      <CatIcon className="w-3 h-3" />
                      {cat.label}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(notice.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-stone-900 dark:text-white text-sm">{notice.title}</h4>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mt-1.5">{notice.content}</p>
                  </div>
                </div>

                {/* Footer details */}
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-850 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-stone-400 font-bold">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    By: {notice.organizedBy}
                  </span>
                  {notice.venue && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      Venue: {notice.venue}
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
