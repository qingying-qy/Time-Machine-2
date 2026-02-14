
import React, { useState } from 'react';
import { Activity, Goal, TimeLog } from '../types';
import { Plus, Target, CheckCircle2, Trash2, X, Trophy, Sparkles } from 'lucide-react';

interface GoalsViewProps {
  activities: Activity[];
  goals: Goal[];
  logs: TimeLog[];
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
}

const GoalsView: React.FC<GoalsViewProps> = ({ activities, goals, logs, onUpdateGoal, onDeleteGoal }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    activityId: activities[0]?.id || '',
    targetMinutes: 30,
    period: 'day'
  });

  const getProgress = (goal: Goal) => {
    const now = new Date();
    let start: number;
    if (goal.period === 'day') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    } else if (goal.period === 'week') {
      const day = now.getDay() || 7;
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1).getTime();
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    }

    const currentTotal = logs
      .filter(l => l.activityId === goal.activityId && l.timestamp >= start)
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);

    return {
      current: currentTotal,
      percentage: Math.min(100, (currentTotal / goal.targetMinutes) * 100)
    };
  };

  const handleAddGoal = () => {
    if (newGoal.activityId && newGoal.targetMinutes && newGoal.period) {
      onUpdateGoal({
        id: Math.random().toString(36).substr(2, 9),
        activityId: newGoal.activityId as string,
        targetMinutes: Number(newGoal.targetMinutes),
        period: newGoal.period as 'day' | 'week' | 'month'
      });
      setShowAdd(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes celebrate-glow {
            0%, 100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.4), 0 0 10px rgba(255, 215, 0, 0.2); }
            50% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.7), 0 0 25px rgba(255, 215, 0, 0.4); }
          }
          @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          .progress-shimmer {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.3),
              transparent
            );
            animation: shimmer 2s infinite;
          }
          .celebrate-bar {
            animation: celebrate-glow 2s infinite;
          }
          .sparkle-particle {
            position: absolute;
            background: white;
            border-radius: 50%;
            width: 4px;
            height: 4px;
            pointer-events: none;
            animation: sparkle 1.5s infinite ease-in-out;
          }
        `}
      </style>

      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Goals</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90 ${
            showAdd ? 'bg-slate-200 text-slate-600' : 'bg-indigo-600 text-white shadow-indigo-200'
          }`}
        >
          {showAdd ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100 space-y-6 animate-in zoom-in-95 duration-300">
          <div className="space-y-3">
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Choose Objective</label>
            <select 
              value={newGoal.activityId}
              onChange={(e) => setNewGoal({...newGoal, activityId: e.target.value})}
              className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-indigo-500 focus:outline-none font-bold transition-all text-sm"
            >
              {activities.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Target Mins</label>
              <input 
                type="number"
                value={newGoal.targetMinutes}
                onChange={(e) => setNewGoal({...newGoal, targetMinutes: Number(e.target.value)})}
                className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-indigo-500 focus:outline-none font-bold text-lg"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Horizon</label>
              <select 
                value={newGoal.period}
                onChange={(e) => setNewGoal({...newGoal, period: e.target.value as any})}
                className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-indigo-500 focus:outline-none font-bold text-sm"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleAddGoal}
            className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-bold text-lg shadow-xl active:scale-95"
          >
            Forge Objective
          </button>
        </div>
      )}

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center opacity-80">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Target size={40} className="text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-500 leading-relaxed">No active goals.<br/>What will you achieve in the future?</p>
          </div>
        ) : (
          goals.map(goal => {
            const activity = activities.find(a => a.id === goal.activityId);
            const { current, percentage } = getProgress(goal);
            const isCompleted = percentage >= 100;

            return (
              <div key={goal.id} className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-50 group relative overflow-hidden transition-all duration-300 hover:scale-[1.01]">
                <button 
                  onClick={() => onDeleteGoal(goal.id)}
                  className="absolute top-6 right-6 text-slate-200 hover:text-rose-500 transition-colors z-10"
                >
                  <Trash2 size={18} />
                </button>

                <div className="flex items-center gap-5 mb-6">
                  <div className="w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-sm border border-slate-100/50" style={{ backgroundColor: `${activity?.color}15` }}>
                    {activity?.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-slate-900 text-lg tracking-tight">{activity?.name}</h4>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      {{ day: 'Daily', week: 'Weekly', month: 'Monthly' }[goal.period]} Target: {goal.targetMinutes}m
                    </p>
                  </div>
                  {isCompleted && (
                    <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full text-emerald-600 border border-emerald-100 animate-in zoom-in duration-500">
                      <Trophy size={14} className="fill-emerald-600" />
                      <span className="text-[11px] font-black uppercase tracking-widest">Achieved</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-slate-900">{current}m</span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Captured</span>
                    </div>
                    <span className="text-[13px] font-black text-slate-900">{percentage.toFixed(0)}%</span>
                  </div>
                  <div className={`h-5 bg-slate-100/80 rounded-full overflow-hidden relative shadow-inner p-1 ${isCompleted ? 'celebrate-bar' : ''}`}>
                    <div 
                      className={`h-full transition-all duration-1000 ease-out relative overflow-hidden rounded-full shadow-lg`}
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: isCompleted ? activity?.color : '#6366f1' 
                      }}
                    >
                      {!isCompleted && percentage > 0 && <div className="progress-shimmer" />}
                      {isCompleted && (
                        <>
                          <div className="absolute inset-0 bg-white/30 animate-pulse" />
                          <div className="progress-shimmer" style={{ opacity: 0.5 }} />
                          {/* Sparkling Particles */}
                          <div className="sparkle-particle" style={{ left: '10%', top: '20%', animationDelay: '0s' }} />
                          <div className="sparkle-particle" style={{ left: '50%', top: '60%', animationDelay: '0.4s' }} />
                          <div className="sparkle-particle" style={{ left: '85%', top: '30%', animationDelay: '0.8s' }} />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GoalsView;
