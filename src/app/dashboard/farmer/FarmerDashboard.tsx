'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDoc } from '@/firebase/useDoc';
import { useCollection } from '@/firebase/useCollection';
import { db } from '@/firebase/config';
import { useToast } from '@/components/ui/Toast';
import {
  Sprout,
  Award,
  CloudSun,
  Map,
  Compass,
  ArrowRight,
  TrendingUp,
  Droplet,
  ShieldAlert,
  Save,
  HelpCircle,
  Thermometer,
  Wind,
  CloudRain
} from 'lucide-react';

interface FarmerProps {
  currentUser: any;
}

export default function FarmerDashboard({ currentUser }: FarmerProps) {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  
  const activeTab = searchParams.get('tab') || 'overview';

  // Load Farmer Profile details
  const { data: farmerProfile, loading: profileLoading } = useDoc<any>('farmers', currentUser.uid);

  // Load AI Recommendation History
  const { data: recHistory } = useCollection<any>(
    'crop_recommendations',
    [{ field: 'userId', operator: '==', value: currentUser.uid }]
  );

  // Load Weather Ref
  const { data: weatherArray } = useCollection<any>('weather');
  const weather = weatherArray?.[0] || {
    temp: 29,
    humidity: 74,
    wind: 11,
    rain: 45,
    condition: 'Partly Cloudy'
  };

  // Farmer Profile form states
  const [landSize, setLandSize] = useState(0);
  const [soilType, setSoilType] = useState('loamy');
  const [waterSource, setWaterSource] = useState('rainfed');
  const [currentCrop, setCurrentCrop] = useState('');
  const [income, setIncome] = useState(0);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Sync profile details once loaded
  useEffect(() => {
    if (farmerProfile) {
      setLandSize(farmerProfile.landSize || 0);
      setSoilType(farmerProfile.soilType || 'loamy');
      setWaterSource(farmerProfile.waterSource || 'rainfed');
      setCurrentCrop(farmerProfile.currentCrop || '');
      setIncome(farmerProfile.income || 0);
    }
  }, [farmerProfile]);

  // AI Crop Advisor States
  const [advisorSoil, setAdvisorSoil] = useState('loamy');
  const [advisorSeason, setAdvisorSeason] = useState('kharif');
  const [advisorWater, setAdvisorWater] = useState('medium');
  const [advisorLocation, setAdvisorLocation] = useState('Rampur Village');
  const [cropAdvisorLoading, setCropAdvisorLoading] = useState(false);
  const [advisorResult, setAdvisorResult] = useState<any>(null);

  // Government Scheme Advisor States
  const [schemeIncome, setSchemeIncome] = useState(0);
  const [schemeLand, setSchemeLand] = useState(0);
  const [schemeCategory, setSchemeCategory] = useState('marginal');
  const [schemeAdvisorLoading, setSchemeAdvisorLoading] = useState(false);
  const [schemeResults, setSchemeResults] = useState<any[]>([]);

  // Update Farmer profile in db
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await db.simulator.updateFarmerProfile(currentUser.uid, {
        landSize: Number(landSize),
        soilType: soilType as any,
        waterSource: waterSource as any,
        currentCrop,
        income: Number(income),
      });
      showToast('Farmer Profile updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Submit Crop Advisor Request
  const handleAskAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    setCropAdvisorLoading(true);
    setAdvisorResult(null);

    try {
      const response = await fetch('/api/ai/crop-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soilType: advisorSoil,
          season: advisorSeason,
          location: advisorLocation,
          waterAvailability: advisorWater,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'API Request failed');
      }

      setAdvisorResult(json.data);
      showToast('AI Crop Advisor suggestion complete!', 'success');

      // Auto-save this recommendation in db
      db.simulator.saveCropRecommendation(
        currentUser.uid,
        advisorSoil,
        advisorSeason,
        advisorWater,
        json.data
      );
    } catch (err: any) {
      showToast(err.message || 'AI request failed', 'error');
    } finally {
      setCropAdvisorLoading(false);
    }
  };

  // Submit Scheme Recommendation Request
  const handleMatchSchemes = async (e: React.FormEvent) => {
    e.preventDefault();
    setSchemeAdvisorLoading(true);
    setSchemeResults([]);

    try {
      const response = await fetch('/api/ai/scheme-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income: schemeIncome,
          landSize: schemeLand,
          category: schemeCategory,
          cropType: currentCrop,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'API Request failed');
      }

      setSchemeResults(json.data || []);
      showToast(`Found ${json.data?.length || 0} eligible schemes!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'AI request failed', 'error');
    } finally {
      setSchemeAdvisorLoading(false);
    }
  };

  // Pre-populate scheme values from profile on tab activation
  useEffect(() => {
    if (activeTab === 'schemes' && farmerProfile) {
      setSchemeIncome(farmerProfile.income || 0);
      setSchemeLand(farmerProfile.landSize || 0);
      setSchemeCategory(farmerProfile.category || 'marginal');
    }
    if (activeTab === 'crop-advisor' && farmerProfile) {
      setAdvisorSoil(farmerProfile.soilType || 'loamy');
    }
  }, [activeTab, farmerProfile]);

  return (
    <div className="space-y-6">
      {/* Tab 1: Overview & Profile Setup */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm p-6">
              <div className="mb-6">
                <h4 className="font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                  <Map className="w-5 h-5 text-emerald-600" />
                  Land & Agricultural Profile
                </h4>
                <p className="text-xs text-stone-500 mt-1">Configure your land specifications to customize AI scheme matching and soil advice.</p>
              </div>

              {profileLoading ? (
                <div className="h-40 bg-stone-100 dark:bg-stone-850 rounded animate-pulse" />
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Land Size (Acres)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={landSize}
                        onChange={(e) => setLandSize(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        placeholder="E.g. 3.5"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Soil Type</label>
                      <select
                        value={soilType}
                        onChange={(e) => setSoilType(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="clay">Clay Soil</option>
                        <option value="sandy">Sandy Soil</option>
                        <option value="loamy">Loamy Soil</option>
                        <option value="alluvial">Alluvial Soil</option>
                        <option value="black">Black Soil</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Irrigation / Water Source</label>
                      <select
                        value={waterSource}
                        onChange={(e) => setWaterSource(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="rainfed">Rainfed</option>
                        <option value="canal">Canal Irrigation</option>
                        <option value="borewell">Borewell Tube</option>
                        <option value="drip">Drip / Sprinkler</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Active Crop Sowed</label>
                      <input
                        type="text"
                        value={currentCrop}
                        onChange={(e) => setCurrentCrop(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        placeholder="E.g. Rice, Wheat"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Annual Farming Income (INR)</label>
                    <input
                      type="number"
                      value={income}
                      onChange={(e) => setIncome(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="E.g. 150000"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-850">
                    <span className="text-xs font-semibold text-stone-400">
                      Calculated Category:{' '}
                      <span className="font-bold text-emerald-600 capitalize">
                        {farmerProfile?.category || 'marginal'} Farmer
                      </span>
                    </span>
                    <button
                      type="submit"
                      disabled={updatingProfile}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                      {updatingProfile ? 'Saving...' : 'Save Configuration'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* AI Advisor History Panel */}
            <div className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm p-6">
              <h4 className="font-extrabold text-stone-900 dark:text-white mb-4">Previous AI Crop Reports</h4>
              {!recHistory || recHistory.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs">
                  No previous suggestions found.
                </div>
              ) : (
                <div className="space-y-4">
                  {recHistory.slice(0, 3).map((item: any) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-stone-100 dark:border-stone-850 bg-stone-50/50 dark:bg-stone-950/20 hover:border-emerald-600/10 transition"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                          {item.recommendation.bestCrop}
                        </span>
                        <span className="text-[10px] text-stone-400 font-bold uppercase">
                          {item.season} season • {item.soilType} Soil
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                        Yield: {item.recommendation.expectedYield}. Fertilizer: {item.recommendation.fertilizerSuggestion}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Mini Weather Widget */}
          <div className="space-y-6">
            <div className="bg-emerald-800 dark:bg-emerald-950/80 p-6 rounded-2xl text-white shadow-md relative overflow-hidden flex flex-col justify-between h-full min-h-[300px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-emerald-100 uppercase tracking-wide">Weather Station</h4>
                  <p className="text-xs text-emerald-200 mt-0.5">Rampur Panchayat Telemetry</p>
                </div>
                <CloudSun className="w-8 h-8 text-amber-300 animate-bounce" />
              </div>

              <div className="relative z-10 my-6">
                <h3 className="text-5xl font-black">{weather.temp}°C</h3>
                <p className="text-sm font-semibold mt-1 text-emerald-100 capitalize">{weather.condition}</p>
              </div>

              <div className="relative z-10 grid grid-cols-3 gap-2 pt-4 border-t border-white/10 text-center">
                <div>
                  <span className="text-[10px] text-emerald-250 font-bold block uppercase tracking-wider">Humidity</span>
                  <span className="text-sm font-extrabold">{weather.humidity}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-250 font-bold block uppercase tracking-wider">Wind</span>
                  <span className="text-sm font-extrabold">{weather.wind} km/h</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-250 font-bold block uppercase tracking-wider">Rain</span>
                  <span className="text-sm font-extrabold">{weather.rain}%</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl">
              <h5 className="font-bold text-xs text-stone-500 uppercase tracking-wider mb-2.5">Agri Advice for Today</h5>
              <p className="text-xs text-stone-600 dark:text-stone-405 leading-relaxed">
                With a {weather.rain}% rain forecast and {weather.humidity}% humidity, we recommend inspecting leaves for signs of mildew or blight. Delay fertilizer sprays if rain occurs within the next 4 hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AI Crop Advisor */}
      {activeTab === 'crop-advisor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Parameter form */}
          <div className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm p-6 h-fit">
            <div className="mb-6">
              <h4 className="font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-600" />
                AI Crop Advisor
              </h4>
              <p className="text-xs text-stone-500 mt-1">Consult Gemini 1.5 Flash to plan your next agricultural season.</p>
            </div>

            <form onSubmit={handleAskAdvisor} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Soil Type</label>
                <select
                  value={advisorSoil}
                  onChange={(e) => setAdvisorSoil(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="clay">Clay Soil</option>
                  <option value="sandy">Sandy Soil</option>
                  <option value="loamy">Loamy Soil</option>
                  <option value="alluvial">Alluvial Soil</option>
                  <option value="black">Black Soil</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Season</label>
                <select
                  value={advisorSeason}
                  onChange={(e) => setAdvisorSeason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="kharif">Kharif (Monsoon Sowing)</option>
                  <option value="rabi">Rabi (Winter Sowing)</option>
                  <option value="zaid">Zaid (Summer Sowing)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Water Availability</label>
                <select
                  value={advisorWater}
                  onChange={(e) => setAdvisorWater(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="low">Low (Rainfed only)</option>
                  <option value="medium">Medium (Canal / Shared tube)</option>
                  <option value="high">High (Borewell / Abundant)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Location / region</label>
                <input
                  type="text"
                  value={advisorLocation}
                  onChange={(e) => setAdvisorLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={cropAdvisorLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
              >
                {cropAdvisorLoading ? (
                  <>
                    <span className="border-2 border-white/30 border-t-white w-4 h-4 rounded-full animate-spin" />
                    <span>Gemini is thinking...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Advisory</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* AI Result Card */}
          <div className="lg:col-span-2 space-y-6">
            {!advisorResult && !cropAdvisorLoading && (
              <div className="bg-white dark:bg-stone-900 border border-dashed border-stone-250 dark:border-stone-850 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
                <HelpCircle className="w-12 h-12 text-stone-300 dark:text-stone-700 mb-3" />
                <h5 className="font-extrabold text-stone-700 dark:text-stone-300">Awaiting Parameters</h5>
                <p className="text-xs text-stone-400 mt-1 max-w-sm">Configure parameters on the left and click Generate to run the AI flow.</p>
              </div>
            )}

            {cropAdvisorLoading && (
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl p-8 space-y-6 animate-pulse">
                <div className="h-8 bg-stone-100 dark:bg-stone-800 rounded w-1/3" />
                <div className="space-y-3">
                  <div className="h-4 bg-stone-100 dark:bg-stone-800 rounded w-full" />
                  <div className="h-4 bg-stone-100 dark:bg-stone-800 rounded w-5/6" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-20 bg-stone-100 dark:bg-stone-800 rounded" />
                  <div className="h-20 bg-stone-100 dark:bg-stone-800 rounded" />
                </div>
              </div>
            )}

            {advisorResult && (
              <div className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm p-6 space-y-6">
                <div className="flex justify-between items-start border-b border-stone-100 dark:border-stone-850 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-0.5">Gemini Recommended Crop</span>
                    <h3 className="text-2xl font-black text-stone-850 dark:text-white">{advisorResult.bestCrop}</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 text-xs font-bold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Expected Yield: {advisorResult.expectedYield}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-stone-50 dark:bg-stone-950/30 rounded-xl border border-stone-100 dark:border-stone-850">
                    <span className="font-bold text-xs uppercase tracking-wider text-stone-400 block mb-2">Fertilizer Regime</span>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{advisorResult.fertilizerSuggestion}</p>
                  </div>
                  <div className="p-4 bg-stone-50 dark:bg-stone-950/30 rounded-xl border border-stone-100 dark:border-stone-850">
                    <span className="font-bold text-xs uppercase tracking-wider text-stone-400 block mb-2">Irrigation Advice</span>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{advisorResult.irrigationAdvice}</p>
                  </div>
                  <div className="p-4 bg-stone-50 dark:bg-stone-950/30 rounded-xl border border-stone-100 dark:border-stone-850">
                    <span className="font-bold text-xs uppercase tracking-wider text-stone-400 block mb-2">Pest Prevention</span>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{advisorResult.pestPrevention}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Scheme Matcher */}
      {activeTab === 'schemes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile parameters check */}
          <div className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm p-6 h-fit">
            <div className="mb-6">
              <h4 className="font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                Scheme Suggester
              </h4>
              <p className="text-xs text-stone-500 mt-1">Cross-check active government schemes with your financials.</p>
            </div>

            <form onSubmit={handleMatchSchemes} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Annual Farming Income</label>
                <input
                  type="number"
                  value={schemeIncome}
                  onChange={(e) => setSchemeIncome(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Land Holding (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  value={schemeLand}
                  onChange={(e) => setSchemeLand(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Farmer Category</label>
                <select
                  value={schemeCategory}
                  onChange={(e) => setSchemeCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="marginal">Marginal (Smallest holdings)</option>
                  <option value="small">Small holding</option>
                  <option value="large">Large farmer</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={schemeAdvisorLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
              >
                {schemeAdvisorLoading ? (
                  <>
                    <span className="border-2 border-white/30 border-t-white w-4 h-4 rounded-full animate-spin" />
                    <span>Matching Schemes...</span>
                  </>
                ) : (
                  <>
                    <span>Match Eligible Schemes</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Match Results */}
          <div className="lg:col-span-2 space-y-4">
            {schemeResults.length === 0 && !schemeAdvisorLoading && (
              <div className="bg-white dark:bg-stone-900 border border-dashed border-stone-250 dark:border-stone-850 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
                <Award className="w-12 h-12 text-stone-300 dark:text-stone-700 mb-3" />
                <h5 className="font-extrabold text-stone-700 dark:text-stone-300">Run Scheme Check</h5>
                <p className="text-xs text-stone-400 mt-1 max-w-sm">Confirm profile details and click Match to search active central and state database listings.</p>
              </div>
            )}

            {schemeAdvisorLoading && (
              <div className="space-y-3">
                <div className="h-28 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl animate-pulse" />
                <div className="h-28 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl animate-pulse" />
              </div>
            )}

            {schemeResults.length > 0 &&
              schemeResults.map((scheme: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm p-6 space-y-4"
                >
                  <div className="flex justify-between items-start border-b border-stone-100 dark:border-stone-850 pb-3">
                    <div>
                      <h4 className="font-extrabold text-stone-850 dark:text-white text-base">{scheme.name}</h4>
                      <p className="text-xs text-stone-500 mt-0.5">{scheme.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-emerald-50/30 dark:bg-emerald-950/15 border border-emerald-100/50 dark:border-emerald-950 rounded-xl">
                      <span className="font-bold text-[10px] uppercase text-emerald-800 dark:text-emerald-400 block mb-1">Financial Benefits</span>
                      <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">{scheme.benefits}</p>
                    </div>
                    <div className="p-3.5 bg-stone-50 dark:bg-stone-950/30 border border-stone-100 dark:border-stone-850 rounded-xl flex gap-2">
                      <Compass className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[10px] uppercase text-stone-400 block mb-1">Why Recommended</span>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">{scheme.whyRecommended}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab 4: Weather Dashboard */}
      {activeTab === 'weather' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-sm text-center">
              <Thermometer className="w-8 h-8 text-rose-500 mx-auto mb-2" />
              <span className="text-xs text-stone-450 uppercase font-bold tracking-wider block">Temperature</span>
              <h3 className="text-2xl font-black text-stone-850 dark:text-white mt-1">{weather.temp}°C</h3>
            </div>
            <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-sm text-center">
              <Wind className="w-8 h-8 text-sky-500 mx-auto mb-2" />
              <span className="text-xs text-stone-450 uppercase font-bold tracking-wider block">Wind Speed</span>
              <h3 className="text-2xl font-black text-stone-850 dark:text-white mt-1">{weather.wind} km/h</h3>
            </div>
            <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-sm text-center">
              <CloudRain className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <span className="text-xs text-stone-450 uppercase font-bold tracking-wider block">Precipitation</span>
              <h3 className="text-2xl font-black text-stone-850 dark:text-white mt-1">{weather.rain}%</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm p-6">
            <h4 className="font-extrabold text-stone-900 dark:text-white mb-4">Sowing & Harvest Guidance</h4>
            <div className="space-y-4">
              <div className="flex gap-3 items-start p-3 bg-stone-50 dark:bg-stone-950/20 rounded-xl">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                  <strong>Moisture Level check:</strong> The humidity is at {weather.humidity}%. Avoid storage of harvested grains in open sheds as high relative humidity can invite fungal spores. Keep grain moisture below 12% before bagging.
                </p>
              </div>

              <div className="flex gap-3 items-start p-3 bg-stone-50 dark:bg-stone-950/20 rounded-xl">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                  <strong>Rainfall Alert:</strong> Rain chance is {weather.rain}%. If you plan to apply top-dress urea, wait until cloud conditions clear to prevent nitrogen runoff.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
