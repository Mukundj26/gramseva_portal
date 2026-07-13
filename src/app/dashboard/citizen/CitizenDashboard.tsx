'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCollection } from '@/firebase/useCollection';
import { db } from '@/firebase/config';
import { useToast } from '@/components/ui/Toast';
import NoticeBoard from '@/components/NoticeBoard';
import GrievanceBox from '@/components/GrievanceBox';
import VillageDirectory from '@/components/VillageDirectory';
import SmartCalendar from '@/components/SmartCalendar';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Upload,
  Calendar,
  DollarSign,
  MapPin,
  FileCheck,
  Plus,
  Inbox
} from 'lucide-react';

interface CitizenProps {
  currentUser: any;
}

export default function CitizenDashboard({ currentUser }: CitizenProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  
  const activeTab = searchParams.get('tab') || 'overview';

  // Load applications real-time (filtered by citizen uid)
  const { data: applications, loading: appsLoading } = useCollection<any>(
    'applications',
    [{ field: 'userId', operator: '==', value: currentUser.uid }]
  );

  // Load notifications real-time
  const { data: notifications } = useCollection<any>(
    'notifications',
    [{ field: 'userId', operator: '==', value: currentUser.uid }]
  );

  // Form State
  const [certType, setCertType] = useState<'birth' | 'death' | 'income' | 'residence'>('birth');
  const [formData, setFormData] = useState<any>({});
  const [documents, setDocuments] = useState<{ name: string; url: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);

  // Calculate statistics
  const totalApps = applications?.length || 0;
  const pendingApps = applications?.filter((a: any) => a.status === 'pending' || a.status === 'under_verification').length || 0;
  const approvedApps = applications?.filter((a: any) => a.status === 'approved').length || 0;
  const rejectedApps = applications?.filter((a: any) => a.status === 'rejected').length || 0;

  // Handle document upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const fileUrl = reader.result as string;
        setDocuments([{ name: file.name, url: fileUrl }]);
        showToast('Document uploaded successfully!', 'success');

        // Trigger AI Document OCR & Verification
        setOcrLoading(true);
        setOcrResult(null);
        try {
          const response = await fetch('/api/ai/ocr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              documentUrl: fileUrl,
              documentName: file.name,
              certType: certType
            })
          });

          const json = await response.json();
          if (!response.ok) throw new Error(json.error || 'OCR failed');

          const result = json.data;
          setOcrResult(result);

          if (result.isValid) {
            showToast('AI Document Verification Successful! Auto-filling form fields...', 'success');

            // Auto-fill form fields
            setFormData((prev: any) => {
              const updated = { ...prev };
              if (result.extractedName) {
                updated.fullName = result.extractedName;
              }
              if (certType === 'birth' && result.details?.dob) {
                updated.dateOfBirth = result.details.dob;
              }
              if (certType === 'income' && result.details?.annualIncome) {
                updated.annualIncome = result.details.annualIncome;
              }
              if (certType === 'residence' && result.details?.address) {
                updated.address = result.details.address;
              }
              if (certType === 'death' && result.details?.dateOfDeath) {
                updated.dateOfDeath = result.details.dateOfDeath;
              }
              return updated;
            });
          } else {
            showToast(result.remarks || 'AI Document Verification warning.', 'warning');
          }
        } catch (err: any) {
          console.error(err);
          showToast('AI Document Verification was unable to complete, please fill form manually.', 'info');
        } finally {
          setOcrLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate form inputs depending on certType
      if (certType === 'birth') {
        if (!formData.fullName || !formData.dateOfBirth || !formData.placeOfBirth) {
          throw new Error('Please fill in required birth details');
        }
      } else if (certType === 'income') {
        if (!formData.fullName || !formData.annualIncome || !formData.sourceOfIncome) {
          throw new Error('Please fill in required income details');
        }
      } else if (certType === 'residence') {
        if (!formData.fullName || !formData.address || !formData.durationOfStay) {
          throw new Error('Please fill in required residence details');
        }
      } else if (certType === 'death') {
        if (!formData.fullName || !formData.dateOfDeath || !formData.placeOfDeath) {
          throw new Error('Please fill in required death details');
        }
      }

      await db.simulator.submitApplication(
        currentUser.uid,
        formData.fullName,
        certType,
        formData,
        documents
      );

      showToast('Application submitted successfully!', 'success');
      setFormData({});
      setDocuments([]);
      router.push('/dashboard?tab=overview');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit application', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <>
          {/* Dashboard Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Applications</span>
                <h3 className="text-3xl font-black text-stone-850 dark:text-white mt-1">{totalApps}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-55 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Pending / Verifying</span>
                <h3 className="text-3xl font-black text-amber-600 mt-1">{pendingApps}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Approved Certificates</span>
                <h3 className="text-3xl font-black text-emerald-600 mt-1">{approvedApps}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Left: Applications History List */}
            <div className="lg:col-span-2 bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-extrabold text-stone-900 dark:text-white">Certificate History</h4>
                  <p className="text-xs text-stone-500 mt-0.5">List of applications submitted under your profile.</p>
                </div>
                <button
                  onClick={() => router.push('/dashboard?tab=apply')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Apply New
                </button>
              </div>

              {appsLoading ? (
                <div className="space-y-3 py-6">
                  <div className="h-6 bg-stone-100 dark:bg-stone-800 rounded animate-pulse w-full" />
                  <div className="h-12 bg-stone-100 dark:bg-stone-800 rounded animate-pulse w-full" />
                  <div className="h-12 bg-stone-100 dark:bg-stone-800 rounded animate-pulse w-full" />
                </div>
              ) : !applications || applications.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center justify-center">
                  <Inbox className="w-12 h-12 text-stone-300 dark:text-stone-700 mb-3" />
                  <p className="text-sm font-semibold text-stone-500">No applications found</p>
                  <p className="text-xs text-stone-400 mt-1">Get started by applying for a certificate.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-stone-100 dark:border-stone-850 text-stone-400 font-bold text-xs uppercase">
                        <th className="pb-3">App ID</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Submitted On</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-850">
                      {applications.map((app: any) => (
                        <tr key={app.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-850/20 transition">
                          <td className="py-3.5 font-semibold text-stone-800 dark:text-stone-200">
                            {app.id}
                          </td>
                          <td className="py-3.5 capitalize font-medium text-stone-700 dark:text-stone-300">
                            {app.type} Certificate
                          </td>
                          <td className="py-3.5 text-xs text-stone-500 dark:text-stone-400">
                            {new Date(app.submittedAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="py-3.5 text-right">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                app.status === 'approved'
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                  : app.status === 'rejected'
                                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                                  : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                              }`}
                            >
                              {app.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                              {app.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                              {(app.status === 'pending' || app.status === 'under_verification') && (
                                <Clock className="w-3.5 h-3.5 animate-spin" />
                              )}
                              <span className="capitalize">{app.status.replace('_', ' ')}</span>
                            </span>
                            {app.adminRemarks && (
                              <p className="text-[10px] text-stone-500 dark:text-stone-400 italic mt-1 text-right max-w-[200px] truncate ml-auto">
                                Remarks: "{app.adminRemarks}"
                              </p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right: Notifications Feed */}
            <div className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-extrabold text-stone-900 dark:text-white">Recent Alerts</h4>
                <button
                  onClick={() => db.simulator.markNotificationsRead(currentUser.uid)}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  Mark all read
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto flex-1 max-h-[300px]">
                {!notifications || notifications.length === 0 ? (
                  <div className="text-center py-12 text-stone-400 text-xs">
                    No notifications or updates.
                  </div>
                ) : (
                  notifications.map((notif: any) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-xl border transition ${
                        notif.read
                          ? 'bg-stone-50/50 dark:bg-stone-950/20 border-stone-100 dark:border-stone-850 text-stone-500'
                          : 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-950 text-stone-800 dark:text-stone-200 font-medium'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          {notif.title}
                        </span>
                        <span className="text-[9px] text-stone-400">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tab 2: Apply Form */}
      {activeTab === 'apply' && (
        <div className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm p-6 max-w-2xl mx-auto">
          <div className="mb-6">
            <h4 className="font-extrabold text-stone-900 dark:text-white">Apply for Panchayat Certificate</h4>
            <p className="text-xs text-stone-500 mt-1">Select the certificate type, enter details, and upload proofs.</p>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {(['birth', 'death', 'income', 'residence'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setCertType(type);
                  setFormData({});
                  setDocuments([]);
                }}
                className={`py-2 px-3 text-xs font-bold capitalize border rounded-xl shrink-0 transition ${
                  certType === type
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-stone-955 border-stone-250 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50'
                }`}
              >
                {type} Certificate
              </button>
            ))}
          </div>

          <form onSubmit={submitApplication} className="space-y-4">
            {/* Dynamic Form Fields */}
            {certType === 'birth' && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Child's Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName || ''}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Enter full name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={formData.dateOfBirth || ''}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Place of Birth</label>
                    <input
                      type="text"
                      required
                      value={formData.placeOfBirth || ''}
                      onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Hospital, Clinic or Home"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Father's Full Name</label>
                    <input
                      type="text"
                      value={formData.fatherName || ''}
                      onChange={(e) => handleInputChange('fatherName', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Father's name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Mother's Full Name</label>
                    <input
                      type="text"
                      value={formData.motherName || ''}
                      onChange={(e) => handleInputChange('motherName', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Mother's name"
                    />
                  </div>
                </div>
              </>
            )}

            {certType === 'death' && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Deceased Person's Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName || ''}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Enter deceased's full name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Date of Death</label>
                    <input
                      type="date"
                      required
                      value={formData.dateOfDeath || ''}
                      onChange={(e) => handleInputChange('dateOfDeath', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Place of Death</label>
                    <input
                      type="text"
                      required
                      value={formData.placeOfDeath || ''}
                      onChange={(e) => handleInputChange('placeOfDeath', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="E.g. Rampur Village"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Age</label>
                    <input
                      type="number"
                      value={formData.age || ''}
                      onChange={(e) => handleInputChange('age', Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Age at death"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Cause of Death</label>
                    <input
                      type="text"
                      value={formData.causeOfDeath || ''}
                      onChange={(e) => handleInputChange('causeOfDeath', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="E.g. Natural, Heart Attack"
                    />
                  </div>
                </div>
              </>
            )}

            {certType === 'income' && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Applicant's Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName || ''}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Enter full name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Annual Income (INR)</label>
                    <input
                      type="number"
                      required
                      value={formData.annualIncome || ''}
                      onChange={(e) => handleInputChange('annualIncome', Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="E.g. 150000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Source of Income</label>
                    <input
                      type="text"
                      required
                      value={formData.sourceOfIncome || ''}
                      onChange={(e) => handleInputChange('sourceOfIncome', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="E.g. Farming, Labor"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Purpose of Certificate</label>
                  <input
                    type="text"
                    value={formData.purpose || ''}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="E.g. Scholarship, Bank Loan"
                  />
                </div>
              </>
            )}

            {certType === 'residence' && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-505 mb-1.5">Applicant's Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName || ''}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Enter full name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Duration of Stay (Years)</label>
                    <input
                      type="text"
                      required
                      value={formData.durationOfStay || ''}
                      onChange={(e) => handleInputChange('durationOfStay', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="E.g. 15 Years"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Purpose</label>
                    <input
                      type="text"
                      value={formData.purpose || ''}
                      onChange={(e) => handleInputChange('purpose', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="E.g. Ration Card, Voter ID"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Detailed Address in Rampur Village</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Ward No., House details..."
                  />
                </div>
              </>
            )}

            {/* Document Upload Widget */}
            <div className="border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl p-6 text-center hover:border-emerald-500 dark:hover:border-emerald-700 transition">
              <div className="flex flex-col items-center">
                <Upload className="w-10 h-10 text-stone-300 dark:text-stone-700 mb-2" />
                <span className="text-sm font-semibold text-stone-600 dark:text-stone-300">Upload Identity / Address Proof</span>
                <span className="text-xs text-stone-400 mt-1">PDF or image files up to 2MB</span>
                <label className="mt-4 px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-150 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-bold cursor-pointer transition">
                  Browse File
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {documents.length > 0 && (
                <div className="mt-4 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950 rounded-xl flex items-center justify-between text-left">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 truncate">{documents[0].name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDocuments([]);
                      setOcrResult(null);
                    }}
                    className="text-xs text-rose-600 font-bold hover:underline shrink-0 ml-2"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* AI Document Verification (OCR) Status Box */}
            {(ocrLoading || ocrResult) && (
              <div className={`p-4 rounded-xl border transition ${
                ocrLoading
                  ? 'bg-stone-50 dark:bg-stone-950/20 border-stone-200 animate-pulse text-stone-500'
                  : ocrResult.isValid
                    ? 'bg-emerald-55/10 dark:bg-emerald-950/15 border-emerald-500/20 text-emerald-800 dark:text-emerald-400'
                    : 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-500/20 text-amber-800 dark:text-amber-450'
              }`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`inline-block w-2 h-2 rounded-full ${ocrLoading ? 'bg-amber-500 animate-ping' : ocrResult.isValid ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">GramVikas Document AI Check</span>
                </div>
                {ocrLoading ? (
                  <p className="text-xs">Analyzing document metadata and verifying credentials via OCR...</p>
                ) : (
                  <div>
                    <p className="text-xs font-medium">{ocrResult.remarks}</p>
                    {ocrResult.isValid && (
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 font-bold">
                        Extracted Name: {ocrResult.extractedName} • Match Confidence: {Math.round(ocrResult.confidence * 100)}%
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Submit Bar */}
            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard?tab=overview')}
                className="px-5 py-2.5 border border-stone-200 dark:border-stone-850 hover:bg-stone-50 rounded-xl text-xs font-bold transition text-stone-600 dark:text-stone-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || ocrLoading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white rounded-xl text-xs font-bold transition shadow-md"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Notifications Full Panel */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm p-6 max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-extrabold text-stone-900 dark:text-white">All Alerts & Notifications</h4>
              <p className="text-xs text-stone-500 mt-0.5">Real-time status updates and official messages.</p>
            </div>
            <button
              onClick={() => {
                db.simulator.markNotificationsRead(currentUser.uid);
                showToast('All notifications marked as read', 'success');
              }}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Mark all read
            </button>
          </div>

          <div className="space-y-3">
            {!notifications || notifications.length === 0 ? (
              <div className="text-center py-12 text-stone-400 text-xs">
                No notifications or updates.
              </div>
            ) : (
              notifications.map((notif: any) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl border transition ${
                    notif.read
                      ? 'bg-stone-50/50 dark:bg-stone-950/20 border-stone-100 dark:border-stone-850 text-stone-500'
                      : 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-950 text-stone-800 dark:text-stone-200 font-medium shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Notice Board */}
      {activeTab === 'notice-board' && (
        <NoticeBoard />
      )}

      {/* Tab 5: Grievances / Complaint Box */}
      {activeTab === 'complaints' && (
        <GrievanceBox currentUser={currentUser} />
      )}

      {/* Tab 6: Village Directory Info Map */}
      {activeTab === 'village-info' && (
        <VillageDirectory />
      )}

      {/* Tab 7: Smart Calendar */}
      {activeTab === 'calendar' && (
        <SmartCalendar isFarmer={false} />
      )}
    </div>
  );
}
