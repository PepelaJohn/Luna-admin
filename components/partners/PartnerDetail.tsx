// components/partners/PartnerDetail.tsx
'use client'
import React, { useState } from 'react';
import { usePartner } from '@/hooks/usePartner';
import { UpdatePartnerRequest } from '@/types/partners';
import { useRouter } from 'next/navigation';
import { usePopup } from '@/context/PopupContext';

interface PartnerDetailProps {
  partnerId: string;
}

const PartnerDetail: React.FC<PartnerDetailProps> = ({ partnerId }) => {
  const { partner, loading, error, updatePartner, deletePartner } = usePartner(partnerId);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdatePartnerRequest>({});
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  
const {showError, showSuccess} = usePopup()
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updatePartner(formData);
      if (response.success) {
        setIsEditing(false);
        showSuccess('Partner updated successfully!');
      } else {
        showError(response.error || 'Failed to update partner');
      }
    } catch (error) {
      showError('Failed to update partner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this partner? This action cannot be undone.')) {
      const response = await deletePartner();
      if (response.success) {
        showSuccess('Partner deleted successfully!');
        router.push('/admin/partners');
      } else {
        showError(response.error || 'Failed to delete partner');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg m-6">
        Error: {error}
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="p-6 bg-yellow-50 text-yellow-700 rounded-lg m-6">
        Partner not found
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Partners
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Partner Details</h1>
            <p className="text-gray-600">View and manage partner information</p>
          </div>
          
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.firstName || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{partner.firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.lastName || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{partner.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{partner.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{partner.phone || 'N/A'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.companyName || ''}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{partner.companyName || 'N/A'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            {isEditing ? (
              <select
                value={formData.status || ''}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
            ) : (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(partner.status)}`}>
                {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Date
            </label>
            <p className="text-gray-900">{new Date(partner.createdAt).toLocaleDateString()}</p>
          </div>

          {partner.approvedDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Approved Date
              </label>
              <p className="text-gray-900">{new Date(partner.approvedDate).toLocaleDateString()}</p>
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            {isEditing ? (
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900 whitespace-pre-wrap">{partner.notes || 'No notes'}</p>
            )}
          </div>
        </div>
      </div>

      {partner.documents && partner.documents.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
          <div className="space-y-2">
            {partner.documents.map((doc, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-blue-600">📄</span>
                <a href={doc} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Document {index + 1}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerDetail;
