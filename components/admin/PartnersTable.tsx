

// ===========================================
// FILE: src/components/admin/PartnersTable.tsx
// ===========================================
'use client';

import React, { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle 
} from 'lucide-react';

import { Loading } from '../LoadingComponent';
import { partnersApi } from '@/lib/api';
import { Partner } from '@/types/api';

interface PartnersTableProps {
  isCompact?: boolean;
}


export interface PartnersApiResponse {
  success: boolean;
  data: {
    partners: Partner[];
    pagination: IPagination;
  };
}

export interface IPagination {
  total: number;
  page: number;
  pages: number;
  limit: number;
}


const PartnersTable: React.FC<PartnersTableProps> = ({  isCompact = false }) => {


  

const [loading, setLoading] = useState(false);



const [partners, setPartners] = useState<Partner[]>([]);

useEffect(()=>{
  setLoading(true)
  const getPartners = async ()=>{
    // can add params such as industry, interest, priority,region ,sortBy, status
    // Industry categories are Healthcare Government Logistics Retail agriculture NGO Other
    // Regions are Nairobi, Central Kenya Coast Western Eastern Nothern Rift Valley International
    // priority is 'low' | 'medium' | 'high';  
    // status: "pending" | "reviewing" | "approved" | "rejected";
    const response:PartnersApiResponse = await partnersApi.getPartners({limit : isCompact ? 3 : 10, page:1})
    console.log(response)
    if(response.success){
      console.log(response.data)
      setPartners(response.data.partners)
    }
    setLoading(false)
  }
  getPartners()
},[])
 
  const getStatusColor = (status: Partner['status']) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'reviewing': return 'text-blue-600 bg-blue-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: Partner['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'reviewing': return <AlertCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if(loading) return <Loading></Loading>

  if (isCompact) {
    return (
      <div className="space-y-3">
        {partners?.slice(0,3).map((partner) => (
          <div key={partner._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate text-sm lg:text-base">{partner.companyName}</p>
              <p className="text-xs lg:text-sm text-gray-500 capitalize">{partner.industry}</p>
            </div>
            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(partner.status)}`}>
              {getStatusIcon(partner.status)}
              <span className="ml-1 capitalize">{partner.status}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto ">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {partners?.map((partner) => (
            <tr key={partner._id} className="hover:bg-gray-50">
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900 text-sm lg:text-base">{partner.companyName}</div>
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500 capitalize">{partner.industry}</div>
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(partner.status)}`}>
                  {getStatusIcon(partner.status)}
                  <span className="ml-1 capitalize">{partner.status}</span>
                </div>
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                { new Date(partner?.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PartnersTable;
