import React, { useState, useEffect, useRef } from 'react';
import { Activity, TimeLog } from '../types';
import { Play, Pause, Square, Timer as TimerIcon, PlusCircle, CheckCircle2, Calendar, Zap } from 'lucide-react';

interface TrackerViewProps {
  activities: Activity[];
  onAddLog: (log: Omit<TimeLog, 'id'>) => void;
}

const TrackerView: React.FC<TrackerViewProps> = ({ activities, onAddLog }) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string>(activities[0]?.id || '');
  const [mode, setMode] = useState<'timer' | 'manual'>('timer');
  
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const [manualHours, setManualHours] = useState('0');
  const [manualMinutes, setManualMinutes] = useState('0');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);

  const selectedActivity = activities.find(a => a.id === selectedActivityId);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused]);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(prev => !prev);
  };

  const handleStop = () => {
    if (seconds >= 60) {
      onAddLog({
        activityId: selectedActivityId,
        durationMinutes: Math.floor(seconds / 60),
        timestamp: Date.now()
      });
    }
    setIsActive(false);
    setIsPaused(false);
    setSeconds(0);
  };

  const handleManualSubmit = () => {
    const h = parseInt(manualHours) || 0;
    const m = parseInt(manualMinutes) || 0;
    const total = h * 60 + m;
    
    if (total > 0) {
      const dateParts = manualDate.split('-').map(Number);
      const logDate = new Date();
      logDate.setFullYear(dateParts[0], dateParts[1] - 1, dateParts[2]);
      
      onAddLog({
        activityId: selectedActivityId,
        durationMinutes: total,
        timestamp: logDate.getTime()
      });
      
      setManualHours('0');
      setManualMinutes('0');
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      {/* Activity Selector */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Activity</h2>
          {isActive && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 animate-pulse bg-indigo-50 px-2 py-0.5 rounded-full">
              <Zap size={10} className="fill-indigo-500" /> Recording...
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {activities.map(activity => (
            <button
              key={activity.id}
              onClick={() => !isActive && setSelectedActivityId(activity.id)}
              disabled={isActive}
              className={`p-4 rounded-[2rem] flex flex-col items-center gap-2 transition-all duration-300 border-2 ${
                selectedActivityId === activity.id 
                ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-100/50 scale-[1.02]' 
                : 'border-transparent bg-white shadow-sm opacity-50 hover:opacity-100 hover:scale-[1.01]'
              }`}
            >
              <div 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 ${selectedActivityId === activity.id ? 'rotate-12' : ''}`}
                style={{ backgroundColor: `${activity.color}15`, color: activity.color }}
              >
                {activity.icon}
              </div>
              <span className="text-[11px] font-extrabold text-slate-700">{activity.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Selector */}
      {!isActive && (
        <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-2xl flex shadow-sm border border-slate-100">
          <button 
            onClick={() => setMode('timer')}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-[12px] font-bold transition-all duration-300 ${mode === 'timer' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <TimerIcon size={14} /> Live Timer
          </button>
          <button 
            onClick={() => setMode('manual')}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-[12px] font-bold transition-all duration-300 ${mode === 'manual' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <PlusCircle size={14} /> Log Past
          </button>
        </div>
      )}

      {/* Tracking Card */}
      <div className="bg-white rounded-[2rem] p-6 shadow-2xl shadow-slate-200 border border-slate-50 flex flex-col items-center gap-6 relative overflow-hidden">
        {/* Glow effect */}
        <div 
          className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-[60px] opacity-15 transition-all duration-1000" 
          style={{ backgroundColor: selectedActivity?.color || '#6366f1' }}
        ></div>

        <div className="flex items-center gap-3 bg-slate-50/80 backdrop-blur px-4 py-1.5 rounded-full border border-slate-200/50 shadow-inner">
          <span className="text-lg">{selectedActivity?.icon}</span>
          <span className="text-[12px] font-extrabold text-slate-800 tracking-tight">
            {mode === 'timer' ? 'Active Timer' : 'Record History'}
          </span>
        </div>

        {mode === 'timer' ? (
          <>
            <div className={`text-5xl font-black font-mono tracking-tighter text-slate-900 transition-all duration-500 ${isActive && !isPaused ? 'scale-105' : ''}`}>
              {formatTime(seconds)}
            </div>
            
            <div className="flex gap-4 w-full px-2 justify-center">
              {!isActive ? (
                <button 
                  onClick={handleStart}
                  className="w-full max-w-[200px] bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-[1.5rem] font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-200 active:scale-95"
                >
                  <Play size={18} fill="currentColor" /> Start Engine
                </button>
              ) : (
                <>
                  <button 
                    onClick={handlePause}
                    className={`flex-1 py-4 rounded-[1.5rem] font-bold flex items-center justify-center gap-2 transition-all border-2 active:scale-95 ${
                      isPaused 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                      : 'bg-amber-50 border-amber-200 text-amber-600'
                    }`}
                  >
                    {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button 
                    onClick={handleStop}
                    className="w-16 bg-rose-50 border-2 border-rose-100 text-rose-600 rounded-[1.5rem] font-bold flex items-center justify-center transition-all hover:bg-rose-600 hover:text-white active:scale-95"
                  >
                    <Square size={20} fill="currentColor" />
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="w-full space-y-5">
            <div className="flex flex-col gap-4">
              <div className="flex justify-center gap-4 items-center">
                <div className="flex-1 max-w-[80px] flex flex-col gap-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Hrs</span>
                  <input 
                    type="number" 
                    min="0"
                    value={manualHours}
                    onChange={(e) => setManualHours(e.target.value)}
                    className="w-full h-9 text-lg font-bold text-center bg-slate-50 rounded-xl border-2 border-slate-100 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <span className="text-xl font-black text-slate-200 pt-4">:</span>
                <div className="flex-1 max-w-[80px] flex flex-col gap-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Mins</span>
                  <input 
                    type="number" 
                    min="0"
                    max="59"
                    value={manualMinutes}
                    onChange={(e) => setManualMinutes(e.target.value)}
                    className="w-full h-9 text-lg font-bold text-center bg-slate-50 rounded-xl border-2 border-slate-100 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block text-center">Date Observed</label>
                <div className="relative group max-w-[160px] mx-auto">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-indigo-500 transition-colors" size={13} />
                  <input 
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:bg-white focus:outline-none font-bold text-slate-700 transition-all text-[11px]"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleManualSubmit}
              className="w-full max-w-[240px] mx-auto bg-slate-900 text-white py-3.5 rounded-[1.5rem] font-bold flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95"
            >
              <CheckCircle2 size={16} /> Log Activity
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 opacity-60">
        <span className="w-1 h-1 bg-indigo-500 rounded-full"></span>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight text-center">
          Invest your energy in what counts the most
        </p>
        <span className="w-1 h-1 bg-indigo-500 rounded-full"></span>
      </div>
    </div>
  );
};

export default TrackerView;