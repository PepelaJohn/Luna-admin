

// ===========================================
// FILE: src/components/admin/SubscribersTable.tsx
// ===========================================
'use client';

import React from 'react';
import { Subscriber } from '@/lib/types';
import { CheckCircle, Clock } from 'lucide-react';
import { SubUser } from '@/lib/api';
import { formatDateTime } from '@/utils/date';
import { useSubscribers } from '@/hooks/useSubscribers';
import { Loading } from '@/app/dashboard/logs/page';

interface SubscribersTableProps {
 
  isCompact?: boolean;
}

const SubscribersTable: React.FC<SubscribersTableProps> = ({  isCompact = false }) => {
  const {subscribers, loading} = useSubscribers()
  if (isCompact) {

    return (
  <>
  {
    loading ? <Loading></Loading> :    <div className="space-y-3">
        {subscribers.slice(0,3).map((subscriber) => (
          <div key={subscriber._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate text-sm lg:text-base">{subscriber.email}</p>
              <p className="text-xs lg:text-sm text-gray-500">{formatDateTime(subscriber.subscribedAt)}</p>
            </div>
            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              subscriber.confirmed ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'
            }`}>
              {subscriber.confirmed ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
              {subscriber.confirmed ? 'Confirmed' : 'Pending'}
            </div>
          </div>
        ))}
      </div>
  }
  </>
    );
  }

  return (
   <>
   {
    loading ? <Loading></Loading> :  <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {subscribers.map((subscriber) => (
            <tr key={subscriber._id} className="hover:bg-gray-50">
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900 text-sm lg:text-base">{subscriber.email}</div>
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  subscriber.confirmed ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'
                }`}>
                  {subscriber.confirmed ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                  {subscriber.confirmed ? 'Confirmed' : 'Pending'}
                </div>
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDateTime(subscriber.subscribedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div> 
   }
   </>
  );
};

export default SubscribersTable;