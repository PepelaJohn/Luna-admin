// @/context/AuthContext.ts (Updated with API extraction)
import { useState, useEffect } from 'react';
import { authApi, logsApi, usersApi } from '@/lib/api';
import { LogResponse, Pagination, User } from '@/lib/types';
// import { AuthResponse } from '@/types/auth';



export function useLogs(page?:number, role?:'normal') {
  const [logs, setLogs] = useState<LogResponse[] | null>(null);
  


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUserLogs();
  }, []);

  const getUserLogs = async () => {
    try {
      const data = await logsApi.getLogs();
   
      setLogs(data.logs)
      
     
    } catch (err) {
      setError('Failed to check authentication');
      setLogs(null);
    } finally {
      setLoading(false);
    }
  };

  

  


 

  return {
    getUserLogs,
    logs,
    loading,
    error
   
   
  };
}