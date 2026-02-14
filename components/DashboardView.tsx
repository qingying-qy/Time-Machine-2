
import React, { useState, useMemo } from 'react';
import { Activity, TimeLog, TimeDimension } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts';
import { TrendingUp, TrendingDown, Clock, PieChart as PieIcon, BarChart3, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Activity as ActivityIcon, History } from 'lucide-react';

interface DashboardViewProps {
  activities: Activity[];
  logs: TimeLog[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ activities, logs }) => {
  const [dimension, setDimension] = useState<TimeDimension>('day');
  const [selectedActivityId, setSelectedActivityId] = useState<string | 'all'>('all');
  const [timelineDate, setTimelineDate] = useState(new Date().toISOString().split('T')[0]);

  const stats = useMemo(() => {
    const now = new Date();
    let startOfCurrent: number;
    let startOfPrevious: number;
    let periodLabel: string;

    if (dimension === 'day') {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startOfCurrent = d.getTime();
      startOfPrevious = startOfCurrent - 24 * 60 * 60 * 1000;
      periodLabel = 'Yesterday';
    } else if (dimension === 'week') {
      const day = now.getDay() || 7;
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
      startOfCurrent = d.getTime();
      startOfPrevious = startOfCurrent - 7 * 24 * 60 * 60 * 1000;
      periodLabel = 'Last Week';
    } else if (dimension === 'month') {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      startOfCurrent = d.getTime();
      startOfPrevious = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
      periodLabel = 'Last Month';
    } else {
      const d = new Date(now.getFullYear(), 0, 1);
      startOfCurrent = d.getTime();
      startOfPrevious = new Date(now.getFullYear() - 1, 0, 1).getTime();
      periodLabel = 'Last Year';
    }

    const currentLogs = logs.filter(l => l.timestamp >= startOfCurrent);
    const previousLogs = logs.filter(l => l.timestamp >= startOfPrevious && l.timestamp < startOfCurrent);

    const getDuration = (lgs: TimeLog[], id?: string) => {
      return lgs
        .filter(l => !id || id === 'all' || l.activityId === id)
        .reduce((acc, curr) => acc + curr.durationMinutes, 0);
    };

    const currentTotal = getDuration(currentLogs, selectedActivityId);
    const previousTotal = getDuration(previousLogs, selectedActivityId);

    const diffPercent = previousTotal === 0 
      ? (currentTotal > 0 ? 100 : 0) 
      : ((currentTotal - previousTotal) / previousTotal) * 100;

    const breakdown = activities.map(act => {
      const cur = getDuration(currentLogs, act.id);
      const prev = getDuration(previousLogs, act.id);
      const pct = currentTotal > 0 ? (cur / currentTotal) * 100 : 0;
      const ringDiff = prev === 0 ? (cur > 0 ? 100 : 0) : ((cur - prev) / prev) * 100;
      
      return {
        ...act,
        currentMinutes: cur,
        previousMinutes: prev,
        percentage: pct,
        ringDiff
      };
    }).sort((a, b) => b.currentMinutes - a.currentMinutes);

    const distributionData = breakdown
      .filter(item => item.currentMinutes > 0)
      .map(item => ({
        id: item.id,
        name: item.name,
        value: item.currentMinutes,
        color: item.color,
        icon: item.icon
      }));

    return {
      currentTotal,
      previousTotal,
      diffPercent,
      periodLabel,
      breakdown,
      distributionData
    };
  }, [logs, dimension, selectedActivityId, activities]);

  // Dynamic trend logic based on Dimension
  const trendData = useMemo(() => {
    if (selectedActivityId === 'all') return [];
    
    const data = [];
    const now = new Date();

    if (dimension === 'day') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const start = d.getTime();
        const end = start + 24 * 60 * 60 * 1000;
        const mins = logs.filter(l => l.activityId === selectedActivityId && l.timestamp >= start && l.timestamp < end)
                        .reduce((acc, curr) => acc + curr.durationMinutes, 0);
        data.push({ label: d.toLocaleDateString([], { month: 'short', day: 'numeric' }), minutes: mins });
      }
    } else if (dimension === 'week') {
      for (let i = 7; i >= 0; i--) {
        const day = now.getDay() || 7;
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1 - (i * 7));
        const start = d.getTime();
        const end = start + 7 * 24 * 60 * 60 * 1000;
        const mins = logs.filter(l => l.activityId === selectedActivityId && l.timestamp >= start && l.timestamp < end)
                        .reduce((acc, curr) => acc + curr.durationMinutes, 0);
        data.push({ label: `W${i === 0 ? ' (now)' : '-' + i}`, minutes: mins });
      }
    } else if (dimension === 'month') {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = d.getTime();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const end = nextMonth.getTime();
        const mins = logs.filter(l => l.activityId === selectedActivityId && l.timestamp >= start && l.timestamp < end)
                        .reduce((acc, curr) => acc + curr.durationMinutes, 0);
        data.push({ label: d.toLocaleDateString([], { month: 'short' }), minutes: mins });
      }
    } else {
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i;
        const start = new Date(year, 0, 1).getTime();
        const end = new Date(year + 1, 0, 1).getTime();
        const mins = logs.filter(l => l.activityId === selectedActivityId && l.timestamp >= start && l.timestamp < end)
                        .reduce((acc, curr) => acc + curr.durationMinutes, 0);
        data.push({ label: year.toString(), minutes: mins });
      }
    }
    return data;
  }, [logs, selectedActivityId, dimension]);

  const timelineStats = useMemo(() => {
    const selectedDateStart = new Date(timelineDate).getTime();
    const selectedDateEnd = selectedDateStart + 24 * 60 * 60 * 1000;
    
    const dayLogs = logs
      .filter(l => l.timestamp >= selectedDateStart && l.timestamp < selectedDateEnd)
      .filter(l => selectedActivityId === 'all' || l.activityId === selectedActivityId)
      .sort((a, b) => a.timestamp - b.timestamp);

    return dayLogs.map(log => {
      const activity = activities.find(a => a.id === log.activityId);
      return {
        ...log,
        activity,
        startTime: new Date(log.timestamp - log.durationMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        endTime: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      };
    });
  }, [logs, timelineDate, activities, selectedActivityId]);

  const formatMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const shiftDate = (days: number) => {
    const current = new Date(timelineDate);
    current.setDate(current.getDate() + days);
    setTimelineDate(current.toISOString().split('T')[0]);
  };

  const currentSelectionColor = useMemo(() => {
    if (selectedActivityId === 'all') return '#6366f1';
    return activities.find(a => a.id === selectedActivityId)?.color || '#6366f1';
  }, [selectedActivityId, activities]);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Time Dimension Selector */}
      <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-2xl flex shadow-sm border border-slate-100">
        {(['day', 'week', 'month', 'year'] as TimeDimension[]).map(d => (
          <button 
            key={d}
            onClick={() => setDimension(d)}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-extrabold capitalize transition-all duration-300 ${dimension === d ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Activity Filter Header */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar px-1">
        <button 
          onClick={() => setSelectedActivityId('all')}
          className={`px-5 py-2.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all border-2 ${selectedActivityId === 'all' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-transparent text-slate-500 shadow-sm'}`}
        >
          All Insights
        </button>
        {activities.map(act => (
          <button 
            key={act.id}
            onClick={() => setSelectedActivityId(act.id)}
            className={`px-5 py-2.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all border-2 flex items-center gap-2 ${selectedActivityId === act.id ? 'bg-white border-indigo-600 text-indigo-700 shadow-md' : 'bg-white border-transparent text-slate-500 shadow-sm'}`}
          >
            <span>{act.icon}</span> {act.name}
          </button>
        ))}
      </div>

      {/* Hero Summary Card */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200 border border-slate-50 relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 p-6 opacity-10 transition-transform duration-700 group-hover:scale-125 group-hover:rotate-12">
          {selectedActivityId === 'all' ? <BarChart3 size={120} /> : <span className="text-[100px]">{activities.find(a => a.id === selectedActivityId)?.icon}</span>}
        </div>

        <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
          {selectedActivityId === 'all' ? 'Total Chronons Spent' : `${activities.find(a => a.id === selectedActivityId)?.name} Duration`}
        </p>
        <h3 className="text-4xl font-black text-slate-900 mb-6 tracking-tighter">{formatMins(stats.currentTotal)}</h3>
        
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[12px] font-bold ${stats.diffPercent >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {stats.diffPercent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(stats.diffPercent).toFixed(1)}%
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase">vs {stats.periodLabel}</span>
        </div>
      </div>

      {/* Day Timeline Visualization */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200 border border-slate-50 space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-800 flex items-center gap-2 text-[13px] uppercase tracking-tight">
            <Clock size={16} className="text-indigo-600" /> {selectedActivityId === 'all' ? 'Time Flow' : 'Activity Replay'}
          </h4>
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
            <button onClick={() => shiftDate(-1)} className="p-1.5 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-indigo-600">
              <ChevronLeft size={16} />
            </button>
            <span className="text-[11px] font-black text-slate-600 px-1">{new Date(timelineDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            <button onClick={() => shiftDate(1)} className="p-1.5 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-indigo-600">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {timelineStats.length > 0 ? (
          <div className="space-y-6">
            <div className="flex h-12 w-full rounded-3xl overflow-hidden shadow-inner bg-slate-50 border-2 border-slate-100 p-1">
              {timelineStats.map((log) => (
                <div 
                  key={log.id}
                  className="h-full relative group transition-all duration-300 rounded-2xl"
                  style={{ 
                    width: `${(log.durationMinutes / 1440) * 100}%`,
                    minWidth: '32px',
                    backgroundColor: log.activity?.color || '#cbd5e1',
                    flexGrow: log.durationMinutes,
                    marginRight: '2px'
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-2xl">
                    <span className="text-[12px] text-white font-bold">{log.activity?.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {timelineStats.map((log) => (
                <div key={log.id} className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-[1.5rem] border border-slate-100 group transition-all hover:border-indigo-100 hover:bg-white hover:shadow-lg hover:shadow-indigo-100/20">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm bg-white"
                    style={{ color: log.activity?.color }}
                  >
                    {log.activity?.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-bold text-slate-800">{log.activity?.name}</span>
                      <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">{log.startTime} - {log.endTime}</span>
                    </div>
                    <div className="text-[11px] font-bold text-indigo-600 mt-1">{formatMins(log.durationMinutes)} Captured</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <History size={32} className="text-slate-300 mb-3" />
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No Chronons captured for this day</p>
          </div>
        )}
      </div>

      {/* Main Stats: Trend (Single) or Pie Chart (All) */}
      {selectedActivityId !== 'all' ? (
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200 border border-slate-50 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 text-[13px] uppercase tracking-tight">
              <ActivityIcon size={16} className="text-indigo-600" /> 
              {{ day: 'Daily', week: 'Weekly', month: 'Monthly', year: 'Yearly' }[dimension]} Spending Trend
            </h4>
            <span className="text-[10px] font-extrabold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase">Historical Resonance</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc', radius: 10 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-2 px-3 rounded-xl text-[10px] font-bold shadow-2xl">
                          {payload[0].value} mins
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="minutes" 
                  fill={currentSelectionColor} 
                  radius={[10, 10, 10, 10]} 
                  barSize={dimension === 'day' ? 24 : 16}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        /* Pie Chart only for 'All Activities' */
        stats.distributionData.length > 0 && (
          <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200 border border-slate-50">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 text-[13px] uppercase tracking-tight">
                <PieIcon size={16} className="text-indigo-600" /> Time Distribution
              </h4>
              <span className="text-[10px] font-extrabold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase">Current {dimension}</span>
            </div>
            <div className="flex items-center">
              <div className="h-44 w-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 pl-4 space-y-3 max-h-44 overflow-y-auto custom-scrollbar">
                {stats.distributionData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between group cursor-pointer" onClick={() => setSelectedActivityId(item.id)}>
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }}></div>
                      <span className="text-[11px] font-extrabold text-slate-600 truncate">{item.name}</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-900 ml-2">
                      {((item.value / stats.currentTotal) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}

      {/* Activity Breakdown - Only for 'All Activities' */}
      {selectedActivityId === 'all' && stats.breakdown.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-2">Journey Breakdown</h4>
          <div className="space-y-4">
            {stats.breakdown.filter(item => item.currentMinutes > 0 || item.previousMinutes > 0).map((item) => (
              <div 
                key={item.id} 
                className={`bg-white p-6 rounded-[2rem] shadow-sm border-2 transition-all duration-300 cursor-pointer hover:shadow-xl ${selectedActivityId === item.id ? 'border-indigo-600' : 'border-transparent'}`}
                onClick={() => setSelectedActivityId(item.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                      style={{ backgroundColor: `${item.color}15`, color: item.color }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <h5 className="font-extrabold text-slate-800 leading-none mb-1">{item.name}</h5>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{item.percentage.toFixed(1)}% of total</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900 text-sm">{formatMins(item.currentMinutes)}</div>
                    <div className={`text-[10px] font-bold flex items-center justify-end gap-1 mt-0.5 ${item.ringDiff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {item.ringDiff >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {Math.abs(item.ringDiff).toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.currentTotal === 0 && stats.previousTotal === 0 && (
        <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center opacity-80">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Clock size={40} className="text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-500 leading-relaxed">No chronons observed in this sector.<br/><span className="text-indigo-500">Ignite the engine</span> to begin tracking.</p>
        </div>
      )}
    </div>
  );
};

const CartesianGrid = ({ strokeDasharray, vertical, stroke }: any) => (
  <svg className="absolute inset-0 pointer-events-none overflow-visible">
    <line x1="0" y1="25%" x2="100%" y2="25%" stroke={stroke} strokeDasharray={strokeDasharray} />
    <line x1="0" y1="50%" x2="100%" y2="50%" stroke={stroke} strokeDasharray={strokeDasharray} />
    <line x1="0" y1="75%" x2="100%" y2="75%" stroke={stroke} strokeDasharray={strokeDasharray} />
    <line x1="0" y1="100%" x2="100%" y2="100%" stroke={stroke} strokeDasharray={strokeDasharray} />
  </svg>
);

export default DashboardView;
