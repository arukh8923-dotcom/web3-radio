'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface RadioShow {
  id: string;
  title: string;
  description: string;
  djName: string;
  djAddress: string;
  stationId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  duration: number; // minutes
  isRecurring: boolean;
  nextAirDate: number;
  imageUrl?: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Placeholder: get shows
async function getShows(stationId: string): Promise<RadioShow[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const now = new Date();
  const getNextDate = (dayOfWeek: number, time: string) => {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setDate(date.getDate() + ((dayOfWeek - date.getDay() + 7) % 7));
    date.setHours(hours, mins, 0, 0);
    if (date < now) date.setDate(date.getDate() + 7);
    return date.getTime();
  };

  return [
    {
      id: '1',
      title: 'Morning Vibes',
      description: 'Start your day with chill beats',
      djName: 'DJ Sunrise',
      djAddress: '0x123...',
      stationId,
      dayOfWeek: 1,
      startTime: '08:00',
      duration: 120,
      isRecurring: true,
      nextAirDate: getNextDate(1, '08:00'),
    },
    {
      id: '2',
      title: '4:20 Session',
      description: 'Daily afternoon relaxation',
      djName: 'DJ Chill',
      djAddress: '0x456...',
      stationId,
      dayOfWeek: now.getDay(),
      startTime: '16:20',
      duration: 60,
      isRecurring: true,
      nextAirDate: getNextDate(now.getDay(), '16:20'),
    },
    {
      id: '3',
      title: 'Weekend Party Mix',
      description: 'Get the party started!',
      djName: 'DJ Bass',
      djAddress: '0x789...',
      stationId,
      dayOfWeek: 6,
      startTime: '22:00',
      duration: 180,
      isRecurring: true,
      nextAirDate: getNextDate(6, '22:00'),
    },
  ];
}

// Placeholder: create show
async function createShow(show: Partial<RadioShow>): Promise<{ success: boolean; showId: string }> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { success: true, showId: `show-${Date.now()}` };
}

// Placeholder: delete show
async function deleteShow(showId: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
}

