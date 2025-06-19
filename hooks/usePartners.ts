// hooks/usePartners.ts
import { useState, useEffect } from 'react';
import { Partner, PartnerFilters, UpdatePartnerRequest } from '@/types/partners';
import { PartnerAPI } from '@/lib/api/partners';

export const usePartners = (filters?: PartnerFilters) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartners = async () => {
    setLoading(true);
    setError(null);
    
    const response = await PartnerAPI.getAllPartners(filters);
    
    if (response.success) {
      setPartners((response.data as any).partners || []);
    } else {
      setError(response.error || 'Failed to fetch partners');
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchPartners();
  }, [filters?.status, filters?.search, filters?.page]);

  const updatePartner = async (id: string, data: UpdatePartnerRequest) => {
    const response = await PartnerAPI.updatePartner(id, data);
    
    if (response.success) {
      setPartners(prev => 
        prev.map(partner => 
          partner._id === id ? { ...partner, ...response.data } : partner
        )
      );
    }
    
    return response;
  };

  const deletePartner = async (id: string) => {
    const response = await PartnerAPI.deletePartner(id);
    
    if (response.success) {
      setPartners(prev => prev.filter(partner => partner._id !== id));
    }
    
    return response;
  };

  return {
    partners,
    loading,
    error,
    refetch: fetchPartners,
    updatePartner,
    deletePartner
  };
};
