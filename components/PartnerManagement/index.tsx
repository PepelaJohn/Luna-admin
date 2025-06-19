'use client'
import React, { useState } from 'react';
import { Partner, PartnerFilters, UpdatePartnerRequest } from '@/types/partners';
import { usePartners } from '@/hooks/usePartners';
import { usePopup } from '@/context/PopupContext';
import Link from 'next/link';

// Status Badge Component
const StatusBadge: React.FC<{ status: Partner['status'] }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Partner Table Component
const PartnerTable: React.FC<{
  partners: Partner[];
  onEdit: (partner: Partner) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}> = ({ partners, onEdit, onDelete, loading }) => {
   
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (partners.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No partners found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Partner
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Application Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {partners?.map((partner) => (
            <tr key={partner._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <Link href={`/dashboard/partners/${partner._id}`}>
                  <div className="text-sm font-medium text-gray-900">{partner.firstName +" "+ partner.lastName}</div>
                  <div className="text-sm text-gray-500">{partner.email}</div>
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {partner.companyName || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={partner.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(partner.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(partner)}
                  className="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(partner._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Partner Filters Component
const PartnerFiltersComp: React.FC<{
  filters: PartnerFilters;
  onFiltersChange: (filters: PartnerFilters) => void;
}> = ({ filters, onFiltersChange }) => {
  const [search, setSearch] = useState(filters.search || '');

  const handleSearchSubmit = () => {
    onFiltersChange({ ...filters, search });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search partners..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearchSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>
        
        <select
          value={filters.status || ''}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value || undefined })}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
    </div>
  );
};

// Edit Partner Modal Component
const EditPartnerModal: React.FC<{
  partner: Partner | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdatePartnerRequest) => Promise<void>;
}> = ({ partner, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<UpdatePartnerRequest>({});
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (partner) {
      setFormData({
        firstName: partner.firstName,
        lastName:partner.lastName,
        email: partner.email,
        phone: partner.phone,
        companyName: partner.companyName,
        status: partner.status,
        notes: partner.notes
      });
    }
  }, [partner]);

  if (!isOpen || !partner) return null;

  const handleSubmit = () => {
    setLoading(true);
    
    onSave(formData).then(() => {
      onClose();
    }).catch((error) => {
      console.error('Error saving partner:', error);
    }).finally(() => {
      setLoading(false);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Partner</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName || ''}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName || ''}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm  font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              value={formData.companyName || ''}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status || ''}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Partner['status'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Partners Management Component
const PartnersManagement: React.FC = () => {
  const [filters, setFilters] = useState<PartnerFilters>({});
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const {showError,  showSuccess} = usePopup()
  const { partners, loading, error, updatePartner, deletePartner } = usePartners(filters);

  const handleEdit = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsEditModalOpen(true);
  };

  const handleSave = async (data: UpdatePartnerRequest) => {
    if (selectedPartner) {
      const response = await updatePartner(selectedPartner._id, data);
      if (response.success) {
        showSuccess('Partner updated successfully!')
      } else {
        showError(response.error || 'Failed to update partner')
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this partner?')) {
      const response = await deletePartner(id);
      if (response.success) {
        showSuccess('Partner deleted successfully!');
      } else {
        showError(response.error || 'Failed to delete partner');
      }
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Partner Management</h1>
        <p className="text-gray-600">Manage partner applications and status</p>
      </div>

      <PartnerFiltersComp 
        filters={filters} 
        onFiltersChange={setFilters} 
      />

      <div className="bg-white rounded-lg shadow">
        <PartnerTable
          partners={partners}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>

      <EditPartnerModal
        partner={selectedPartner}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default PartnersManagement;