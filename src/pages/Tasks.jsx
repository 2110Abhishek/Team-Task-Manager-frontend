import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/tasks');
        setTasks(res.data);
      } catch (error) {
        console.error('Error fetching tasks', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task', error);
      alert('Failed to delete task. You may not have permission to delete this task.');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'ALL') return true;
    return task.status === filter;
  });

  if (loading) return <div className="animate-pulse space-y-4">
    {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-slate-800 rounded-xl"></div>)}
  </div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white">All Tasks</h1>
        <p className="text-slate-400 mt-1">Unified view of your assignments across all projects</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800 w-full md:w-auto">
          {['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {f === 'ALL' ? 'All' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="glass p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${
                  task.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                  task.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-500/10 text-slate-500'
                }`}>
                  {task.status === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className={`font-medium ${task.status === 'COMPLETED' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-blue-500 font-medium">{task.project?.name || 'No Project'}</span>
                    <span className="text-xs text-slate-600">•</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      task.priority === 'HIGH' ? 'bg-red-500/10 text-red-500' : 
                      task.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {task.dueDate && (
                  <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-4 h-4" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                )}
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white border border-slate-700">
                  {task.assignee?.name?.[0] || '?'}
                </div>
                
                <div className="relative group/menu">
                  <button className="text-slate-600 hover:text-white p-1 rounded-lg transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 hidden group-hover/menu:block z-20">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 min-w-[120px]">
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Task
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 glass rounded-2xl border-dashed border-white/10">
            <CheckSquare className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">No tasks found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
