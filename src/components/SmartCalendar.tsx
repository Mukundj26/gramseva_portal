'use client';

import React, { useState } from 'react';
import { useCollection } from '@/firebase/useCollection';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Sprout,
  TrendingDown,
  Megaphone,
  CloudLightning,
  AlertCircle,
  Clock,
  MapPin,
  HelpCircle
} from 'lucide-react';

interface SmartCalendarProps {
  isFarmer?: boolean;
}

const CATEGORY_STYLES = {
  sowing: { label: 'Sowing Window', dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200', text: 'text-emerald-800 dark:text-emerald-300', icon: Sprout },
  harvest: { label: 'Harvest Window', dot: 'bg-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-250', text: 'text-yellow-800 dark:text-yellow-300', icon: TrendingDown },
  scheme: { label: 'Scheme Deadline', dot: 'bg-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200', text: 'text-rose-800 dark:text-rose-300', icon: AlertCircle },
  event: { label: 'Village Event', dot: 'bg-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200', text: 'text-purple-800 dark:text-purple-300', icon: Megaphone },
  weather: { label: 'Weather Farming Advice', dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200', text: 'text-blue-800 dark:text-blue-300', icon: CloudLightning }
};

// Weather alerts seeds for July 2026
const WEATHER_ALERTS = [
  { day: 13, title: 'High Wind Alert', desc: 'Gusts up to 25 km/h expected. Support banana crops and verify young orchard stakes.' },
  { day: 17, title: 'Heavy Rainfall Warning', desc: 'Precipitation > 45mm expected. Clear field drainage channels to prevent root waterlogging.' },
  { day: 22, title: 'Sowing Humidity Window', desc: 'Relative humidity of 80% is ideal for groundnut and maize sowing. Proceed with sowing.' },
  { day: 29, title: 'Overcast Pest Warning', desc: 'Overcast weather is highly conducive to Aphid propagation in legumes. Spray neem oil preventative.' }
];

export default function SmartCalendar({ isFarmer = true }: SmartCalendarProps) {
  const { data: schemes } = useCollection<any>('government_schemes');
  const { data: notices } = useCollection<any>('notices');
  const { data: crops } = useCollection<any>('crops');

  // Calendar State: Hardcoded to July 2026 for simulation coherence
  const [currentYear] = useState(2026);
  const [currentMonth] = useState(6); // 0-indexed, so 6 is July
  const [selectedDay, setSelectedDay] = useState<number | null>(20); // Default to July 20 (Gram Sabha day)
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const daysInMonth = 31; // July has 31 days
  const startDayOfWeek = 3; // July 1, 2026 is a Wednesday (0=Sun, 1=Mon, 2=Tue, 3=Wed)

  // Helper to compile events for a specific day
  const getEventsForDay = (day: number) => {
    const events: any[] = [];
    const dateString = `2026-07-${String(day).padStart(2, '0')}`;

    // 1. Schemes Deadlines
    schemes?.forEach((sch: any) => {
      if (sch.deadline === dateString) {
        events.push({
          id: `sch-${sch.id}`,
          category: 'scheme',
          title: `Apply: ${sch.name}`,
          desc: `Application deadline. Benefits: ${sch.benefits}`,
          meta: `Income Cap: ₹${sch.incomeLimit.toLocaleString()}`
        });
      }
    });

    // 2. Village Notices & Meetings
    notices?.forEach((not: any) => {
      if (not.date.startsWith(dateString)) {
        events.push({
          id: `not-${not.id}`,
          category: 'event',
          title: not.title,
          desc: not.content,
          meta: `By: ${not.organizedBy}${not.venue ? ` | Venue: ${not.venue}` : ''}`
        });
      }
    });

    // 3. Crops Sowing & Harvesting Windows (Only for Farmers)
    if (isFarmer) {
      crops?.forEach((cr: any) => {
        // Sowing
        if (cr.sowingStart && cr.sowingEnd) {
          const sStart = new Date(cr.sowingStart);
          const sEnd = new Date(cr.sowingEnd);
          const current = new Date(`2026-07-${String(day).padStart(2, '0')}`);
          if (current >= sStart && current <= sEnd) {
            events.push({
              id: `sow-${cr.id}`,
              category: 'sowing',
              title: `Sowing: ${cr.name}`,
              desc: `Recommended sowing window for ${cr.name}. Preferred Soil: ${cr.soilType.join(', ')}.`,
              meta: `Water: ${cr.waterRequirement.toUpperCase()}`
            });
          }
        }
        // Harvesting
        if (cr.harvestStart && cr.harvestEnd) {
          const hStart = new Date(cr.harvestStart);
          const hEnd = new Date(cr.harvestEnd);
          const current = new Date(`2026-07-${String(day).padStart(2, '0')}`);
          if (current >= hStart && current <= hEnd) {
            events.push({
              id: `harv-${cr.id}`,
              category: 'harvest',
              title: `Harvesting: ${cr.name}`,
              desc: `Optimal harvest period for ${cr.name}. Anticipate yield: ${cr.expectedYield}.`,
              meta: `Suggested Fertilizer: ${cr.fertilizers.join(', ')}`
            });
          }
        }
      });

      // 4. Weather Farming Advice
      const wAlert = WEATHER_ALERTS.find(a => a.day === day);
      if (wAlert) {
        events.push({
          id: `wth-${day}`,
          category: 'weather',
          title: wAlert.title,
          desc: wAlert.desc,
          meta: 'Weather Station Realtime Advisory'
        });
      }
    }

    return events;
  };

  // Compile calendar cells array
  const calendarCells = [];
  // Empty padding cells for week start offset
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null);
  }
  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  // Get active day events
  const activeDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  // Get all events in the month for a list view (Timeline view)
  const allMonthlyEvents: any[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dayEvts = getEventsForDay(d);
    dayEvts.forEach(e => {
      allMonthlyEvents.push({ ...e, day: d });
    });
  }

  // Filter list
  const filteredEvents = allMonthlyEvents.filter(e => activeFilter === 'all' || e.category === activeFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
          <CalendarIcon className="w-5.5 h-5.5 text-emerald-600" />
          Smart Calendar Scheduler
        </h3>
        <p className="text-xs text-stone-500 mt-0.5">Agricultural cycles, scheme deadlines, Panchayat events, and weather crop alerts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Calendar Monthly Matrix */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-stone-105">
            <span className="text-sm font-black text-stone-850 dark:text-white uppercase tracking-wider">July 2026</span>
            <div className="flex gap-2">
              <button disabled className="p-1.5 border border-stone-200 rounded-lg text-stone-300 dark:border-stone-800 shrink-0">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button disabled className="p-1.5 border border-stone-200 rounded-lg text-stone-300 dark:border-stone-800 shrink-0">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-stone-400 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="aspect-square bg-stone-50/40 dark:bg-stone-950/10 rounded-xl" />;
              }

              const dayEvents = getEventsForDay(day);
              const isSelected = selectedDay === day;
              
              return (
                <button
                  key={`day-${day}`}
                  onClick={() => setSelectedDay(day)}
                  className={`aspect-square p-1.5 rounded-xl border flex flex-col justify-between items-center transition relative ${
                    isSelected
                      ? 'bg-emerald-650 text-white border-emerald-650 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white dark:bg-stone-900 border-stone-150 hover:bg-stone-50/50 dark:border-stone-850 dark:hover:bg-stone-850/20'
                  }`}
                >
                  <span className="text-xs font-bold">{day}</span>
                  
                  {/* Event dots indicator */}
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 justify-center flex-wrap max-w-full">
                      {dayEvents.slice(0, 3).map((evt, eIdx) => {
                        const style = CATEGORY_STYLES[evt.category as 'sowing'|'harvest'|'scheme'|'event'|'weather'] || CATEGORY_STYLES.event;
                        return (
                          <span
                            key={eIdx}
                            className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : style.dot}`}
                          />
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <span className={`text-[6px] font-black leading-none ${isSelected ? 'text-white' : 'text-stone-400'}`}>+</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Color Key Legend */}
          <div className="pt-3 border-t border-stone-100 dark:border-stone-850 flex flex-wrap gap-x-4 gap-y-1.5 text-[9px] font-bold uppercase tracking-wider text-stone-500">
            {Object.entries(CATEGORY_STYLES).map(([key, val]) => {
              if (!isFarmer && (key === 'sowing' || key === 'harvest' || key === 'weather')) return null;
              return (
                <span key={key} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${val.dot}`} />
                  {val.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Selected Day Event Drawer Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-850 pb-2">
              <h4 className="font-extrabold text-stone-900 dark:text-white text-xs uppercase tracking-wider">
                Schedule for July {selectedDay}, 2026
              </h4>
              <Clock className="w-4 h-4 text-stone-400" />
            </div>

            {activeDayEvents.length === 0 ? (
              <div className="text-center py-10 text-stone-400 text-xs">
                No events or deadlines registered for this day. Click other days to inspect schedules.
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                {activeDayEvents.map((evt) => {
                  const style = CATEGORY_STYLES[evt.category as 'sowing'|'harvest'|'scheme'|'event'|'weather'] || CATEGORY_STYLES.event;
                  const Icon = style.icon;
                  return (
                    <div
                      key={evt.id}
                      className={`p-3.5 border rounded-xl flex items-start gap-2.5 ${style.bg} ${style.border}`}
                    >
                      <span className={`p-1.5 rounded-lg shrink-0 ${style.text} bg-white dark:bg-stone-900`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <div className="space-y-1">
                        <span className={`text-[9px] font-black uppercase tracking-wider ${style.text}`}>{style.label}</span>
                        <h5 className="font-extrabold text-stone-905 dark:text-white text-xs leading-tight">{evt.title}</h5>
                        <p className="text-[10px] text-stone-600 dark:text-stone-300 leading-normal">{evt.desc}</p>
                        {evt.meta && (
                          <span className="text-[9px] font-bold text-stone-400 block pt-0.5">{evt.meta}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline View list panel */}
      <div className="bg-white dark:bg-stone-900 border border-emerald-50 dark:border-stone-850 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h4 className="font-extrabold text-stone-900 dark:text-white text-sm">Monthly Timeline View</h4>
            <p className="text-[10px] text-stone-400 mt-0.5">Filter upcoming tasks and milestones chronologically for July 2026.</p>
          </div>

          {/* Timeline categories selector */}
          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-0.5">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-emerald-650 text-white'
                  : 'bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 text-stone-500 hover:bg-stone-50'
              }`}
            >
              All Events
            </button>
            {Object.entries(CATEGORY_STYLES).map(([key, val]) => {
              if (!isFarmer && (key === 'sowing' || key === 'harvest' || key === 'weather')) return null;
              return (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition shrink-0 ${
                    activeFilter === key
                      ? 'bg-emerald-650 text-white'
                      : 'bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-850 text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  {val.label.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline Events Feed */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-10 text-stone-400 text-xs">
            No upcoming schedules found for the active filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((evt) => {
              const style = CATEGORY_STYLES[evt.category as 'sowing'|'harvest'|'scheme'|'event'|'weather'] || CATEGORY_STYLES.event;
              const Icon = style.icon;
              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedDay(evt.day)}
                  className="p-4 bg-stone-50/50 dark:bg-stone-950/20 border border-stone-150 dark:border-stone-850 rounded-2xl cursor-pointer hover:border-emerald-500 hover:bg-white dark:hover:bg-stone-900 transition flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span className={`p-1.5 rounded-lg ${style.text} bg-white dark:bg-stone-900 border ${style.border} shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="space-y-1">
                      <span className={`text-[8px] font-black uppercase tracking-wider ${style.text}`}>{style.label}</span>
                      <h5 className="font-extrabold text-stone-850 dark:text-white text-xs leading-snug">{evt.title}</h5>
                      <p className="text-[10px] text-stone-550 dark:text-stone-400 leading-relaxed truncate max-w-[200px]">{evt.desc}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center text-[10px] text-stone-450 font-bold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      July {evt.day}, 2026
                    </span>
                    <span className="text-emerald-600 hover:underline">Inspect</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
