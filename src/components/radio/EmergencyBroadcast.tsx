'use client';

import { useState, useEffect } from 'react';

interface EmergencyAlert {
  id: string;
  type: 'emergency' | 'warning' | 'info';
  title: string;
  message: string;
  station_id: string | null; // null = all stations
  started_at: string;
  ended_at: string | null;
  is_active: boolean;
}

interface EmergencyBroadcastProps {
  stationId?: string;
  onDismiss?: () => void;
}

export function EmergencyBroadcast({ stationId, onDismiss }: EmergencyBroadcastProps) {
  const [alert, setAlert] = useState<EmergencyAlert | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkEmergency();
    const interval = setInterval(checkEmergency, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [stationId]);

  const checkEmergency = async () => {
    try {
      const params = stationId ? `?station_id=${stationId}` : '';
      const res = await fetch(`/api/emergency${params}`);
      if (res.ok) {
        const data = await res.json();
        if (data.alert && data.alert.is_active) {
          setAlert(data.alert);
          setDismissed(false);
        } else {
          setAlert(null);
        }
      }
    } catch (error) {
      console.error('Failed to check emergency:', error);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (!alert || dismissed) return null;

  const bgColor = alert.type === 'emergency' ? 'bg-red-600' : alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500';
  const borderColor = alert.type === 'emergency' ? 'border-red-400' : alert.type === 'warning' ? 'border-amber-400' : 'border-blue-400';

  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] ${bgColor} ${borderColor} border-b-4 animate-pulse`}>
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {alert.type === 'emergency' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          <div className="flex-1">
            <p className="text-white font-bold">{alert.title}</p>
            <p className="text-white/90 text-sm">{alert.message}</p>
          </div>
          <button onClick={handleDismiss} className="text-white/70 hover:text-white text-xl px-2">×</button>
        </div>
      </div>
    </div>
  );
}

// Admin component for triggering emergency broadcasts
export function EmergencyAdmin({ stationId, isAdmin }: { stationId?: string; isAdmin: boolean }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'emergency' | 'warning' | 'info'>('warning');
  const [sending, setSending] = useState(false);

  if (!isAdmin) return null;

  const triggerEmergency = async () => {
    if (!title || !message) return;
    setSending(true);
    try {
      await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ station_id: stationId, type, title, message }),
      });
      setTitle('');
      setMessage('');
    } catch (error) {
      console.error('Failed to trigger emergency:', error);
    }
    setSending(false);
  };

  const endEmergency = async () => {
    try {
      await fetch('/api/emergency/end', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ station_id: stationId }) });
    } catch (error) {
      console.error('Failed to end emergency:', error);
    }
  };

  return (
    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
      <h4 className="text-red-400 font-bold mb-3">🚨 Emergency Broadcast</h4>
      <div className="space-y-3">
        <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full px-3 py-2 bg-black/30 border border-red-500/30 rounded text-dial-cream">
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="emergency">Emergency</option>
        </select>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Alert title" className="w-full px-3 py-2 bg-black/30 border border-red-500/30 rounded text-dial-cream" />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Alert message" rows={2} className="w-full px-3 py-2 bg-black/30 border border-red-500/30 rounded text-dial-cream resize-none" />
        <div className="flex gap-2">
          <button onClick={triggerEmergency} disabled={!title || !message || sending} className="flex-1 py-2 bg-red-600 text-white rounded disabled:opacity-50">
            {sending ? '...' : 'Trigger Alert'}
          </button>
          <button onClick={endEmergency} className="px-4 py-2 bg-green-600/20 text-green-400 rounded">End</button>
        </div>
      </div>
    </div>
  );
}
