'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCollection } from '@/firebase/useCollection';
import { db } from '@/firebase/config';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import NoticeBoard from '@/components/NoticeBoard';
import VillageDirectory from '@/components/VillageDirectory';
import {
  Users,
  ShieldAlert,
  ClipboardList,
  CheckCircle,
  XCircle,
  Database,
  ExternalLink,
  Sprout,
  Award,
  CloudSun,
  Eye,
  Plus,
  Trash2,
  Edit2
} from 'lucide-react';

interface AdminProps {
  currentUser: any;
}

export default function AdminDashboard({ currentUser }: AdminProps) {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  
  const activeTab = searchParams.get('tab') || 'overview';

  // Load all users
  const { data: users } = useCollection<any>('users');
  
  // Load all applications
  const { data: allApplications } = useCollection<any>('applications');

  // Load all complaints
  const { data: complaints } = useCollection<any>('complaints');

  // Load Reference Crops
  const { data: crops } = useCollection<any>('crops');

  // Load Reference Schemes
  const { data: schemes } = useCollection<any>('government_schemes');

  // Load Weather
  const { data: weatherArray } = useCollection<any>('weather');
  const weather = weatherArray?.[0] || {
    temp: 29,
    humidity: 74,
    wind: 11,
    rain: 45,
    condition: 'Partly Cloudy'
  };

  // Calculate statistics
  const citizenCount = users?.filter((u: any) => u.role === 'citizen').length || 0;
  const farmerCount = users?.filter((u: any) => u.role === 'farmer').length || 0;
  const pendingApps = allApplications?.filter((a: any) => a.status === 'pending' || a.status === 'under_verification').length || 0;
  const approvedApps = allApplications?.filter((a: any) => a.status === 'approved').length || 0;
  const rejectedApps = allApplications?.filter((a: any) => a.status === 'rejected').length || 0;

  // Active Verification Modal state
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [remarks, setRemarks] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingApp, setUpdatingApp] = useState(false);

  // Complaints management modal states
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [complaintRemarks, setComplaintRemarks] = useState('');
  const [complaintStatus, setComplaintStatus] = useState<'pending' | 'in_progress' | 'resolved'>('pending');
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [savingComplaint, setSavingComplaint] = useState(false);

  const handleOpenComplaint = (comp: any) => {
    setSelectedComplaint(comp);
    setComplaintRemarks(comp.adminRemarks || '');
    setComplaintStatus(comp.status);
    setComplaintModalOpen(true);
  };

  const handleUpdateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setSavingComplaint(true);
    try {
      await db.simulator.updateComplaintStatus(selectedComplaint.id, complaintStatus, complaintRemarks);
      showToast('Grievance status updated successfully!', 'success');
      setComplaintModalOpen(false);
      setSelectedComplaint(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to update complaint status', 'error');
    } finally {
      setSavingComplaint(false);
    }
  };

  // Weather configuration form states
  const [weatherTemp, setWeatherTemp] = useState(weather.temp);
  const [weatherHumidity, setWeatherHumidity] = useState(weather.humidity);
  const [weatherWind, setWeatherWind] = useState(weather.wind);
  const [weatherRain, setWeatherRain] = useState(weather.rain);
  const [weatherCond, setWeatherCond] = useState(weather.condition);

  // Reference Data Modals / Forms States
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [currentCropForm, setCurrentCropForm] = useState<any>({ name: '', soilType: '', season: '', waterRequirement: 'medium', expectedYield: '', fertilizers: '', pests: '' });
  const [isEditingCrop, setIsEditingCrop] = useState(false);

  const [schemeModalOpen, setSchemeModalOpen] = useState(false);
  const [currentSchemeForm, setCurrentSchemeForm] = useState<any>({ name: '', description: '', incomeLimit: 500000, maxLandSize: 5, category: 'small,marginal', benefits: '' });
  const [isEditingScheme, setIsEditingScheme] = useState(false);

  // Verification Actions
  const handleOpenVerify = (app: any) => {
    setSelectedApp(app);
    setRemarks(app.adminRemarks || '');
    setModalOpen(true);
  };

  const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
    if (!selectedApp) return;
    setUpdatingApp(true);
    try {
      await db.simulator.updateApplicationStatus(selectedApp.id, status, remarks);
      showToast(`Application successfully ${status}!`, 'success');
      setModalOpen(false);
      setSelectedApp(null);
    } catch (err: any) {
      showToast(err.message || 'Status update failed', 'error');
    } finally {
      setUpdatingApp(false);
    }
  };

  // Weather updates
  const handleUpdateWeather = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      db.simulator.updateWeather({
        temp: Number(weatherTemp),
        humidity: Number(weatherHumidity),
        wind: Number(weatherWind),
        rain: Number(weatherRain),
        condition: weatherCond
      });
      showToast('Weather metrics updated successfully!', 'success');
    } catch (e: any) {
      showToast('Failed to update weather', 'error');
    }
  };

  // Crop management operations
  const handleCropSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...currentCropForm,
        soilType: typeof currentCropForm.soilType === 'string' ? currentCropForm.soilType.split(',').map((s: string) => s.trim()) : currentCropForm.soilType,
        season: typeof currentCropForm.season === 'string' ? currentCropForm.season.split(',').map((s: string) => s.trim()) : currentCropForm.season,
        fertilizers: typeof currentCropForm.fertilizers === 'string' ? currentCropForm.fertilizers.split(',').map((s: string) => s.trim()) : currentCropForm.fertilizers,
        pests: typeof currentCropForm.pests === 'string' ? currentCropForm.pests.split(',').map((s: string) => s.trim()) : currentCropForm.pests
      };

      await db.simulator.manageCrops(isEditingCrop ? 'edit' : 'add', data);
      showToast(`Crop successfully ${isEditingCrop ? 'updated' : 'added'}!`, 'success');
      setCropModalOpen(false);
      setCurrentCropForm({ name: '', soilType: '', season: '', waterRequirement: 'medium', expectedYield: '', fertilizers: '', pests: '' });
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const handleEditCrop = (crop: any) => {
    setIsEditingCrop(true);
    setCurrentCropForm({
      ...crop,
      soilType: crop.soilType.join(', '),
      season: crop.season.join(', '),
      fertilizers: crop.fertilizers.join(', '),
      pests: crop.pests.join(', ')
    });
    setCropModalOpen(true);
  };

  const handleDeleteCrop = async (id: string) => {
    if (confirm('Are you sure you want to delete this crop reference?')) {
      await db.simulator.manageCrops('delete', { id });
      showToast('Crop reference deleted', 'success');
    }
  };

  // Scheme management operations
  const handleSchemeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...currentSchemeForm,
        category: typeof currentSchemeForm.category === 'string' ? currentSchemeForm.category.split(',').map((s: string) => s.trim()) : currentSchemeForm.category
      };

      await db.simulator.manageSchemes(isEditingScheme ? 'edit' : 'add', data);
      showToast(`Scheme successfully ${isEditingScheme ? 'updated' : 'added'}!`, 'success');
      setSchemeModalOpen(false);
      setCurrentSchemeForm({ name: '', description: '', incomeLimit: 500000, maxLandSize: 5, category: 'small,marginal', benefits: '' });
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const handleEditScheme = (scheme: any) => {
    setIsEditingScheme(true);
    setCurrentSchemeForm({
      ...scheme,
      category: scheme.category.join(', ')
    });
    setSchemeModalOpen(true);
  };

  const handleDeleteScheme = async (id: string) => {
    if (confirm('Are you sure you want to delete this scheme reference?')) {
      await db.simulator.manageSchemes('delete', { id });
      showToast('Scheme reference deleted', 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <>
          {/* Big KPI Metric Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-sm text-center">
              <Users className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Citizens</span>
              <h3 className="text-2xl font-black text-stone-850 dark:text-white mt-0.5">{citizenCount}</h3>
            </div>
            <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-sm text-center">
              <Sprout className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Farmers</span>
              <h3 className="text-2xl font-black text-stone-850 dark:text-white mt-0.5">{farmerCount}</h3>
            </div>
            <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-sm text-center">
              <ClipboardList className="w-5 h-5 text-amber-600 mx-auto mb-1.5 animate-pulse" />
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Pending Queue</span>
              <h3 className="text-2xl font-black text-amber-600 mt-0.5">{pendingApps}</h3>
            </div>
            <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-sm text-center">
              <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Approved</span>
              <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{approvedApps}</h3>
            </div>
            <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-sm text-center">
              <XCircle className="w-5 h-5 text-rose-600 mx-auto mb-1.5" />
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Rejected</span>
              <h3 className="text-2xl font-black text-rose-600 mt-0.5">{rejectedApps}</h3>
            </div>
          </div>

          {/* Recent Queue Snippet */}
          <div className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm p-6">
            <h4 className="font-extrabold text-stone-900 dark:text-white mb-4">Latest Application Logs</h4>
            {!allApplications || allApplications.length === 0 ? (
              <div className="text-center py-12 text-stone-400 text-xs">
                No recent activity.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 dark:border-stone-850 text-stone-400 font-bold text-xs uppercase">
                      <th className="pb-3">Applicant Name</th>
                      <th className="pb-3">Certificate Type</th>
                      <th className="pb-3">Date Submitted</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                    {allApplications.slice(0, 5).map((app: any) => (
                      <tr key={app.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-850/20 transition">
                        <td className="py-3 font-semibold text-stone-850 dark:text-stone-200">
                          {app.applicantName}
                        </td>
                        <td className="py-3 capitalize text-stone-600 dark:text-stone-355 font-medium">
                          {app.type}
                        </td>
                        <td className="py-3 text-xs text-stone-450">
                          {new Date(app.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleOpenVerify(app)}
                            className="px-2.5 py-1 bg-emerald-55 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-100 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Verify
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Tab 2: Verification Queue */}
      {activeTab === 'queue' && (
        <div className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm p-6">
          <h4 className="font-extrabold text-stone-900 dark:text-white mb-4">Pending Verification Queue</h4>
          {!allApplications || allApplications.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              No files are currently waiting in the verification queue.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-100 dark:border-stone-850 text-stone-400 font-bold text-xs uppercase">
                    <th className="pb-3">App ID</th>
                    <th className="pb-3">Applicant Name</th>
                    <th className="pb-3">Certificate</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Verify Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                  {allApplications.map((app: any) => (
                    <tr key={app.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-850/20 transition">
                      <td className="py-3.5 font-bold text-stone-700 dark:text-stone-300">
                        {app.id}
                      </td>
                      <td className="py-3.5 font-semibold text-stone-800 dark:text-stone-200">
                        {app.applicantName}
                      </td>
                      <td className="py-3.5 capitalize text-stone-605">
                        {app.type} Certificate
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            app.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-850'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleOpenVerify(app)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 ml-auto shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Verify File
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Reference Manager */}
      {activeTab === 'reference-data' && (
        <div className="space-y-6">
          {/* Weather Settings Grid */}
          <div className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm p-6">
            <h4 className="font-extrabold text-stone-900 dark:text-white flex items-center gap-2 mb-6">
              <CloudSun className="w-5 h-5 text-emerald-600" />
              Manage Weather Telemetry
            </h4>

            <form onSubmit={handleUpdateWeather} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Temp (°C)</label>
                <input
                  type="number"
                  value={weatherTemp}
                  onChange={(e) => setWeatherTemp(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Humidity (%)</label>
                <input
                  type="number"
                  value={weatherHumidity}
                  onChange={(e) => setWeatherHumidity(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Wind (km/h)</label>
                <input
                  type="number"
                  value={weatherWind}
                  onChange={(e) => setWeatherWind(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Rain Forecast (%)</label>
                <input
                  type="number"
                  value={weatherRain}
                  onChange={(e) => setWeatherRain(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-md transition text-xs flex items-center justify-center gap-1.5 h-[42px]"
              >
                <CheckCircle className="w-4 h-4" />
                Update Weather
              </button>
            </form>
          </div>

          {/* Crops Database Settings */}
          <div className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-600" />
                Crops Database
              </h4>
              <button
                onClick={() => {
                  setIsEditingCrop(false);
                  setCurrentCropForm({ name: '', soilType: '', season: '', waterRequirement: 'medium', expectedYield: '', fertilizers: '', pests: '' });
                  setCropModalOpen(true);
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Crop
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-100 dark:border-stone-850 text-stone-400 font-bold text-xs uppercase">
                    <th className="pb-3">Crop Name</th>
                    <th className="pb-3">Season</th>
                    <th className="pb-3">Water Required</th>
                    <th className="pb-3">Expected Yield</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                  {crops?.map((crop: any) => (
                    <tr key={crop.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-850/20 transition">
                      <td className="py-3 font-semibold text-stone-800 dark:text-stone-200">{crop.name}</td>
                      <td className="py-3 capitalize text-xs text-stone-500 dark:text-stone-400">{crop.season.join(', ')}</td>
                      <td className="py-3 capitalize text-xs text-stone-500 dark:text-stone-400">{crop.waterRequirement}</td>
                      <td className="py-3 text-xs text-stone-500 dark:text-stone-400">{crop.expectedYield}</td>
                      <td className="py-3 text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleEditCrop(crop)}
                          className="p-1.5 border border-stone-200 rounded-lg text-stone-500 hover:text-emerald-600 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCrop(crop.id)}
                          className="p-1.5 border border-stone-200 rounded-lg text-stone-500 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Schemes Database Settings */}
          <div className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                Govt Schemes Database
              </h4>
              <button
                onClick={() => {
                  setIsEditingScheme(false);
                  setCurrentSchemeForm({ name: '', description: '', incomeLimit: 500000, maxLandSize: 5, category: 'small,marginal', benefits: '' });
                  setSchemeModalOpen(true);
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Scheme
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-100 dark:border-stone-850 text-stone-400 font-bold text-xs uppercase">
                    <th className="pb-3">Scheme Title</th>
                    <th className="pb-3">Income Cap</th>
                    <th className="pb-3">Max Land Size</th>
                    <th className="pb-3">Benefits</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                  {schemes?.map((scheme: any) => (
                    <tr key={scheme.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-850/20 transition">
                      <td className="py-3 font-semibold text-stone-850 dark:text-stone-200">{scheme.name}</td>
                      <td className="py-3 text-xs text-stone-500">₹{scheme.incomeLimit.toLocaleString()}</td>
                      <td className="py-3 text-xs text-stone-500">{scheme.maxLandSize} Acres</td>
                      <td className="py-3 text-xs text-stone-500 max-w-[200px] truncate">{scheme.benefits}</td>
                      <td className="py-3 text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleEditScheme(scheme)}
                          className="p-1.5 border border-stone-200 rounded-lg text-stone-500 hover:text-emerald-600 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteScheme(scheme.id)}
                          className="p-1.5 border border-stone-200 rounded-lg text-stone-500 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Verification Inspection Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Verify Document & Apply Sign-off">
        {selectedApp && (
          <div className="space-y-4">
            <div className="p-4 bg-stone-50 dark:bg-stone-950/25 border border-stone-100 dark:border-stone-850 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="font-bold text-stone-400">Applicant:</span>
                <span className="font-bold text-stone-750 dark:text-stone-250">{selectedApp.applicantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-stone-400">App Type:</span>
                <span className="font-bold capitalize">{selectedApp.type} Certificate</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-stone-400">Date:</span>
                <span>{new Date(selectedApp.submittedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Application Specific Fields */}
            <div>
              <h5 className="font-bold text-xs text-stone-500 uppercase tracking-wider mb-2">Form Data Details</h5>
              <div className="p-4 border border-stone-100 dark:border-stone-850 rounded-xl space-y-2 bg-stone-50/50 dark:bg-stone-950/10 text-xs">
                {Object.entries(selectedApp.details || {}).map(([key, value]: any) => (
                  <div key={key} className="flex justify-between gap-4">
                    <span className="capitalize text-stone-400 font-medium">{key.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="font-semibold text-stone-700 dark:text-stone-300 text-right">
                      {typeof value === 'number' ? `₹${value.toLocaleString()}` : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Attachments */}
            {selectedApp.documents?.length > 0 && (
              <div>
                <h5 className="font-bold text-xs text-stone-500 uppercase tracking-wider mb-2">Attached Proofs</h5>
                <div className="p-3 border border-stone-200 dark:border-stone-850 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-600 dark:text-stone-350 truncate">{selectedApp.documents[0].name}</span>
                  <a
                    href={selectedApp.documents[0].url}
                    download={selectedApp.documents[0].name}
                    className="text-emerald-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-1"
                  >
                    <span>Download File</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Admin Remarks Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Official Remarks / Notes</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                placeholder="Enter remarks for the applicant's record..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Buttons Panel */}
            <div className="flex justify-end gap-2.5 pt-2 border-t border-stone-100 dark:border-stone-850">
              <button
                type="button"
                onClick={() => handleUpdateStatus('rejected')}
                disabled={updatingApp}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:hover:bg-rose-950/20 text-rose-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <XCircle className="w-4 h-4" />
                Reject Application
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus('approved')}
                disabled={updatingApp}
                className="px-5 py-2.5 bg-emerald-650 hover:bg-emerald-700 disabled:bg-emerald-650/50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Approve & Sign
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reference Crop Creation/Edit Modal */}
      <Modal isOpen={cropModalOpen} onClose={() => setCropModalOpen(false)} title={isEditingCrop ? 'Edit Crop Reference' : 'Add New Crop Reference'}>
        <form onSubmit={handleCropSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Crop Name</label>
            <input
              type="text"
              required
              value={currentCropForm.name}
              onChange={(e) => setCurrentCropForm({ ...currentCropForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-250 bg-white dark:bg-stone-900 dark:text-stone-100 focus:outline-none"
              placeholder="E.g. Wheat"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Soil Types (comma separated)</label>
              <input
                type="text"
                required
                value={currentCropForm.soilType}
                onChange={(e) => setCurrentCropForm({ ...currentCropForm, soilType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-250 bg-white dark:bg-stone-900 dark:text-stone-100 focus:outline-none"
                placeholder="loamy, black, alluvial"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Seasons (comma separated)</label>
              <input
                type="text"
                required
                value={currentCropForm.season}
                onChange={(e) => setCurrentCropForm({ ...currentCropForm, season: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-250 bg-white dark:bg-stone-900 dark:text-stone-100 focus:outline-none"
                placeholder="kharif, rabi"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Water Requirement</label>
              <select
                value={currentCropForm.waterRequirement}
                onChange={(e) => setCurrentCropForm({ ...currentCropForm, waterRequirement: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-250 bg-white dark:bg-stone-900 dark:text-stone-100 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Expected Yield</label>
              <input
                type="text"
                value={currentCropForm.expectedYield}
                onChange={(e) => setCurrentCropForm({ ...currentCropForm, expectedYield: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-250 bg-white dark:bg-stone-900 dark:text-stone-100 focus:outline-none"
                placeholder="E.g. 15-20 quintals/acre"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Fertilizers (comma separated)</label>
            <input
              type="text"
              value={currentCropForm.fertilizers}
              onChange={(e) => setCurrentCropForm({ ...currentCropForm, fertilizers: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-250 bg-white dark:bg-stone-900 dark:text-stone-100 focus:outline-none"
              placeholder="Urea, DAP, NPK"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Pest Prevention Tips (comma separated)</label>
            <input
              type="text"
              value={currentCropForm.pests}
              onChange={(e) => setCurrentCropForm({ ...currentCropForm, pests: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-250 bg-white dark:bg-stone-900 dark:text-stone-100 focus:outline-none"
              placeholder="Rust watch, Cartap spray"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCropModalOpen(false)}
              className="px-4 py-2 border rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold"
            >
              Save Crop
            </button>
          </div>
        </form>
      </Modal>

      {/* Reference Scheme Creation/Edit Modal */}
      <Modal isOpen={schemeModalOpen} onClose={() => setSchemeModalOpen(false)} title={isEditingScheme ? 'Edit Scheme Reference' : 'Add New Scheme Reference'}>
        <form onSubmit={handleSchemeSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Scheme Title</label>
            <input
              type="text"
              required
              value={currentSchemeForm.name}
              onChange={(e) => setCurrentSchemeForm({ ...currentSchemeForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-250 bg-white dark:bg-stone-900 dark:text-stone-100 focus:outline-none"
              placeholder="PM-Kisan"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Description</label>
            <textarea
              required
              rows={2}
              value={currentSchemeForm.description}
              onChange={(e) => setCurrentSchemeForm({ ...currentSchemeForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-250 bg-white dark:bg-stone-900 dark:text-stone-100 focus:outline-none"
              placeholder="Farming assistance..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Income Limit (INR)</label>
              <input
                type="number"
                required
                value={currentSchemeForm.incomeLimit}
                onChange={(e) => setCurrentSchemeForm({ ...currentSchemeForm, incomeLimit: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-stone-250 bg-white dark:bg-stone-900 dark:text-stone-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Max Land Size (Acres)</label>
              <input
                type="number"
                required
                value={currentSchemeForm.maxLandSize}
                onChange={(e) => setCurrentSchemeForm({ ...currentSchemeForm, maxLandSize: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-stone-250 bg-white dark:bg-stone-900 dark:text-stone-100 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Eligible Categories (comma separated)</label>
            <input
              type="text"
              required
              value={currentSchemeForm.category}
              onChange={(e) => setCurrentSchemeForm({ ...currentSchemeForm, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-250 bg-white dark:bg-stone-900 dark:text-stone-100 focus:outline-none"
              placeholder="small, marginal, large"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Benefits Details</label>
            <textarea
              required
              rows={2}
              value={currentSchemeForm.benefits}
              onChange={(e) => setCurrentSchemeForm({ ...currentSchemeForm, benefits: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-250 bg-white dark:bg-stone-900 dark:text-stone-100 focus:outline-none"
              placeholder="₹6,000 per year..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSchemeModalOpen(false)}
              className="px-4 py-2 border rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold"
            >
              Save Scheme
            </button>
          </div>
        </form>
      </Modal>
      {/* Tab 4: Notice Board */}
      {activeTab === 'notice-board' && (
        <NoticeBoard isAdmin={true} />
      )}

      {/* Tab 5: Complaints Manager Board */}
      {activeTab === 'complaints-manager' && (
        <div className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm p-6">
          <h4 className="font-extrabold text-stone-900 dark:text-white mb-4">Grievance Resolution Queue</h4>
          {!complaints || complaints.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              No citizen grievances have been submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-100 dark:border-stone-850 text-stone-400 font-bold text-xs uppercase">
                    <th className="pb-3">Grievance ID</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Submitted On</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Inspect Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                  {complaints.map((comp: any) => (
                    <tr key={comp.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-850/20 transition">
                      <td className="py-3.5 font-bold text-stone-700 dark:text-stone-300">
                        {comp.id}
                      </td>
                      <td className="py-3.5 font-semibold text-stone-850 dark:text-stone-200 capitalize">
                        {comp.category} Issue
                      </td>
                      <td className="py-3.5 text-xs text-stone-450">
                        {new Date(comp.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            comp.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : comp.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-850'
                          }`}
                        >
                          {comp.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenComplaint(comp)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 ml-auto shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect Issue
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Grievance Inspection Modal */}
      <Modal isOpen={complaintModalOpen} onClose={() => setComplaintModalOpen(false)} title="Inspect & Update Grievance Status">
        {selectedComplaint && (
          <form onSubmit={handleUpdateComplaint} className="space-y-4 text-xs">
            <div className="p-4 bg-stone-50 dark:bg-stone-950/25 border border-stone-100 dark:border-stone-850 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="font-bold text-stone-450">Grievance ID:</span>
                <span className="font-bold text-stone-750 dark:text-stone-250">{selectedComplaint.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-stone-450">Category:</span>
                <span className="font-bold capitalize">{selectedComplaint.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-stone-450">Coordinates:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedComplaint.location}</span>
              </div>
            </div>

            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Issue Description</span>
              <p className="p-3 border border-stone-150 rounded-xl bg-stone-50/50 dark:bg-stone-950/10 leading-relaxed font-semibold text-stone-750 dark:text-stone-300">
                {selectedComplaint.description}
              </p>
            </div>

            {selectedComplaint.photoUrl && (
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Grievance Photo Evidence</span>
                <div className="max-w-[200px] h-32 rounded-xl overflow-hidden border border-stone-150 bg-stone-100">
                  <img
                    src={selectedComplaint.photoUrl}
                    alt="Proof evidence"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Set Resolution Status</label>
                <select
                  value={complaintStatus}
                  onChange={(e: any) => setComplaintStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-250 bg-white dark:bg-stone-900 focus:outline-none font-bold"
                >
                  <option value="pending">Submitted (Pending)</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Official Resolution Remarks</label>
              <textarea
                value={complaintRemarks}
                onChange={(e) => setComplaintRemarks(e.target.value)}
                rows={3}
                placeholder="Enter actions taken, contractor assignments, or resolution verification..."
                className="w-full px-3 py-2 rounded-xl border border-stone-250 bg-white dark:bg-stone-900 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setComplaintModalOpen(false)}
                className="px-4 py-2 border rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingComplaint}
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold"
              >
                {savingComplaint ? 'Saving...' : 'Update Grievance'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Tab 6: Village Directory Info Map */}
      {activeTab === 'village-info' && (
        <VillageDirectory isAdmin={true} />
      )}
    </div>
  );
}
