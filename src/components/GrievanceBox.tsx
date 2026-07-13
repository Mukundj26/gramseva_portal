'use client';

import React, { useState } from 'react';
import { useCollection } from '@/firebase/useCollection';
import { db } from '@/firebase/config';
import { useToast } from './ui/Toast';
import {
  AlertTriangle,
  Upload,
  MapPin,
  Clock,
  CheckCircle,
  Inbox,
  AlertCircle,
  FileCheck,
  Eye
} from 'lucide-react';

interface GrievanceBoxProps {
  currentUser: any;
}

const CATEGORIES = [
  { id: 'road', label: 'Road Complaint' },
  { id: 'water', label: 'Water Supply Complaint' },
  { id: 'streetlight', label: 'Street Light Complaint' },
  { id: 'garbage', label: 'Garbage Complaint' }
];

const STATUS_MAP = {
  pending: { label: 'Submitted', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  resolved: { label: 'Resolved', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
};

export default function GrievanceBox({ currentUser }: GrievanceBoxProps) {
  const { showToast } = useToast();

  // Load active user complaints
  const { data: complaints, loading } = useCollection<any>(
    'complaints',
    [{ field: 'userId', operator: '==', value: currentUser.uid }]
  );

  // Form State
  const [category, setCategory] = useState('road');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [gpsLocation, setGpsLocation] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'file' | 'track'>('file');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('File size must be under 2MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        setPhotoName(file.name);
        showToast('Complaint photo uploaded successfully.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFetchGPS = () => {
    setGpsLoading(true);
    if (!navigator.geolocation) {
      setGpsLocation('Lat: 18.5204, Long: 73.8567 (Default Rampur Area)');
      showToast('Geolocation not supported. Loaded default coordinates.', 'warning');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `Lat: ${position.coords.latitude.toFixed(4)}, Long: ${position.coords.longitude.toFixed(4)}`;
        setGpsLocation(coords);
        showToast('GPS location pinned successfully!', 'success');
        setGpsLoading(false);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        // Fallback coordinates
        const randOffsetLat = (Math.random() - 0.5) * 0.01;
        const randOffsetLong = (Math.random() - 0.5) * 0.01;
        const fallback = `Lat: ${(18.5204 + randOffsetLat).toFixed(4)}, Long: ${(73.8567 + randOffsetLong).toFixed(4)} (Rampur Ward Office)`;
        setGpsLocation(fallback);
        showToast('Location permission denied. Loaded nearest sector coordinates.', 'info');
        setGpsLoading(false);
      },
      { timeout: 6000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      showToast('Please provide a description.', 'warning');
      return;
    }

    setSubmitting(true);
    const locationInfo = gpsLocation || 'Rampur Village Center (Default)';

    try {
      await db.simulator.submitComplaint(
        currentUser.uid,
        category,
        description,
        photoUrl,
        locationInfo
      );
      showToast('Grievance registered in Panchayat Registry.', 'success');
      setDescription('');
      setPhotoUrl('');
      setPhotoName('');
      setGpsLocation('');
      setActiveSubTab('track');
    } catch (err: any) {
      showToast(err.message || 'Submission failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Sub tabs switcher */}
      <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-850 pb-2">
        <div>
          <h3 className="text-xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5.5 h-5.5 text-emerald-600 animate-pulse" />
            Citizen Grievance Redressal
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">Register civic issues and track resolutions directly with Panchayat authorities.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('file')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'file'
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 text-stone-550 hover:bg-stone-50'
            }`}
          >
            File Grievance
          </button>
          <button
            onClick={() => setActiveSubTab('track')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition relative ${
              activeSubTab === 'track'
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 text-stone-550 hover:bg-stone-50'
            }`}
          >
            Track List
            {complaints && complaints.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black leading-none">
                {complaints.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* File Grievance Sub Tab */}
      {activeSubTab === 'file' && (
        <div className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm p-6 max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Grievance Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm font-semibold text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Describe the Issue</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-105 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Describe details: e.g. location landmark, safety hazard levels, etc..."
              />
            </div>

            {/* GPS Location Locator */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-3.5 bg-stone-50 dark:bg-stone-950/20 border border-stone-150 dark:border-stone-850 rounded-xl">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide block">Grievance Location (GPS)</span>
                {gpsLocation ? (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    {gpsLocation}
                  </span>
                ) : (
                  <span className="text-xs text-stone-450 italic">No GPS coordinates attached.</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleFetchGPS}
                disabled={gpsLoading}
                className="px-3.5 py-2 bg-stone-200 hover:bg-stone-250 text-stone-700 dark:bg-stone-800 dark:hover:bg-stone-750 dark:text-stone-250 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
              >
                {gpsLoading ? (
                  <>
                    <span className="border-2 border-stone-500/30 border-t-stone-700 w-3.5 h-3.5 rounded-full animate-spin" />
                    <span>Locating...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Pin Location</span>
                  </>
                )}
              </button>
            </div>

            {/* Upload Photo Box */}
            <div className="border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-xl p-4 text-center hover:border-emerald-500 dark:hover:border-emerald-700 transition relative">
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-stone-350 dark:text-stone-750 mb-1.5" />
                <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">Upload Grievance Photo</span>
                <span className="text-[10px] text-stone-450 block mt-0.5">JPEG/PNG formats under 2MB</span>
                <label className="mt-3 px-3 py-1.5 bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 text-stone-700 dark:text-stone-200 rounded-lg text-[10px] font-bold cursor-pointer transition">
                  Select Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {photoUrl && (
                <div className="mt-3 p-2 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950 rounded-lg flex items-center justify-between text-left">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[10px] font-semibold text-stone-700 dark:text-stone-300 truncate max-w-[180px]">{photoName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoUrl('');
                      setPhotoName('');
                    }}
                    className="text-[10px] text-rose-600 font-bold hover:underline shrink-0 ml-1"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
            >
              {submitting ? 'Registering...' : 'Submit Grievance'}
            </button>
          </form>
        </div>
      )}

      {/* Track Grievance List Sub Tab */}
      {activeSubTab === 'track' && (
        <div className="space-y-4">
          {loading ? (
            <div className="h-32 bg-stone-100 dark:bg-stone-850 rounded-2xl animate-pulse" />
          ) : !complaints || complaints.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl">
              <Inbox className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
              <h5 className="font-extrabold text-stone-700 dark:text-stone-300">No Grievances Filed</h5>
              <p className="text-xs text-stone-400 mt-1">Issues you report to the Panchayat will be tracked and status updates will be displayed here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {complaints.map((comp: any) => {
                const statusDetails = STATUS_MAP[comp.status as 'pending'|'in_progress'|'resolved'] || STATUS_MAP.pending;
                return (
                  <div key={comp.id} className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between gap-5">
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          {comp.category} Issue
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusDetails.color}`}>
                          {statusDetails.label}
                        </span>
                        <span className="text-[10px] text-stone-400 font-medium flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(comp.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">{comp.description}</p>
                      
                      <div className="pt-2 flex flex-col gap-1.5 text-[10px] text-stone-450 font-bold border-t border-stone-100 dark:border-stone-850">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          Location: {comp.location}
                        </span>
                      </div>

                      {/* Admin Remarks */}
                      {comp.adminRemarks && (
                        <div className="mt-2 p-3 bg-stone-50 dark:bg-stone-950/20 border border-stone-150 dark:border-stone-850 rounded-xl">
                          <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wide block mb-0.5">Panchayat Office Update</span>
                          <p className="text-xs text-stone-605 italic">"{comp.adminRemarks}"</p>
                        </div>
                      )}
                    </div>

                    {/* Complaint Photo Preview if attached */}
                    {comp.photoUrl && (
                      <div className="w-full md:w-32 h-32 rounded-xl border border-stone-150 dark:border-stone-850 overflow-hidden bg-stone-50 shrink-0 self-center">
                        <img
                          src={comp.photoUrl}
                          alt="Grievance Proof"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
