import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { projectApi } from '../api/projectApi';
import { useAuth } from './AuthContext';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null); // null means "All Projects"
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await projectApi.getProjects();
      const list = data.projects || [];
      setProjects(list);

      // Validate selectedProjectId: If the selected project is no longer in the authorized projects list, reset it
      setSelectedProjectId((currentSelected) => {
        if (!currentSelected) return null;
        const exists = list.some((p) => Number(p.id) === Number(currentSelected));
        return exists ? currentSelected : null;
      });
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    } else {
      setProjects([]);
      setSelectedProjectId(null);
    }
  }, [isAuthenticated, user?.id, isAdmin, fetchProjects]);

  const addProject = async (projectData) => {
    const res = await projectApi.createProject(projectData);
    if (res?.project) {
      setProjects((prev) => [res.project, ...prev]);
      return res.project;
    }
    return null;
  };

  const updateProject = async (projectId, projectData) => {
    const res = await projectApi.updateProject(projectId, projectData);
    if (res?.project) {
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, ...res.project } : p))
      );
      return res.project;
    }
    return null;
  };

  const deleteProject = async (projectId) => {
    await projectApi.deleteProject(projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
    }
  };

  const selectedProject = projects.find((p) => Number(p.id) === Number(selectedProjectId)) || null;

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProjectId,
        setSelectedProjectId,
        selectedProject,
        loading,
        fetchProjects,
        addProject,
        updateProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
