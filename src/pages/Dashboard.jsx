import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  BarChart3, 
  Plus, 
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="h-10 bg-slate-800 w-1/4 rounded-lg"></div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-800 rounded-2xl"></div>)}
    </div>
  </div>;

  const cards = [
    { label: 'Total Tasks', value: stats?.totalTasks, icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Completed', value: stats?.completedTasks, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Pending', value: stats?.pendingTasks, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Overdue', value: stats?.overdueTasks, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-slate-400 mt-1">Track your progress and upcoming deadlines</p>
        </div>
        <Link 
          to="/projects" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
              <card.icon className="w-16 h-16" />
            </div>
            <div className={`${card.bg} ${card.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
              <card.icon className="w-6 h-6" />
            </div>
            <p className="text-slate-400 text-sm font-medium">{card.label}</p>
            <p className="text-3xl font-bold text-white mt-1">{card.value || 0}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Recent Tasks
            </h2>
            <Link to="/tasks" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {stats?.recentTasks?.length > 0 ? (
              stats.recentTasks.map((task) => (
                <div key={task.id} className="glass p-4 rounded-xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-10 rounded-full ${
                      task.priority === 'HIGH' ? 'bg-red-500' : 
                      task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <h3 className="text-slate-200 font-medium">{task.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{task.project?.name || 'No Project'} • {task.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${
                      task.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 glass rounded-2xl border-dashed border-white/10">
                <p className="text-slate-500">No recent tasks found. Start by creating one!</p>
              </div>
            )}
          </div>
        </div>

        {/* Project Summary */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Project Activity</h2>
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Projects</span>
              <span className="text-white font-bold">{stats?.projectCount || 0}</span>
            </div>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    Completion Rate
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {stats?.totalTasks > 0 ? Math.round(((stats.completedTasks || 0) / stats.totalTasks) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-800">
                <div 
                  style={{ width: `${stats?.totalTasks > 0 ? Math.round(((stats.completedTasks || 0) / stats.totalTasks) * 100) : 0}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-1000"
                ></div>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Keep going! You've completed {stats?.completedTasks || 0} tasks this week.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
