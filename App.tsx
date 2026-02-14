
import React, { useState, useEffect } from 'react';
import { Activity, TimeLog, Goal, ViewType } from './types';
import { DEFAULT_ACTIVITIES } from './constants';
import TrackerView from './components/TrackerView';
import DashboardView from './components/DashboardView';
import GoalsView from './components/GoalsView';
import ActivityManager from './components/ActivityManager';
import { Clock, BarChart3, Target, Settings, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('tm_activities');
    return saved ? JSON.parse(saved) : DEFAULT_ACTIVITIES;
  });

  const [logs, setLogs] = useState<TimeLog[]>(() => {
    const saved = localStorage.getItem('tm_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('tm_goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeView, setActiveView] = useState<ViewType>('tracker');

  useEffect(() => {
    localStorage.setItem('tm_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('tm_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('tm_goals', JSON.stringify(goals));
  }, [goals]);

  const addLog = (log: Omit<TimeLog, 'id'>) => {
    const newLog = { ...log, id: Math.random().toString(36).substr(2, 9) };
    setLogs(prev => [newLog, ...prev]);
  };

  const addActivity = (activity: Activity) => {
    setActivities(prev => [...prev, activity]);
  };

  const updateGoal = (goal: Goal) => {
    setGoals(prev => {
      const existing = prev.findIndex(g => g.activityId === goal.activityId && g.period === goal.period);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = goal;
        return next;
      }
      return [...prev, goal];
    });
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning, Chrononaut";
    if (hour < 18) return "Dedicate your day to what counts";
    return "Focus on what matters most";
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 relative overflow-hidden shadow-2xl">
      {/* Header */}
      <header className="px-6 pt-8 pb-5 bg-white/80 backdrop-blur-md border-b border-slate-100/50 shrink-0 sticky top-0 z-50">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Time Machine <Sparkles size={16} className="text-indigo-500 fill-indigo-500" />
            </h1>
            <p className="text-[13px] text-slate-500 font-semibold italic">
              {getGreeting()}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {activeView === 'tracker' && (
          <TrackerView activities={activities} onAddLog={addLog} />
        )}
        {activeView === 'dashboard' && (
          <DashboardView activities={activities} logs={logs} />
        )}
        {activeView === 'goals' && (
          <GoalsView activities={activities} goals={goals} logs={logs} onUpdateGoal={updateGoal} onDeleteGoal={deleteGoal} />
        )}
        {activeView === 'settings' && (
          <ActivityManager activities={activities} onAddActivity={addActivity} setActivities={setActivities} />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="h-20 bg-white/90 backdrop-blur-lg border-t border-slate-100 flex items-center justify-around px-4 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] z-50">
        <NavButton 
          active={activeView === 'tracker'} 
          onClick={() => setActiveView('tracker')} 
          icon={<Clock size={20} />} 
          label="Journey" 
        />
        <NavButton 
          active={activeView === 'dashboard'} 
          onClick={() => setActiveView('dashboard')} 
          icon={<BarChart3 size={20} />} 
          label="Analytics" 
        />
        <NavButton 
          active={activeView === 'goals'} 
          onClick={() => setActiveView('goals')} 
          icon={<Target size={20} />} 
          label="Goals" 
        />
        <NavButton 
          active={activeView === 'settings'} 
          onClick={() => setActiveView('settings')} 
          icon={<Settings size={20} />} 
          label="Configure" 
        />
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${active ? 'text-indigo-600 scale-105' : 'text-slate-400'}`}
  >
    <div className={`p-2.5 rounded-2xl transition-all duration-300 ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-transparent'}`}>
      {icon}
    </div>
    <span className="text-[10px] font-bold tracking-tight uppercase">{label}</span>
    {active && (
      <div className="absolute -top-1 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></div>
    )}
  </button>
);

export default App;
