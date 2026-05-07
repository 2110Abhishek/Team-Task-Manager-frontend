import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Plus, 
  Folder, 
  MoreVertical, 
  Users, 
  Calendar,
  Search,
  LayoutGrid,
  List,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const { user: authUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Error fetching projects', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/projects', newProject);
      setProjects([res.data, ...projects]);
      setShowModal(false);
      setNewProject({ name: '', description: '' });
    } catch (error) {
      console.error('Error creating project', error);
    }
  };

  const deleteProject = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p.id !== id));
      setDeleteConfirm({ show: false, id: null });
    } catch (error) {
      console.error('Error deleting project', error);
      alert('Failed to delete project. You may not have permission.');
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-1">Manage and organize your team workspaces</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-blue-500 shadow-sm' : 'text-slate-500'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-800 text-blue-500 shadow-sm' : 'text-slate-500'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-5 h-5" />
            <span>Create Project</span>
          </button>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <select className="bg-slate-950/50 border border-slate-700 rounded-xl py-2 px-4 text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>All Projects</option>
          <option>Active</option>
          <option>Completed</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-800 animate-pulse rounded-2xl"></div>)}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {projects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={viewMode === 'grid' 
                ? "glass p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group relative"
                : "glass p-4 rounded-xl border border-white/5 flex items-center justify-between hover:border-blue-500/30 transition-all"
              }
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-blue-600/20 p-3 rounded-2xl text-blue-500">
                      <Folder className="w-6 h-6" />
                    </div>
                    <div className="relative group/menu">
                      <button className="text-slate-500 hover:text-white p-1 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 hidden group-hover/menu:block z-20">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 min-w-[140px]">
                          {authUser?.role === 'ADMIN' && (
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                setDeleteConfirm({ show: true, id: project.id });
                              }}
                              className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete Project
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Link to={`/projects/${project.id}`} className="block group">
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{project.name}</h3>
                    <p className="text-slate-400 text-sm mt-2 line-clamp-2 min-h-[40px]">{project.description || 'No description provided.'}</p>
                  </Link>

                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {project.members?.slice(0, 3).map((member, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white" title={member.name}>
                          {member.name?.[0] || 'U'}
                        </div>
                      ))}
                      {(project.members?.length || 0) > 3 && (
                        <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-400">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {project.members?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {project._count?.tasks || 0} Tasks
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600/20 p-2 rounded-lg text-blue-500">
                      <Folder className="w-5 h-5" />
                    </div>
                    <div>
                      <Link to={`/projects/${project.id}`} className="text-white font-bold hover:text-blue-400">{project.name}</Link>
                      <p className="text-xs text-slate-500">{project._count?.tasks || 0} Tasks • Created by {project.owner?.name || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="flex -space-x-2">
                        {project.members?.slice(0, 3).map((member, i) => (
                          <div key={i} className="w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-white">
                            {member.name?.[0] || 'U'}
                          </div>
                        ))}
                     </div>
                   <div className="relative group/menu">
                      <button className="text-slate-500 hover:text-white p-1 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 hidden group-hover/menu:block z-20">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 min-w-[140px]">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              setDeleteConfirm({ show: true, id: project.id });
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete Project
                          </button>
                        </div>
                      </div>
                   </div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass w-full max-w-lg p-8 rounded-2xl relative z-10 border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Create New Project</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Project Name</label>
                  <input
                    type="text"
                    required
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="E.g. Mobile App Redesign"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea
                    rows={4}
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What is this project about?"
                  />
                </div>
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-900 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-500/20"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm({ show: false, id: null })} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass w-full max-w-md p-8 rounded-2xl relative z-10 border border-red-500/20">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white text-center mb-2">Delete Project?</h2>
              <p className="text-slate-400 text-center mb-8">
                Are you sure you want to delete this project? All associated tasks will be permanently removed. 
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirm({ show: false, id: null })}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => deleteProject(deleteConfirm.id)}
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

export default Projects;
