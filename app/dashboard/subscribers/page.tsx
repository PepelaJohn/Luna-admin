import SubscribersTable from "@/components/admin/SubscribersTable";
import React from "react";

const Subs = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Email Subscribers</h3>
        <p className="text-sm text-gray-600 mt-1">
          Manage your newsletter subscribers
        </p>
      </div>
      <SubscribersTable />
    </div>
  );
};

export default Subs;
