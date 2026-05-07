import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  Plus, 
  Users, 
  Calendar, 
  MessageSquare, 
  MoreHorizontal,
  ChevronLeft,
  UserPlus,
  Loader2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM' });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: null, id: null });

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (error) {
      console.error('Error fetching project', error);
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/tasks', { ...newTask, projectId: id });
      setProject(prev => prev ? {
        ...prev,
        tasks: [...(prev.tasks || []), res.data]
      } : null);
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM' });
    } catch (error) {
      console.error('Error creating task', error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/projects/${id}/members`, { email: newMemberEmail });
      setProject(res.data);
      setShowMemberModal(false);
      setNewMemberEmail('');
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding member');
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      setProject(prev => prev ? {
        ...prev,
        tasks: (prev.tasks || []).map(t => t.id === taskId ? { ...t, status } : t)
      } : null);
    } catch (error) {
      console.error('Error updating task', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setProject(prev => prev ? {
        ...prev,
        tasks: (prev.tasks || []).filter(t => t.id !== taskId)
      } : null);
      setDeleteConfirm({ show: false, type: null, id: null });
    } catch (error) {
      console.error('Error deleting task', error);
      alert('Failed to delete task');
    }
  };

  const deleteProject = async () => {
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project', error);
      alert('Failed to delete project. Only the owner or an admin can delete projects.');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-950"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  if (!project) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white gap-4">
      <p className="text-slate-400">Project not found or you don't have access.</p>
      <button onClick={() => navigate('/projects')} className="text-blue-500 hover:underline">Go back to Projects</button>
    </div>
  );

  const columns = [
    { id: 'TODO', title: 'To Do', color: 'bg-slate-500' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'COMPLETED', title: 'Completed', color: 'bg-emerald-500' }
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/projects')} className="p-2 hover:bg-slate-900 rounded-lg text-slate-400">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{project?.name}</h1>
              {authUser?.role === 'ADMIN' && (
                <button 
                  onClick={() => setDeleteConfirm({ show: true, type: 'PROJECT', id: project.id })}
                  className="p-1.5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Delete Project"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            <p className="text-slate-400 mt-1">{project?.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-3 mr-4">
            {project.members?.map((member, i) => (
              <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-4 border-slate-950 flex items-center justify-center text-xs font-bold text-white shadow-lg" title={member.name}>
                {member.name?.[0] || 'U'}
              </div>
            ))}
            <button 
              onClick={() => setShowMemberModal(true)}
              className="w-10 h-10 rounded-full bg-blue-600/20 border-4 border-slate-950 flex items-center justify-center text-blue-500 hover:bg-blue-600/30 transition-all shadow-lg"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={() => setShowTaskModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-5 h-5" />
            <span>Add Task</span>
          </button>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(column => (
          <div key={column.id} className="flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${column.color}`} />
                <h2 className="font-bold text-slate-300 uppercase tracking-wider text-sm">{column.title}</h2>
                <span className="bg-slate-900 text-slate-500 px-2 py-0.5 rounded-full text-xs">
                  {project?.tasks?.filter(t => t.status === column.id).length || 0}
                </span>
              </div>
            </div>

            <div className="flex-1 bg-slate-900/30 rounded-2xl p-3 border border-slate-900/50 space-y-4">
              {project?.tasks?.filter(t => t.status === column.id).map((task, idx) => (
                <motion.div
                  key={task.id}
                  layoutId={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      task.priority === 'HIGH' ? 'bg-red-500/10 text-red-500' : 
                      task.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {task.priority}
                    </span>
                    <div className="relative group/menu">
                      <button className="text-slate-600 hover:text-white p-1 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 hidden group-hover/menu:block z-20">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 min-w-[120px]">
                          <button 
                            onClick={() => setDeleteConfirm({ show: true, type: 'TASK', id: task.id })}
                            className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete Task
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-slate-200 font-medium mb-2">{task.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">{task.description}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white">
                        {task.assignee?.name?.[0] || '?'}
                      </div>
                      <span className="text-[10px] text-slate-500">{task.assignee?.name || 'Unassigned'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <select 
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className="bg-transparent text-[10px] text-blue-500 focus:outline-none"
                      >
                        {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              <button 
                onClick={() => {
                  setNewTask({...newTask, status: column.id});
                  setShowTaskModal(true);
                }}
                className="w-full py-3 rounded-xl border-2 border-dashed border-slate-800 text-slate-600 hover:text-slate-400 hover:border-slate-700 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTaskModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass w-full max-w-lg p-8 rounded-2xl relative z-10 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Create New Task</h2>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                  <input type="text" required value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea rows={3} value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                    <select value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 text-white">
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Assignee</label>
                    <select value={newTask.assigneeId || ''} onChange={(e) => setNewTask({...newTask, assigneeId: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 text-white">
                      <option value="">Select Assignee</option>
                      {project.members?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 px-4 py-3 rounded-xl border border-slate-700 text-slate-300">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold">Create Task</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Member Modal */}
      <AnimatePresence>
        {showMemberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMemberModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass w-full max-w-md p-8 rounded-2xl relative z-10 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Add Team Member</h2>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Member Email</label>
                  <input type="email" required value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="colleague@company.com" />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 mt-4">
                  Add Member
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm({ show: false, type: null, id: null })} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass w-full max-w-md p-8 rounded-2xl relative z-10 border border-red-500/20">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white text-center mb-2">Are you sure?</h2>
              <p className="text-slate-400 text-center mb-8">
                This action will permanently delete this {deleteConfirm.type === 'PROJECT' ? 'project and all its tasks' : 'task'}. 
                This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirm({ show: false, type: null, id: null })}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => deleteConfirm.type === 'PROJECT' ? deleteProject() : deleteTask(deleteConfirm.id)}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-600/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectDetail;
