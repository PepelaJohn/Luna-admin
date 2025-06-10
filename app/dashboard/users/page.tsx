'use client'
import UsersTable from "@/components/admin/UserTable";
import { useData } from "@/hooks/useData";
import React from "react";

const Subs = () => {
    const {users, pagination} = useData()
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 lg:p-6 border-b">
                  <h3 className="text-lg font-semibold">User Management</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage users, roles, and permissions
                  </p>
                </div>
                <UsersTable
                  users={users || []}
                  pagination={pagination}
                  onPageChange={(page: number) => {
                    // Call your getUsers function with the new page
                    // getUsers();
                  }}
                  onUserUpdate={async (userId, updates) => {
                    // Implement user update logic here
                    try {
                      // Make API call to update user
                      // await updateUser(userId, updates);

                      // Refresh the users list
                      // getUsers();

                      // Show success message
                    } catch (error) {
                      console.error("Failed to update user:", error);
                      // Show error message
                    }
                  }}
                />
              </div>
  );
};

export default Subs;
