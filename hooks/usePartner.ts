
// hooks/usePartner.ts
import { useState, useEffect } from 'react';
import { Partner, UpdatePartnerRequest } from '@/types/partners';
import { PartnerAPI } from '@/lib/api/partners';

export const usePartner = (id: string) => {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartner = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    const response = await PartnerAPI.getPartner(id);
    
    if (response.success) {
      setPartner(response.data || null);
    } else {
      setError(response.error || 'Failed to fetch partner');
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchPartner();
  }, [id]);

  const updatePartner = async (data: UpdatePartnerRequest) => {
    const response = await PartnerAPI.updatePartner(id, data);
    
    if (response.success) {
      setPartner(response.data || null);
    }
    
    return response;
  };

  const deletePartner = async () => {
    const response = await PartnerAPI.deletePartner(id);
    return response;
  };

  return {
    partner,
    loading,
    error,
    refetch: fetchPartner,
    updatePartner,
    deletePartner
  };
};