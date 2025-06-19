// components/partners/QuickActions.tsx
'use client'
import React, { useState } from 'react';
import { partnerActions } from '@/utils/partnerActions';
import { Partner } from '@/types/partners';
import { usePopup } from '@/context/PopupContext';

interface QuickActionsProps {
  partner: Partner;
  onUpdate: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ partner, onUpdate }) => {
  const [loading, setLoading] = useState(false);
const {showError, showSuccess} = usePopup()

  const handleAction = async (action: () => Promise<any>, successMessage: string) => {
    setLoading(true);
    try {
      const response = await action();
      if (response.success) {
        showSuccess(successMessage);
        onUpdate();
      } else {
        showError(response.error || 'Action failed');
      }
    } catch (error) {
      showError('Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      {partner.status === 'pending' && (
        <>
          <button
            onClick={() => handleAction(
              () => partnerActions.approvePartner(partner._id),
              'Partner approved successfully!'
            )}
            disabled={loading}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
          >
            Approve
          </button>
          <button
            onClick={() => {
              const reason = prompt('Rejection reason (optional):');
              handleAction(
                () => partnerActions.rejectPartner(partner._id, reason || undefined),
                'Partner rejected successfully!'
              );
            }}
            disabled={loading}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
          >
            Reject
          </button>
        </>
      )}
      
      {partner.status === 'approved' && (
        <button
          onClick={() => {
            const reason = prompt('Suspension reason (optional):');
            handleAction(
              () => partnerActions.suspendPartner(partner._id, reason || undefined),
              'Partner suspended successfully!'
            );
          }}
          disabled={loading}
          className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 disabled:opacity-50"
        >
          Suspend
        </button>
      )}
      
      {partner.status === 'suspended' && (
        <button
          onClick={() => handleAction(
            () => partnerActions.reactivatePartner(partner._id),
            'Partner reactivated successfully!'
          )}
          disabled={loading}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Reactivate
        </button>
      )}
    </div>
  );
};

export default QuickActions;