export default function ShowScheduler({ 
  stationId,
  stationName,
  isOwner = false,
}: { 
  stationId: string;
  stationName: string;
  isOwner?: boolean;
}) {
  const { address } = useAccount();
  const [shows, setShows] = useState<RadioShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    djName: '',
    dayOfWeek: 1,
    startTime: '12:00',
    duration: 60,
    isRecurring: true,
  });

  useEffect(() => {
    loadShows();
  }, [stationId]);

  const loadShows = async () => {
    setLoading(true);
    try {
      const data = await getShows(stationId);
      setShows(data.sort((a, b) => a.nextAirDate - b.nextAirDate));
    } catch (err) {
      console.error('Failed to load shows:', err);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    
    setSubmitting(true);
    try {
      await createShow({
        ...formData,
        stationId,
        djAddress: address,
      });
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        djName: '',
        dayOfWeek: 1,
        startTime: '12:00',
        duration: 60,
        isRecurring: true,
      });
      loadShows();
    } catch (err) {
      console.error('Failed to create show:', err);
    }
    setSubmitting(false);
  };

  const handleDelete = async (showId: string) => {
    if (!confirm('Delete this show?')) return;
    
    try {
      await deleteShow(showId);
      loadShows();
    } catch (err) {
      console.error('Failed to delete show:', err);
    }
  };

  const formatNextAir = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = timestamp - now.getTime();
    
    if (diff < 0) return 'Starting soon...';
    if (diff < 3600000) return `In ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    if (diff < 172800000) return `Tomorrow at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
  };

  const isLiveSoon = (timestamp: number) => {
    const diff = timestamp - Date.now();
    return diff > 0 && diff < 3600000; // Within 1 hour
  };

  return (
    <div className="bg-zinc-900 rounded-xl border border-amber-900/30 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 px-4 py-3 border-b border-amber-900/30">
        <div className="flex items-center justify-between">
          <h2 className="text-amber-100 font-bold flex items-center gap-2">
            <span>📺</span> Show Schedule
          </h2>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex bg-black/30 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('list')}
                className={`px-2 py-1 text-xs rounded ${
                  viewMode === 'list' ? 'bg-amber-600 text-white' : 'text-amber-100/60'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-2 py-1 text-xs rounded ${
                  viewMode === 'calendar' ? 'bg-amber-600 text-white' : 'text-amber-100/60'
                }`}
              >
                Week
              </button>
            </div>
            {isOwner && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-3 py-1 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-500"
              >
                {showForm ? 'Cancel' : '+ Show'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {/* Create Form */}
        {showForm && (
          <form onSubmit={handleCreate} className="mb-4 p-4 bg-black/20 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-amber-100/60 text-xs mb-1">Show Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="My Awesome Show"
                  required
                  className="w-full px-3 py-2 bg-black/30 border border-amber-900/30 rounded-lg text-amber-100 placeholder:text-amber-100/30 focus:outline-none focus:border-amber-500"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-amber-100/60 text-xs mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What's your show about?"
                  className="w-full px-3 py-2 bg-black/30 border border-amber-900/30 rounded-lg text-amber-100 placeholder:text-amber-100/30 focus:outline-none focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-amber-100/60 text-xs mb-1">DJ Name</label>
                <input
                  type="text"
                  value={formData.djName}
                  onChange={e => setFormData(prev => ({ ...prev, djName: e.target.value }))}
                  placeholder="DJ Name"
                  required
                  className="w-full px-3 py-2 bg-black/30 border border-amber-900/30 rounded-lg text-amber-100 placeholder:text-amber-100/30 focus:outline-none focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-amber-100/60 text-xs mb-1">Day</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={e => setFormData(prev => ({ ...prev, dayOfWeek: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-black/30 border border-amber-900/30 rounded-lg text-amber-100 focus:outline-none focus:border-amber-500"
                >
                  {DAYS.map((day, i) => (
                    <option key={i} value={i}>{day}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-amber-100/60 text-xs mb-1">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={e => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-black/30 border border-amber-900/30 rounded-lg text-amber-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-amber-100/60 text-xs mb-1">Duration (min)</label>
                <select
                  value={formData.duration}
                  onChange={e => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-black/30 border border-amber-900/30 rounded-lg text-amber-100 focus:outline-none focus:border-amber-500"
                >
                  <option value={30}>30 min</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.isRecurring}
                onChange={e => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                className="accent-amber-500"
              />
              <label htmlFor="recurring" className="text-amber-100/60 text-sm">
                Recurring weekly
              </label>
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-500 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : '📺 Create Show'}
            </button>
          </form>
        )}

        {/* Shows List/Calendar */}
        {loading ? (
          <div className="text-center py-8 text-amber-100/60">Loading...</div>
        ) : shows.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📺</div>
            <div className="text-amber-100/60">No shows scheduled</div>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {shows.map(show => (
              <div
                key={show.id}
                className={`bg-black/20 rounded-lg p-3 ${
                  isLiveSoon(show.nextAirDate) ? 'border border-green-500/30' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-100 font-medium">{show.title}</span>
                      {isLiveSoon(show.nextAirDate) && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                          Soon
                        </span>
                      )}
                      {show.isRecurring && (
                        <span className="text-amber-100/40 text-xs">🔄</span>
                      )}
                    </div>
                    <div className="text-amber-100/60 text-sm">{show.description}</div>
                    <div className="text-amber-100/40 text-xs mt-1">
                      🎧 {show.djName} • {DAYS[show.dayOfWeek]}s at {show.startTime} • {formatDuration(show.duration)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400 text-sm font-mono">
                      {formatNextAir(show.nextAirDate)}
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => handleDelete(show.id)}
                        className="text-red-400 text-xs hover:underline mt-1"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Calendar View */
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((day, i) => (
              <div key={day} className="text-center">
                <div className="text-amber-100/40 text-xs mb-2">{day.slice(0, 3)}</div>
                <div className="space-y-1">
                  {shows
                    .filter(s => s.dayOfWeek === i)
                    .map(show => (
                      <div
                        key={show.id}
                        className="bg-amber-600/20 rounded p-1 text-xs"
                        title={`${show.title} - ${show.startTime}`}
                      >
                        <div className="text-amber-100 truncate">{show.startTime}</div>
                        <div className="text-amber-100/60 truncate">{show.title}</div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
