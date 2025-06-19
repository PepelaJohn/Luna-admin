export interface CreatePartnerRequest {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  companyName: string;
  industry?: string;
  region: string;
  interest: string;
  deliveryNeeds?: string;
}



export interface PartnerFilters {
  status?: string;
  priority?: string;
  region?: string;
  industry?: string;
  interest?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}


// types/partners.ts
export interface Partner {
  _id: string;
  firstName: string;
  lastName:string;
  email: string;
  phone?: string;
  companyName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';

  approvedDate?: string;
  documents?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePartnerRequest {
  firstName?: string;
  lastName?:string;
  email?: string;
  phone?: string;
  companyName?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
  notes?: string;
  approvedDate?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PartnerFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// lib/api/partners.ts
export class PartnerAPI {
  private static baseUrl = '/api/partners';

  static async getPartner(id: string): Promise<ApiResponse<Partner>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch partner'
      };
    }
  }

  static async updatePartner(id: string, data: UpdatePartnerRequest): Promise<ApiResponse<Partner>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update partner'
      };
    }
  }

  static async deletePartner(id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete partner'
      };
    }
  }

  static async getAllPartners(filters?: PartnerFilters): Promise<ApiResponse<Partner[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());

      const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch partners'
      };
    }
  }
}

