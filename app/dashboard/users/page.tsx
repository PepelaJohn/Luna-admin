"use client";
import UsersTable from "@/components/admin/UserTable";
import { useData } from "@/hooks/useData";
import Link from "next/link";
import React from "react";
import { Loading } from "../logs/page";
import { Plus } from "lucide-react";

const Subs = () => {
  const { users, pagination, loading } = useData();
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 lg:p-6 border-b flex border-gray-200">
        <div className="flex flex-1 flex-col justify-center">
          <h3 className="text-lg font-semibold">User Management</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage users, roles, and permissions
          </p>
        </div>

        <div className="flex items-center">
          <Link
            href={"/dashboard/users/new"}
            className="cursor-pointer flex items-center text-sm gap-2 border rounded-sm
   p-2"
          >
            <span><Plus className="text-sm w-4"></Plus></span>Create New User
          </Link>
        </div>
      </div>
      {loading ? (
        <Loading></Loading>
      ) : (
        <UsersTable
          users={users || []}
          pagination={pagination}
          onPageChange={(page: number) => {
            // Call your getUsers function with the new page
            // getUsers();
          }}
        
        />
      )}
    </div>
  );
};

export default Subs;
