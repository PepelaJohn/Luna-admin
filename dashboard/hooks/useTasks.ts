
// hooks/useTask.ts - Custom hook for task management
import { useState, useEffect } from 'react';
import { Task, Comment } from '@/types/tasks';
import API from '@/config/apiclient';

interface UseTaskReturn {
  task: Task | null;
  comments: Comment[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  updateTaskStatus: (status: string) => Promise<boolean>;
  addComment: (message: string) => Promise<boolean>;
}

export const useTask = (taskId: string):UseTaskReturn => {
  const [task, setTask] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError(null);

      const data: any = await API.get(`/tasks/${taskId}`);

      if (data?.success) {
        setTask(data);
        setComments(data.comments || []);
      } else {
        throw new Error(data?.message || "Failed to load task");
      }
    } catch (err: any) {
      if (err?.status === 404) {
        setError("Task not found");
      } else if (err?.status === 403) {
        setError("You do not have permission to view this task");
      } else {
        setError(err?.data?.message || err?.message || "Failed to load task");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (status: string): Promise<boolean> => {
    try {
      const data: any = await API.put(`/tasks/${taskId}`, { status });

      if (data?.success) {
        setTask(data);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error updating task status:", err);
      return false;
    }
  };

  const addComment = async (message: string): Promise<boolean> => {
    try {
      const data: any = await API.post(`/tasks/${taskId}/comments`, {
        message: message.trim(),
      });
      console.log(data)
      if (data?.success) {
        setComments((prev) => [...prev, data]);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error adding comment:", err);
      return false;
    }
  };

  useEffect(() => {
    if (taskId) fetchTask();
  }, [taskId]);

  return {
    task,
    comments,
    loading,
    error,
    refresh: fetchTask,
    updateTaskStatus,
    addComment,
  };
};