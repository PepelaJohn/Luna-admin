// @/context/AuthContext.ts (Updated with API extraction)
import { useState, useEffect } from 'react';
import { authApi, usersApi } from '@/lib/api';
import { Pagination, User } from '@/lib/types';
// import { AuthResponse } from '@/types/auth';



export function useData(page?:number, role?:'normal') {
  const [users, setUsers] = useState<User[] | null>(null);
  

const [pagination, setPagination] = useState<Pagination>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    try {
      const data = await usersApi.getUsers();
   
      setUsers(data.users)
      setPagination(data.pagination)
     
    } catch (err) {
      setError('Failed to check authentication');
      setUsers(null);
    } finally {
      setLoading(false);
    }
  };

  

  const updateProfile = async (data: {
    name?: string;
    email?: string;
    avatar?: string;
  }) => {
    try {
      setError(null);
      const response = await authApi.updateProfile(data);
      
      if (response.success && response.user) {
        // setUser(response.user);
        return { success: true, message: response.message };
      } else {
        setError(response.message || 'Profile update failed');
        return { success: false, error: response.message };
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteUser = async(id:string)=>{
    try {
      setLoading(true)
      const data = await usersApi.deleteUser(id)
     if (data.success){
        const updatedUsers = users?.filter((user) => user._id !== id) || [];
      setUsers(updatedUsers);
      

      
     }
    } catch (error:any) {
     const errorMsg = error?.response?.data?.message || error.message || "Failed to delete user";
    setError(errorMsg);
    return { success: false, error: errorMsg };
    } finally{
      setLoading(false)
    }
  }


 

  return {
    getUsers,
    deleteUser,
    loading,
    error,
    pagination,
    updateProfile,
   users,
   
   
  };
}