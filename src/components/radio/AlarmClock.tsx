'use client';

import { useState, useEffect, useRef } from 'react';
import { useRadio } from '@/hooks/useRadio';

interface Alarm {
  id: string;
  time: string; // HH:MM format
  frequency: number;
  enabled: boolean;
  days: number[]; // 0-6, Sunday = 0
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function AlarmClock() {
  const [isOpen, setIsOpen] = useState(false);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [newTime, setNewTime] = useState('07:00');
  const [newFrequency, setNewFrequency] = useState(88.1);
  const [newDays, setNewDays] = useState<number[]>([1, 2, 3, 4, 5]); // Weekdays
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { setFrequency, togglePower, isOn, setVolume } = useRadio();

  // Load alarms from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('web3radio-alarms');
    if (saved) {
      setAlarms(JSON.parse(saved));
    }
  }, []);

  // Save alarms to localStorage
  useEffect(() => {
    localStorage.setItem('web3radio-alarms', JSON.stringify(alarms));
  }, [alarms]);

  // Check alarms every minute
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDay = now.getDay();

      alarms.forEach((alarm) => {
        if (alarm.enabled && alarm.time === currentTime && alarm.days.includes(currentDay)) {
          triggerAlarm(alarm);
        }
      });
    };

    checkIntervalRef.current = setInterval(checkAlarms, 30000); // Check every 30 seconds
    checkAlarms(); // Initial check

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [alarms]);

  const triggerAlarm = (alarm: Alarm) => {
    // Turn on radio if off
    if (!isOn) {
      togglePower();
    }
    
    // Set frequency
    setFrequency(alarm.frequency);
    
    // Gradual volume increase
    let vol = 10;
    const volumeInterval = setInterval(() => {
      vol += 5;
      setVolume(Math.min(vol, 70));
      if (vol >= 70) {
        clearInterval(volumeInterval);
      }
    }, 1000);

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('⏰ Web3 Radio Alarm', {
        body: `Waking up to ${alarm.frequency.toFixed(1)} FM`,
        icon: '/icon.png',
      });
    }
  };

  const addAlarm = () => {
    const newAlarm: Alarm = {
      id: Date.now().toString(),
      time: newTime,
      frequency: newFrequency,
      enabled: true,
      days: newDays,
    };
    setAlarms([...alarms, newAlarm]);
    setEditingAlarm(null);
  };

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map((a) => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    ));
  };

  const deleteAlarm = (id: string) => {
    setAlarms(alarms.filter((a) => a.id !== id));
  };

  const toggleDay = (day: number) => {
    if (newDays.includes(day)) {
      setNewDays(newDays.filter((d) => d !== day));
    } else {
      setNewDays([...newDays, day].sort());
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          requestNotificationPermission();
        }}
        className={`preset-button text-xs ${alarms.some(a => a.enabled) ? 'bg-brass/30' : ''}`}
        title="Alarm Clock"
      >
        ⏰ ALARM
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 bottom-full mb-2 bg-cabinet-dark border border-brass rounded-lg shadow-xl z-50 w-72">
            <div className="p-3 border-b border-brass/30">
              <h3 className="text-brass font-dial text-sm">⏰ Wake-Up Alarm</h3>
            </div>

            {/* Alarm List */}
            <div className="max-h-48 overflow-y-auto">
              {alarms.length === 0 ? (
                <p className="text-dial-cream/50 text-xs text-center py-4">
                  No alarms set
                </p>
              ) : (
                alarms.map((alarm) => (
                  <div
                    key={alarm.id}
                    className="flex items-center justify-between p-2 border-b border-brass/10 hover:bg-black/20"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="nixie-tube text-lg">{alarm.time}</span>
                        <span className="text-dial-cream/50 text-xs">
                          {alarm.frequency.toFixed(1)} FM
                        </span>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {DAYS.map((day, i) => (
                          <span
                            key={day}
                            className={`text-[10px] ${
                              alarm.days.includes(i) ? 'text-brass' : 'text-dial-cream/30'
                            }`}
                          >
                            {day[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleAlarm(alarm.id)}
                        className={`w-8 h-5 rounded-full transition-colors ${
                          alarm.enabled ? 'bg-brass' : 'bg-dial-cream/20'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            alarm.enabled ? 'translate-x-3.5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => deleteAlarm(alarm.id)}
                        className="text-tuning-red text-xs p-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add New Alarm */}
            <div className="p-3 border-t border-brass/30 space-y-2">
              <div className="flex gap-2">
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="flex-1 px-2 py-1 bg-black/30 border border-brass/30 rounded text-dial-cream text-sm"
                />
                <input
                  type="number"
                  min={88}
                  max={108}
                  step={0.1}
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(parseFloat(e.target.value))}
                  className="w-20 px-2 py-1 bg-black/30 border border-brass/30 rounded text-dial-cream text-sm"
                />
              </div>
              
              <div className="flex justify-center gap-1">
                {DAYS.map((day, i) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(i)}
                    className={`w-7 h-7 rounded text-xs font-dial ${
                      newDays.includes(i)
                        ? 'bg-brass text-cabinet-dark'
                        : 'bg-black/30 text-dial-cream/50'
                    }`}
                  >
                    {day[0]}
                  </button>
                ))}
              </div>

              <button
                onClick={addAlarm}
                className="w-full preset-button text-xs"
              >
                + ADD ALARM
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
