'use client';

import React, { useState } from 'react';
import { useCollection } from '@/firebase/useCollection';
import { db } from '@/firebase/config';
import { useToast } from './ui/Toast';
import {
  Map,
  BookOpen,
  HeartPulse,
  Baby,
  Droplet,
  Home,
  Milestone,
  Building,
  Search,
  Plus,
  Trash2,
  Phone,
  Clock,
  Navigation,
  Globe
} from 'lucide-react';

interface VillageDirectoryProps {
  isAdmin?: boolean;
}

const CATEGORY_MAP: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  school: { label: 'School / College', icon: BookOpen, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
  hospital: { label: 'Hospital / Clinic', icon: HeartPulse, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30' },
  anganwadi: { label: 'Anganwadi Center', icon: Baby, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  water_tank: { label: 'Water Assets', icon: Droplet, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  panchayat: { label: 'Panchayat Office', icon: Home, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  road: { label: 'Road Infrastructure', icon: Milestone, color: 'text-stone-600 dark:text-stone-400', bg: 'bg-stone-50 dark:bg-stone-950/30' },
  public_facility: { label: 'Public Facility', icon: Building, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30' }
};

export default function VillageDirectory({ isAdmin = false }: VillageDirectoryProps) {
  const { showToast } = useToast();
  const { data: facilities, loading } = useCollection<any>('facilities');

  // Filters State
  const [selectedWard, setSelectedWard] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Admin Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formCategory, setFormCategory] = useState('school');
  const [formName, setFormName] = useState('');
  const [formWard, setFormWard] = useState<'Ward 1' | 'Ward 2' | 'Ward 3' | 'Ward 4' | 'Ward 5'>('Ward 1');
  const [formDetails, setFormDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDetails.trim()) {
      showToast('Please fill in required fields.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await db.simulator.manageFacilities('add', {
        category: formCategory,
        name: formName,
        ward: formWard,
        details: formDetails
      });
      showToast('Facility added successfully to registry.', 'success');
      setFormName('');
      setFormDetails('');
      setShowAddForm(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to add facility.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFacility = async (id: string) => {
    if (confirm('Are you sure you want to delete this facility record?')) {
      try {
        await db.simulator.manageFacilities('delete', { id });
        showToast('Facility record removed.', 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to delete.', 'error');
      }
    }
  };

  // Filter facilities
  const filteredFacilities = facilities?.filter((f: any) => {
    const matchesWard = !selectedWard || f.ward === selectedWard;
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesWard && matchesCategory && matchesSearch;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
            <Map className="w-5.5 h-5.5 text-emerald-600" />
            Village Information System (VIS)
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">Interactive GIS Ward Map & public infrastructure directories of Vadgaon Rasai village.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Close Registrar' : 'Add Facility'}
          </button>
        )}
      </div>

      {/* Admin Add Facility Panel */}
      {showAddForm && isAdmin && (
        <form onSubmit={handleAddFacility} className="p-6 bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm space-y-4 max-w-2xl animate-in slide-in-from-top-5 duration-200">
          <h4 className="font-extrabold text-stone-850 dark:text-white text-sm">Register Public Infrastructure Asset</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">Asset Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-semibold text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {Object.entries(CATEGORY_MAP).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">Facility / Asset Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-medium dark:text-stone-105 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="E.g. Z.P. Primary School No. 2"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">Village Ward Location</label>
              <select
                value={formWard}
                onChange={(e: any) => setFormWard(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-semibold text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Ward 1">Ward 1 (North Sector)</option>
                <option value="Ward 2">Ward 2 (Water Works & Medical)</option>
                <option value="Ward 3">Ward 3 (Village Square / Panchayat)</option>
                <option value="Ward 4">Ward 4 (Mandi Junction)</option>
                <option value="Ward 5">Ward 5 (South Residential)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">Operational Details & Contact Info</label>
            <textarea
              value={formDetails}
              onChange={(e) => setFormDetails(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-medium dark:text-stone-105 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Provide principal contacts, working hours, capacity constraints..."
              required
            />
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
              disabled={submitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              {submitting ? 'Registering...' : 'Register Asset'}
            </button>
          </div>
        </form>
      )}

      {/* SVG GIS Map Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Interactive SVG Map Container */}
        <div className="lg:col-span-1 p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-sm space-y-4">
          <div>
            <h4 className="font-extrabold text-stone-900 dark:text-white text-xs uppercase tracking-wider">Interactive Ward Map</h4>
            <p className="text-[10px] text-stone-400 mt-0.5">Click a sector on the map below to filter public assets by ward.</p>
          </div>

          <div className="relative bg-emerald-50/10 dark:bg-stone-950/45 p-4 rounded-xl border border-stone-100 dark:border-stone-850 flex items-center justify-center">
            {/* Styled SVG Village Map */}
            <svg
              viewBox="0 0 300 220"
              className="w-full max-w-[240px] h-auto drop-shadow-sm transition duration-300"
            >
              {/* Ward 1 (North Sector) */}
              <polygon
                points="10,10 160,10 140,90 10,90"
                onClick={() => setSelectedWard(selectedWard === 'Ward 1' ? null : 'Ward 1')}
                className={`cursor-pointer transition duration-200 ${
                  selectedWard === 'Ward 1'
                    ? 'fill-emerald-600 stroke-white stroke-2'
                    : 'fill-emerald-200/40 hover:fill-emerald-300/50 stroke-emerald-600 dark:fill-emerald-950/20 dark:stroke-emerald-800'
                }`}
              />
              <text x="50" y="50" className={`text-[10px] font-black pointer-events-none select-none ${selectedWard === 'Ward 1' ? 'fill-white' : 'fill-emerald-900 dark:fill-emerald-400'}`}>Ward 1</text>

              {/* Ward 2 (Water Works / Medical) */}
              <polygon
                points="160,10 290,10 290,90 140,90"
                onClick={() => setSelectedWard(selectedWard === 'Ward 2' ? null : 'Ward 2')}
                className={`cursor-pointer transition duration-200 ${
                  selectedWard === 'Ward 2'
                    ? 'fill-emerald-600 stroke-white stroke-2'
                    : 'fill-emerald-200/40 hover:fill-emerald-300/50 stroke-emerald-600 dark:fill-emerald-950/20 dark:stroke-emerald-800'
                }`}
              />
              <text x="190" y="50" className={`text-[10px] font-black pointer-events-none select-none ${selectedWard === 'Ward 2' ? 'fill-white' : 'fill-emerald-900 dark:fill-emerald-400'}`}>Ward 2</text>

              {/* Ward 3 (Panchayat Headquarters) */}
              <polygon
                points="10,90 140,90 160,150 10,150"
                onClick={() => setSelectedWard(selectedWard === 'Ward 3' ? null : 'Ward 3')}
                className={`cursor-pointer transition duration-200 ${
                  selectedWard === 'Ward 3'
                    ? 'fill-emerald-600 stroke-white stroke-2'
                    : 'fill-emerald-200/40 hover:fill-emerald-300/50 stroke-emerald-600 dark:fill-emerald-950/20 dark:stroke-emerald-800'
                }`}
              />
              <text x="55" y="125" className={`text-[10px] font-black pointer-events-none select-none ${selectedWard === 'Ward 3' ? 'fill-white' : 'fill-emerald-900 dark:fill-emerald-400'}`}>Ward 3</text>

              {/* Ward 4 (APMC Bypass Link) */}
              <polygon
                points="140,90 290,90 290,150 160,150"
                onClick={() => setSelectedWard(selectedWard === 'Ward 4' ? null : 'Ward 4')}
                className={`cursor-pointer transition duration-200 ${
                  selectedWard === 'Ward 4'
                    ? 'fill-emerald-600 stroke-white stroke-2'
                    : 'fill-emerald-200/40 hover:fill-emerald-300/50 stroke-emerald-600 dark:fill-emerald-950/20 dark:stroke-emerald-800'
                }`}
              />
              <text x="200" y="125" className={`text-[10px] font-black pointer-events-none select-none ${selectedWard === 'Ward 4' ? 'fill-white' : 'fill-emerald-900 dark:fill-emerald-400'}`}>Ward 4</text>

              {/* Ward 5 (Residential South) */}
              <polygon
                points="10,150 290,150 250,210 50,210"
                onClick={() => setSelectedWard(selectedWard === 'Ward 5' ? null : 'Ward 5')}
                className={`cursor-pointer transition duration-200 ${
                  selectedWard === 'Ward 5'
                    ? 'fill-emerald-600 stroke-white stroke-2'
                    : 'fill-emerald-200/40 hover:fill-emerald-300/50 stroke-emerald-600 dark:fill-emerald-950/20 dark:stroke-emerald-800'
                }`}
              />
              <text x="135" y="185" className={`text-[10px] font-black pointer-events-none select-none ${selectedWard === 'Ward 5' ? 'fill-white' : 'fill-emerald-900 dark:fill-emerald-400'}`}>Ward 5</text>
            </svg>
          </div>

          <div className="flex justify-between items-center text-[10px] font-bold text-stone-500">
            <span>Selected Map Ward: <span className="text-emerald-650 dark:text-emerald-400 font-extrabold">{selectedWard || 'All Wards'}</span></span>
            {selectedWard && (
              <button
                onClick={() => setSelectedWard(null)}
                className="text-rose-600 hover:underline cursor-pointer"
              >
                Clear Map Filter
              </button>
            )}
          </div>
        </div>

        {/* Directory Grid Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Controls: Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="w-full md:w-64 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search schools, clinic, reservoir..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-medium dark:text-stone-105 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Category selection */}
            <div className="w-full md:w-auto overflow-x-auto flex gap-1.5 pb-0.5">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-650 text-white'
                    : 'bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 text-stone-550 hover:bg-stone-50'
                }`}
              >
                All
              </button>
              {Object.entries(CATEGORY_MAP).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                    selectedCategory === key
                      ? 'bg-emerald-650 text-white'
                      : 'bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 text-stone-550 hover:bg-stone-50'
                  }`}
                >
                  {value.label.split(' / ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Listings Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="h-28 bg-stone-100 dark:bg-stone-850 rounded-2xl animate-pulse" />
              <div className="h-28 bg-stone-100 dark:bg-stone-850 rounded-2xl animate-pulse" />
            </div>
          ) : filteredFacilities.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl">
              <Map className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
              <h5 className="font-extrabold text-stone-700 dark:text-stone-300">No Facilities Registered</h5>
              <p className="text-xs text-stone-400 mt-1">There are no facility assets registered matching the active filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFacilities.map((fac: any) => {
                const config = CATEGORY_MAP[fac.category] || CATEGORY_MAP.public_facility;
                const CatIcon = config.icon;
                return (
                  <div
                    key={fac.id}
                    className="p-4 bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition relative group"
                  >
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteFacility(fac.id)}
                        className="absolute top-4 right-4 p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg opacity-0 group-hover:opacity-100 transition duration-150"
                        title="Remove Facility"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-lg ${config.bg} ${config.color}`}>
                          <CatIcon className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-extrabold text-stone-850 dark:text-white text-xs leading-none">{fac.name}</h4>
                          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block mt-1">{config.label}</span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 dark:text-stone-350 leading-relaxed font-semibold">{fac.details}</p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-stone-100 dark:border-stone-850 flex justify-between items-center text-[10px] text-stone-450 font-bold">
                      <span className="flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-stone-400" />
                        {fac.ward}
                      </span>
                      <span className="text-[9px] bg-stone-50 dark:bg-stone-950/20 px-2 py-0.5 rounded border border-stone-150 dark:border-stone-850 uppercase">
                        ID: {fac.id}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
