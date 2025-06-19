'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';

import { Loading } from '../../LoadingComponent';
import { partnersApi } from '@/lib/api';
import { Partner } from '@/types/api';
import Link from 'next/link';

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

// API Filter types based on your comments
type Industry = 'Healthcare' | 'Government' | 'Logistics' | 'Retail' | 'agriculture' | 'NGO' | 'Other';
type Region = 'Nairobi' | 'Central Kenya' | 'Coast' | 'Western' | 'Eastern' | 'Northern' | 'Rift Valley' | 'International';
type Priority = 'low' | 'medium' | 'high';
type Status = 'pending' | 'reviewing' | 'approved' | 'rejected';
type SortBy = 'companyName' | 'createdAt' | 'industry' | 'status';

interface ApiFilters {
  industry?: Industry;
  region?: Region;
  priority?: Priority;
  status?: Status;
  sortBy?: SortBy;
  limit?: number;
  page?: number;
  search?: string;
}

const PartnersTable: React.FC<PartnersTableProps> = ({ isCompact = false }) => {
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [pagination, setPagination] = useState<IPagination>({
    total: 0,
    page: 1,
    pages: 1,
    limit: isCompact ? 3 : 10
  });
  
  // Filter states
  const [filters, setFilters] = useState<ApiFilters>({
    limit: isCompact ? 3 : 10,
    page: 1,
    sortBy: 'createdAt'
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const getPartners = useCallback(async (filterParams: ApiFilters) => {
    setLoading(true);
    try {
      const response: PartnersApiResponse = await partnersApi.getPartners(filterParams);
      
      if (response.success) {
        setPartners(response.data.partners);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
      // You might want to add error handling here
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    getPartners(filters);
  }, [getPartners, filters]);

  // Handle search with debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm) {
        setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
      } else {
        setFilters(prev => {
          const { search, ...rest } = prev;
          return { ...rest, page: 1 };
        });
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const handleFilterChange = (key: keyof ApiFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const clearFilters = () => {
    setFilters({
      limit: isCompact ? 3 : 10,
      page: 1,
      sortBy: 'createdAt'
    });
    setSearchTerm('');
  };

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

  const PaginationControls = () => {
    if (isCompact || pagination.pages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex justify-between flex-1 sm:hidden">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {((pagination.page - 1) * pagination.limit) + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              of{' '}
              <span className="font-medium">{pagination.total}</span> results
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      pagination.page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const FilterControls = () => {
    if (isCompact) return null;

    return (
      <div className="mb-4 space-y-4">
        {/* Search and Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 px-4 py-4 items-start sm:items-center justify-between">
          {/* <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search partners..."
              className="pl-10 pr-4 py-2 w-full border focus:outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div> */}

          <div className="flex-1 flex items-center">
            <Link href={'/dashboard/partners/manage'}>Mangage Partners</Link>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center ml-auto gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Industry Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select
                  value={filters.industry || ''}
                  onChange={(e) => handleFilterChange('industry', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Industries</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Government">Government</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Retail">Retail</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="NGO">NGO</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Region Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <select
                  value={filters.region || ''}
                  onChange={(e) => handleFilterChange('region', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Regions</option>
                  <option value="Nairobi">Nairobi</option>
                  <option value="Central Kenya">Central Kenya</option>
                  <option value="Coast">Coast</option>
                  <option value="Western">Western</option>
                  <option value="Eastern">Eastern</option>
                  <option value="Northern">Northern</option>
                  <option value="Rift Valley">Rift Valley</option>
                  <option value="International">International</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={filters.sortBy || 'createdAt'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="companyName">Company Name</option>
                  <option value="industry">Industry</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <Loading />;

  if (isCompact) {
    return (
      <div className="space-y-3">
        {partners?.map((partner) => (
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
    <div className="space-y-4">
      <FilterControls />
      
      <div className="overflow-hidden shadow r md:rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {partners?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 lg:px-6 py-8 text-center text-gray-500">
                    No partners found matching your criteria.
                  </td>
                </tr>
              ) : (
                partners?.map((partner) => (
                  <tr key={partner._id} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <Link href={`/dashboard/partners/${partner._id}`} className="font-medium text-gray-900 text-sm lg:text-base">{partner.companyName}</Link>
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
                      {new Date(partner?.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <PaginationControls />
      </div>
    </div>
  );
};

export default PartnersTable;