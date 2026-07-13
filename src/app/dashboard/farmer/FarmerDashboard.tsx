'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDoc } from '@/firebase/useDoc';
import { useCollection } from '@/firebase/useCollection';
import { db } from '@/firebase/config';
import { useToast } from '@/components/ui/Toast';
import NoticeBoard from '@/components/NoticeBoard';
import GrievanceBox from '@/components/GrievanceBox';
import VillageDirectory from '@/components/VillageDirectory';
import SmartCalendar from '@/components/SmartCalendar';
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
  CloudRain,
  Bot,
  Upload
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

  // Weather Search States
  const [weatherSearchInput, setWeatherSearchInput] = useState('Rampur');
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Crop Disease Scanner States
  const [diseaseCropName, setDiseaseCropName] = useState('Rice');
  const [diseaseImage, setDiseaseImage] = useState<string | null>(null);
  const [diseaseImageName, setDiseaseImageName] = useState('');
  const [diseaseLoading, setDiseaseLoading] = useState(false);
  const [diseaseResult, setDiseaseResult] = useState<any>(null);
  const [diseaseError, setDiseaseError] = useState<string | null>(null);

  // AI Weather Advisor States
  const [weatherAdviceLoading, setWeatherAdviceLoading] = useState(false);
  const [weatherAdviceResult, setWeatherAdviceResult] = useState<any>(null);
  const [weatherAdviceError, setWeatherAdviceError] = useState<string | null>(null);

  const handleGenerateWeatherAdvice = async () => {
    setWeatherAdviceLoading(true);
    setWeatherAdviceError(null);
    setWeatherAdviceResult(null);

    try {
      const response = await fetch('/api/ai/weather-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temp: weather.temp,
          wind: weather.wind,
          rain: weather.rain,
          humidity: weather.humidity,
          condition: weather.condition,
          activeCrop: farmerProfile?.currentCrop || 'Rice',
          soilType: farmerProfile?.soilType || 'loamy'
        })
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to generate advisory');

      setWeatherAdviceResult(json.data);
      showToast('AI Weather Advisory generated successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      setWeatherAdviceError(err.message || 'Advisory check failed.');
      showToast(err.message || 'Advisory generation failed', 'error');
    } finally {
      setWeatherAdviceLoading(false);
    }
  };
  // Market Info States
  const [marketCrop, setMarketCrop] = useState('onion');
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketData, setMarketData] = useState<any>(null);
  const [marketError, setMarketError] = useState<string | null>(null);

  const fetchMarketData = async (cropToQuery: string) => {
    setMarketLoading(true);
    setMarketError(null);
    try {
      const response = await fetch('/api/ai/market-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop: cropToQuery })
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to fetch market data');
      setMarketData(json);
    } catch (err: any) {
      console.error(err);
      setMarketError(err.message || 'Error pulling mandi prices.');
    } finally {
      setMarketLoading(false);
    }
  };

  // Run initial fetch for the selected crop or farmer current crop
  useEffect(() => {
    if (activeTab === 'market-info') {
      const cropToFetch = farmerProfile?.currentCrop || 'onion';
      setMarketCrop(cropToFetch.toLowerCase());
      fetchMarketData(cropToFetch.toLowerCase());
    }
  }, [activeTab, farmerProfile?.currentCrop]);
  const handleDiseaseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDiseaseImage(reader.result as string);
        setDiseaseImageName(file.name);
        setDiseaseResult(null);
        setDiseaseError(null);
        showToast('Leaf image uploaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diseaseImage) {
      showToast('Please select or upload a crop leaf image first.', 'warning');
      return;
    }

    setDiseaseLoading(true);
    setDiseaseError(null);
    setDiseaseResult(null);

    try {
      const response = await fetch('/api/ai/disease-detector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: diseaseImage,
          imageName: diseaseImageName,
          cropName: diseaseCropName
        })
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Pathology scan failed');

      setDiseaseResult(json.data);
      showToast('Pathology scanning complete! Diagnosis generated.', 'success');
    } catch (err: any) {
      console.error(err);
      setDiseaseError(err.message || 'Verification failed.');
      showToast(err.message || 'Scan failed', 'error');
    } finally {
      setDiseaseLoading(false);
    }
  };

  const handleSimulateDiseasePreset = (presetType: 'blast' | 'rust' | 'armyworm') => {
    setDiseaseResult(null);
    setDiseaseError(null);

    const presets = {
      blast: {
        name: 'rice_blast_lesions.jpg',
        crop: 'Rice',
        img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' // mock single pixel
      },
      rust: {
        name: 'wheat_yellow_rust_leaf.jpg',
        crop: 'Wheat',
        img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      },
      armyworm: {
        name: 'maize_fall_armyworm_damage.jpg',
        crop: 'Maize',
        img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      }
    };

    const choice = presets[presetType];
    setDiseaseImage(choice.img);
    setDiseaseImageName(choice.name);
    setDiseaseCropName(choice.crop);
    
    showToast(`Pre-loaded simulated scan for ${choice.crop} disease! Click Scan to diagnose.`, 'info');
  };

  // Sync initial weather search input with current weather location name
  useEffect(() => {
    if (weather && weather.location && weatherSearchInput === 'Rampur') {
      setWeatherSearchInput(weather.location.split(',')[0]);
    }
  }, [weather]);

  const handleFetchLiveWeather = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weatherSearchInput.trim()) return;

    setWeatherLoading(true);
    setWeatherError(null);

    try {
      // 1. Geocode location name using Open-Meteo Geocoding API
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(weatherSearchInput)}&count=1&language=en&format=json`
      );
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error(`Location "${weatherSearchInput}" not found.`);
      }

      const location = geoData.results[0];
      const { latitude, longitude, name, admin1, country } = location;
      const formattedLocation = `${name}${admin1 ? `, ${admin1}` : ''}, ${country}`;

      // 2. Fetch weather details from Open-Meteo Forecast API
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&daily=precipitation_probability_max&timezone=auto`
      );
      const weatherData = await weatherResponse.json();

      if (!weatherData.current) {
        throw new Error('Failed to retrieve weather data.');
      }

      // Map weather codes to condition string
      const getWeatherCondition = (code: number): string => {
        if (code === 0) return 'Clear Sky';
        if (code === 1 || code === 2 || code === 3) return 'Partly Cloudy';
        if (code === 45 || code === 48) return 'Foggy';
        if (code >= 51 && code <= 57) return 'Drizzle';
        if (code >= 61 && code <= 67) return 'Rainy';
        if (code >= 71 && code <= 77) return 'Snowy';
        if (code >= 80 && code <= 82) return 'Rain Showers';
        if (code >= 85 && code <= 86) return 'Snow Showers';
        if (code >= 95 && code <= 99) return 'Thunderstorm';
        return 'Overcast';
      };

      const temp = Math.round(weatherData.current.temperature_2m);
      const humidity = Math.round(weatherData.current.relative_humidity_2m);
      const wind = Math.round(weatherData.current.wind_speed_10m);
      
      // Get rain probability from daily if available, else fallback
      let rain = 10;
      if (weatherData.daily?.precipitation_probability_max?.[0] !== undefined) {
        rain = Math.round(weatherData.daily.precipitation_probability_max[0]);
      } else if (weatherData.current.precipitation > 0) {
        rain = 85;
      } else if (weatherData.current.weather_code >= 51) {
        rain = 70;
      }

      const condition = getWeatherCondition(weatherData.current.weather_code);

      // 3. Update simulated database weather record
      db.simulator.updateWeather({
        temp,
        humidity,
        wind,
        rain,
        condition,
        location: formattedLocation,
      });

      showToast(`Weather updated for ${formattedLocation}!`, 'success');
    } catch (err: any) {
      console.error(err);
      setWeatherError(err.message || 'An error occurred while fetching weather.');
      showToast(err.message || 'Weather fetch failed', 'error');
    } finally {
      setWeatherLoading(false);
    }
  };

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
                  <p className="text-xs text-emerald-200 mt-0.5">{weather.location || 'Rampur Panchayat Telemetry'}</p>
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
          {/* Weather Location Search Card */}
          <div className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm p-6">
            <h4 className="font-extrabold text-stone-900 dark:text-white mb-2 flex items-center gap-2">
              <CloudSun className="w-5 h-5 text-emerald-600" />
              Live Weather Telemetry
            </h4>
            <p className="text-xs text-stone-500 mb-4">
              Enter any city or village to query public weather sensors and fetch real-time atmospheric updates for that location.
            </p>
            <form onSubmit={handleFetchLiveWeather} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={weatherSearchInput}
                  onChange={(e) => setWeatherSearchInput(e.target.value)}
                  placeholder="E.g. Pune, Rampur, Mumbai, London"
                  className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-100 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <button
                type="submit"
                disabled={weatherLoading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shrink-0"
              >
                {weatherLoading ? (
                  <>
                    <span className="border-2 border-white/30 border-t-white w-4 h-4 rounded-full animate-spin" />
                    <span>Querying sensors...</span>
                  </>
                ) : (
                  <span>Get Live Weather</span>
                )}
              </button>
            </form>
            {weather.location && !weatherError && (
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-3 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                Active Station: {weather.location}
              </p>
            )}
            {weatherError && (
              <p className="text-xs font-semibold text-rose-600 mt-3">
                Error: {weatherError}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-sm text-center">
              <Thermometer className="w-8 h-8 text-rose-500 mx-auto mb-2" />
              <span className="text-xs text-stone-450 uppercase font-bold tracking-wider block">Temperature</span>
              <h3 className="text-2xl font-black text-stone-850 dark:text-white mt-1">{weather.temp}°C</h3>
              <p className="text-[10px] text-stone-400 mt-0.5 capitalize">{weather.condition}</p>
            </div>
            <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-sm text-center">
              <Wind className="w-8 h-8 text-sky-500 mx-auto mb-2" />
              <span className="text-xs text-stone-450 uppercase font-bold tracking-wider block">Wind Speed</span>
              <h3 className="text-2xl font-black text-stone-850 dark:text-white mt-1">{weather.wind} km/h</h3>
              <p className="text-[10px] text-stone-400 mt-0.5">Surface Level</p>
            </div>
            <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-sm text-center">
              <CloudRain className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <span className="text-xs text-stone-450 uppercase font-bold tracking-wider block">Precipitation</span>
              <h3 className="text-2xl font-black text-stone-850 dark:text-white mt-1">{weather.rain}%</h3>
              <p className="text-[10px] text-stone-400 mt-0.5">Probability</p>
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
                  <strong>Rainfall Alert:</strong> Rain chance is {weather.rain}%. {weather.rain > 50 ? 'High probability of precipitation detected. Protect vulnerable open crops, postpone any scheduled chemical sprays, and clear drainage channels.' : 'Low rain threat. Safe to execute standard irrigation schedules and top-dress urea.'}
                </p>
              </div>

              {weather.wind > 25 && (
                <div className="flex gap-3 items-start p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                  <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                    <strong>High Wind Warning:</strong> Surface winds are strong at {weather.wind} km/h. Secure tall crops (like sugarcane or maize) to prevent lodging. Postpone crop dusting or high-pressure watering.
                  </p>
                </div>
              )}

              {weather.temp > 35 && (
                <div className="flex gap-3 items-start p-3 bg-rose-50 dark:bg-rose-950/20 rounded-xl">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0 mt-1.5" />
                  <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                    <strong>Heat Stress Advisory:</strong> Temperatures are high ({weather.temp}°C). Increase early morning or late evening watering cycles to reduce evapotranspiration losses. Protect young saplings using temporary crop covers.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* AI Weather Advisor Integration */}
          <div className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h4 className="font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-emerald-600" />
                  Gemini AI Weather Strategy
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">Generate a crop and soil-specific sowing & harvest advisory based on live weather readings.</p>
              </div>
              <button
                type="button"
                onClick={handleGenerateWeatherAdvice}
                disabled={weatherAdviceLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shrink-0"
              >
                {weatherAdviceLoading ? (
                  <>
                    <span className="border-2 border-white/30 border-t-white w-4.5 h-4.5 rounded-full animate-spin" />
                    <span>Formulating...</span>
                  </>
                ) : (
                  <span>Formulate AI Strategy</span>
                )}
              </button>
            </div>

            {weatherAdviceResult && (
              <div className="space-y-4 pt-4 border-t border-stone-100 dark:border-stone-850 animate-in fade-in-30 duration-200">
                <div className="p-4 bg-stone-50 dark:bg-stone-950/20 border border-stone-200 dark:border-stone-850 rounded-xl">
                  <h5 className="font-bold text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-1">AI Sowing & Irrigation Guide</h5>
                  <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300">{weatherAdviceResult.irrigationStrategy}</p>
                </div>
                <div className="p-4 bg-stone-50 dark:bg-stone-950/20 border border-stone-200 dark:border-stone-850 rounded-xl">
                  <h5 className="font-bold text-xs text-sky-700 dark:text-sky-400 uppercase tracking-wide mb-1">AI Fertilizer & Chemical Spray Safe-Window</h5>
                  <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300">{weatherAdviceResult.sprayAdvisory}</p>
                </div>
                <div className="p-4 bg-stone-50 dark:bg-stone-950/20 border border-stone-200 dark:border-stone-850 rounded-xl">
                  <h5 className="font-bold text-xs text-amber-700 dark:text-amber-450 uppercase tracking-wide mb-1">AI Harvesting & Warehouse Storage Advisor</h5>
                  <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300">{weatherAdviceResult.harvestStorage}</p>
                </div>
              </div>
            )}

            {weatherAdviceError && (
              <p className="text-xs text-rose-600 mt-2">Error: {weatherAdviceError}</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Crop Health Scanner */}
      {activeTab === 'crop-health' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Left Column: Image Upload & Parameters */}
          <div className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm p-6 h-fit space-y-6">
            <div>
              <h4 className="font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-600" />
                AI Crop Disease Scanner
              </h4>
              <p className="text-xs text-stone-500 mt-1">Upload a photo of your leaf/crop or choose a preset to scan for diseases.</p>
            </div>

            {/* Simulation Presets */}
            <div className="p-4 bg-stone-50 dark:bg-stone-950/20 border border-stone-200 dark:border-stone-850 rounded-xl space-y-3">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide block">Test Simulation Presets</span>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulateDiseasePreset('blast')}
                  className="w-full py-2 px-3 text-left text-xs font-semibold bg-white dark:bg-stone-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-stone-250 dark:border-stone-800 rounded-xl transition text-stone-700 dark:text-stone-300"
                >
                  🌾 Rice Leaf Blast Disease
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateDiseasePreset('rust')}
                  className="w-full py-2 px-3 text-left text-xs font-semibold bg-white dark:bg-stone-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-stone-250 dark:border-stone-800 rounded-xl transition text-stone-700 dark:text-stone-300"
                >
                  🌾 Wheat Stripe Rust Disease
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateDiseasePreset('armyworm')}
                  className="w-full py-2 px-3 text-left text-xs font-semibold bg-white dark:bg-stone-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-stone-250 dark:border-stone-800 rounded-xl transition text-stone-700 dark:text-stone-300"
                >
                  🌽 Maize Fall Armyworm
                </button>
              </div>
            </div>

            <form onSubmit={handleScanCrop} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">Crop Name</label>
                <input
                  type="text"
                  value={diseaseCropName}
                  onChange={(e) => setDiseaseCropName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 dark:text-stone-105 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="E.g. Rice, Wheat, Tomato"
                  required
                />
              </div>

              {/* Upload image box */}
              <div className="border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-xl p-4 text-center hover:border-emerald-500 dark:hover:border-emerald-700 transition relative">
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 text-stone-350 dark:text-stone-750 mb-1.5" />
                  <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">Upload Diseased Leaf Photo</span>
                  <label className="mt-3 px-3 py-1.5 bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 text-stone-700 dark:text-stone-200 rounded-lg text-[10px] font-bold cursor-pointer transition">
                    Browse Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDiseaseFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {diseaseImage && (
                  <div className="mt-3 p-2 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950 rounded-lg flex items-center justify-between text-left">
                    <span className="text-[10px] font-semibold text-stone-700 dark:text-stone-300 truncate max-w-[150px]">{diseaseImageName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setDiseaseImage(null);
                        setDiseaseImageName('');
                      }}
                      className="text-[10px] text-rose-600 font-bold hover:underline shrink-0 ml-1"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={diseaseLoading || !diseaseImage}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
              >
                {diseaseLoading ? (
                  <>
                    <span className="border-2 border-white/30 border-t-white w-4 h-4 rounded-full animate-spin" />
                    <span>Gemini is diagnosing...</span>
                  </>
                ) : (
                  <span>Diagnose Leaf Disease</span>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: AI Disease Classification Result */}
          <div className="lg:col-span-2 space-y-6">
            {!diseaseResult && !diseaseLoading && (
              <div className="bg-white dark:bg-stone-900 border border-dashed border-stone-250 dark:border-stone-850 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[350px]">
                <Bot className="w-12 h-12 text-stone-300 dark:text-stone-700 mb-3" />
                <h5 className="font-extrabold text-stone-700 dark:text-stone-300">Awaiting Pathology Image</h5>
                <p className="text-xs text-stone-400 mt-1 max-w-sm">Upload a photo of the infected crop or click one of the simulation presets, then click Diagnose.</p>
              </div>
            )}

            {diseaseLoading && (
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl p-8 space-y-6 animate-pulse min-h-[350px]">
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

            {diseaseResult && (
              <div className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm p-6 space-y-6 animate-in fade-in-30 duration-200">
                <div className="flex justify-between items-start border-b border-stone-100 dark:border-stone-850 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block mb-0.5">Diagnosed Crop Disease</span>
                    <h3 className="text-xl font-black text-stone-850 dark:text-white">{diseaseResult.diseaseName}</h3>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                    diseaseResult.severity === 'Critical' 
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-350'
                      : diseaseResult.severity === 'High'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-350'
                        : 'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-350'
                  }`}>
                    Severity: {diseaseResult.severity}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-stone-50 dark:bg-stone-950/30 rounded-xl border border-stone-100 dark:border-stone-850">
                    <span className="font-bold text-xs uppercase tracking-wider text-stone-400 block mb-2">Key Symptoms</span>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{diseaseResult.symptoms}</p>
                  </div>
                  <div className="p-4 bg-stone-50 dark:bg-stone-950/30 rounded-xl border border-stone-100 dark:border-stone-850">
                    <span className="font-bold text-xs uppercase tracking-wider text-stone-400 block mb-2">Biological Cause</span>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{diseaseResult.cause}</p>
                  </div>
                </div>

                <div className="space-y-4 border-t border-stone-100 dark:border-stone-850 pt-4">
                  <div>
                    <h5 className="font-bold text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-1.5">Recommended Organic Treatment</h5>
                    <p className="text-xs text-stone-750 dark:text-stone-300 leading-relaxed">{diseaseResult.organicTreatment}</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-stone-700 dark:text-stone-350 uppercase tracking-wide mb-1.5">Recommended Chemical Treatment</h5>
                    <p className="text-xs text-stone-750 dark:text-stone-300 leading-relaxed">{diseaseResult.chemicalTreatment}</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-stone-500 uppercase tracking-wide mb-1.5">Future Prevention Advisory</h5>
                    <p className="text-xs text-stone-750 dark:text-stone-405 leading-relaxed">{diseaseResult.prevention}</p>
                  </div>
                </div>

                <p className="text-[10px] text-stone-400 italic text-right">Diagnosis engine: {diseaseResult.source || 'Gemini 1.5 Flash (Vision)'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Market Information (Mandi Prices) */}
      {activeTab === 'market-info' && (
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Top Banner: Crop Select Selector & Main Recommendation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Mandi Intelligence
                </h4>
                <p className="text-xs text-stone-500 mt-1">Select a crop to fetch regional wholesale prices and comparative analysis.</p>
              </div>

              <div className="mt-4 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400">Target Crop</label>
                <div className="flex gap-2">
                  <select
                    value={marketCrop}
                    onChange={(e) => {
                      setMarketCrop(e.target.value);
                      fetchMarketData(e.target.value);
                    }}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-stone-250 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs font-semibold text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="sugarcane">Sugarcane</option>
                    <option value="onion">Onion</option>
                    <option value="tomato">Tomato</option>
                    <option value="potato">Potato</option>
                    <option value="wheat">Wheat</option>
                    <option value="rice">Rice</option>
                    <option value="chilli">Chilli</option>
                    <option value="mango">Mango</option>
                    <option value="banana">Banana</option>
                    <option value="okra">Okra</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI Best Market recommendation card */}
            <div className="lg:col-span-2 bg-gradient-to-r from-emerald-800 to-emerald-955 text-white border border-emerald-800 rounded-2xl shadow-md p-6 flex flex-col justify-between">
              {marketLoading ? (
                <div className="h-full flex flex-col justify-center items-center py-6 space-y-2 animate-pulse">
                  <Bot className="w-8 h-8 text-emerald-300 animate-bounce" />
                  <p className="text-xs text-emerald-200">Evaluating regional APMC databases...</p>
                </div>
              ) : marketData?.advice ? (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest block mb-0.5">AI Best Price Recommendation</span>
                      <h4 className="text-lg font-black">{marketData.advice.bestMarketName}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-300 font-bold block uppercase font-mono">Modal Price</span>
                      <h3 className="text-2xl font-black text-emerald-200">₹{marketData.advice.bestMarketPrice} <span className="text-xs font-semibold">/ Quintal</span></h3>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-emerald-100/90 my-3 font-medium">
                    <strong>Why:</strong> {marketData.advice.recommendationReason}
                  </p>

                  <div className="p-3 bg-white/10 rounded-xl border border-white/5 flex gap-2.5 items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 shrink-0 mt-1.5" />
                    <p className="text-[11px] text-emerald-100/95 leading-relaxed font-semibold">
                      <strong>Selling Suggestion:</strong> {marketData.advice.sellingTimeAdvice}
                    </p>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-emerald-300">
                  Select a crop to load pricing strategy.
                </div>
              )}
            </div>
          </div>

          {/* Comparative Prices & Historical Trends */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live comparative prices */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-stone-900 dark:text-white mb-1">Regional APMC Live Prices</h4>
                <p className="text-xs text-stone-500 mb-4">Daily pricing comparison across major wholesale hubs in Maharashtra.</p>
              </div>

              {marketLoading ? (
                <div className="space-y-3 py-6 animate-pulse">
                  <div className="h-10 bg-stone-100 dark:bg-stone-850 rounded w-full" />
                  <div className="h-10 bg-stone-100 dark:bg-stone-850 rounded w-full" />
                  <div className="h-10 bg-stone-100 dark:bg-stone-850 rounded w-full" />
                </div>
              ) : marketData?.prices ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-100 dark:border-stone-850 text-stone-400 font-bold uppercase">
                        <th className="pb-2">APMC Market</th>
                        <th className="pb-2">Min Price</th>
                        <th className="pb-2">Max Price</th>
                        <th className="pb-2 text-right">Modal Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-850 font-medium text-stone-700 dark:text-stone-300">
                      <tr>
                        <td className="py-2.5 font-bold">Mumbai APMC</td>
                        <td className="py-2.5">₹{marketData.prices.mumbai.min}</td>
                        <td className="py-2.5">₹{marketData.prices.mumbai.max}</td>
                        <td className="py-2.5 text-right text-emerald-600 font-extrabold">₹{marketData.prices.mumbai.modal}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold">Pune APMC</td>
                        <td className="py-2.5">₹{marketData.prices.pune.min}</td>
                        <td className="py-2.5">₹{marketData.prices.pune.max}</td>
                        <td className="py-2.5 text-right text-emerald-600 font-extrabold">₹{marketData.prices.pune.modal}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold">Nashik APMC</td>
                        <td className="py-2.5">₹{marketData.prices.nashik.min}</td>
                        <td className="py-2.5">₹{marketData.prices.nashik.max}</td>
                        <td className="py-2.5 text-right text-emerald-600 font-extrabold">₹{marketData.prices.nashik.modal}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold">Nagpur APMC</td>
                        <td className="py-2.5">₹{marketData.prices.nagpur.min}</td>
                        <td className="py-2.5">₹{marketData.prices.nagpur.max}</td>
                        <td className="py-2.5 text-right text-emerald-600 font-extrabold">₹{marketData.prices.nagpur.modal}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>

            {/* Historical price trends chart */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-stone-900 dark:text-white mb-1">6-Month Price Trends</h4>
                <p className="text-xs text-stone-500 mb-4">Historical modal price movement (Jan 2026 - June 2026).</p>
              </div>

              {marketLoading ? (
                <div className="h-32 bg-stone-55 dark:bg-stone-850 rounded animate-pulse" />
              ) : marketData?.prices?.history ? (
                <div className="space-y-2.5 pt-2">
                  {['January', 'February', 'March', 'April', 'May', 'June'].map((month, index) => {
                    const priceVal = marketData.prices.history[index];
                    const maxPrice = Math.max(...marketData.prices.history);
                    const widthPercent = (priceVal / maxPrice) * 100;
                    return (
                      <div key={month} className="flex items-center gap-3">
                        <span className="w-16 text-stone-400 font-bold text-[10px] uppercase tracking-wider shrink-0">{month}</span>
                        <div className="flex-1 bg-stone-100 dark:bg-stone-850 h-5 rounded-md overflow-hidden relative">
                          <div
                            style={{ width: `${widthPercent}%` }}
                            className="bg-emerald-600/80 dark:bg-emerald-600/70 h-full rounded-md transition-all duration-300 flex items-center justify-end pr-2.5"
                          >
                            <span className="text-[10px] text-white font-extrabold">₹{priceVal}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Notice Board */}
      {activeTab === 'notice-board' && (
        <NoticeBoard />
      )}

      {/* Tab 8: Grievances / Complaint Box */}
      {activeTab === 'complaints' && (
        <GrievanceBox currentUser={currentUser} />
      )}

      {/* Tab 9: Village Directory Info Map */}
      {activeTab === 'village-info' && (
        <VillageDirectory />
      )}

      {/* Tab 10: Smart Calendar */}
      {activeTab === 'calendar' && (
        <SmartCalendar isFarmer={true} />
      )}
    </div>
  );
}
