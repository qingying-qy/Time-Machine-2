
import React, { useState } from 'react';
import { Activity } from '../types';
import { ICON_OPTIONS, COLOR_OPTIONS } from '../constants';
import { Plus, Trash2, X, PlusCircle, Edit2 } from 'lucide-react';

interface ActivityManagerProps {
  activities: Activity[];
  onAddActivity: (activity: Activity) => void;
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
}

const ActivityManager: React.FC<ActivityManagerProps> = ({ activities, onAddActivity, setActivities }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);

  const resetForm = () => {
    setName('');
    setSelectedIcon(ICON_OPTIONS[0]);
    setSelectedColor(COLOR_OPTIONS[0]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (activity: Activity) => {
    setEditingId(activity.id);
    setName(activity.name);
    setSelectedIcon(activity.icon);
    setSelectedColor(activity.color);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    if (editingId) {
      setActivities(prev => prev.map(a => 
        a.id === editingId 
          ? { ...a, name: name.trim(), icon: selectedIcon, color: selectedColor } 
          : a
      ));
    } else {
      onAddActivity({
        id: `act_${Date.now()}`,
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor
      });
    }
    resetForm();
  };

  const deleteActivity = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activities.length > 1) {
      setActivities(prev => prev.filter(a => a.id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Configuration</h2>
        <button 
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg transition-transform active:scale-95 ${
            showForm ? 'bg-slate-200 text-slate-700' : 'bg-slate-900 text-white shadow-slate-200'
          }`}
        >
          {showForm ? <X size={16} /> : <PlusCircle size={16} />}
          {showForm ? 'Abort' : 'Forge New'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100 space-y-6 animate-in zoom-in-95 duration-200">
          <div className="space-y-3">
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest px-1">
              {editingId ? 'Modify Identification' : 'New Identification'}
            </label>
            <input 
              type="text"
              placeholder="e.g. Deep Work, Yoga Flow..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:outline-none focus:border-indigo-500 focus:bg-white text-lg font-bold transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Visual Symbol</label>
            <div className="flex flex-wrap gap-2 p-1">
              {ICON_OPTIONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  className={`w-12 h-12 rounded-2xl text-xl flex items-center justify-center transition-all ${selectedIcon === icon ? 'bg-indigo-600 shadow-lg scale-110 text-white' : 'bg-slate-50 hover:bg-slate-100'}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Aura Color</label>
            <div className="flex flex-wrap gap-3 px-1">
              {COLOR_OPTIONS.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${selectedColor === color ? 'scale-125 ring-4 ring-slate-100 shadow-md' : ''}`}
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            {editingId ? 'Update Identity' : 'Construct Identity'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 px-1">
        {activities.map(activity => (
          <div 
            key={activity.id} 
            onClick={() => handleEdit(activity)}
            className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-50 flex items-center justify-between group cursor-pointer hover:border-indigo-100 hover:shadow-xl transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-slate-100/50"
                style={{ backgroundColor: `${activity.color}15`, color: activity.color }}
              >
                {activity.icon}
              </div>
              <div>
                <span className="font-black text-slate-800 block text-base">{activity.name}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Calibrate Metadata</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                title="Edit"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={(e) => deleteActivity(activity.id, e)}
                className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityManager;
