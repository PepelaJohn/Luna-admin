// utils/partnerActions.ts
import { PartnerAPI } from '@/lib/api/partners';
import { UpdatePartnerRequest } from '@/types/partners';

export const partnerActions = {
  // Quick status change actions
  approvePartner: async (id: string) => {
    return await PartnerAPI.updatePartner(id, { 
      status: 'approved',
      approvedDate: new Date().toISOString()
    });
  },

  rejectPartner: async (id: string, reason?: string) => {
    return await PartnerAPI.updatePartner(id, { 
      status: 'rejected',
      notes: reason ? `Rejected: ${reason}` : 'Rejected by admin'
    });
  },

  suspendPartner: async (id: string, reason?: string) => {
    return await PartnerAPI.updatePartner(id, { 
      status: 'suspended',
      notes: reason ? `Suspended: ${reason}` : 'Suspended by admin'
    });
  },

  reactivatePartner: async (id: string) => {
    return await PartnerAPI.updatePartner(id, { status: 'approved' });
  },

  // Bulk operations
  bulkUpdateStatus: async (ids: string[], status: 'approved' | 'rejected' | 'suspended') => {
    const results = await Promise.allSettled(
      ids.map(id => PartnerAPI.updatePartner(id, { status }))
    );
    
    return {
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      results
    };
  },

  // Export partners data
  exportPartners: async (filters?: any) => {
    const response = await PartnerAPI.getAllPartners(filters);
    if (response.success && response.data) {
      const csv = convertToCSV(response.data);
      downloadCSV(csv, 'partners-export.csv');
    }
    return response;
  }
};

// Helper functions for export
function convertToCSV(data: any[]): string {
  if (!data.length) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ];
  
  return csvRows.join('\n');
}

function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
