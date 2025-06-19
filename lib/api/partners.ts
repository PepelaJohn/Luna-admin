import { ApiResponse, Partner, PartnerFilters, UpdatePartnerRequest } from "@/types/partners";
import API from "../api";

// lib/api/partners.ts
export class PartnerAPI {
  private static baseUrl = '/partners';

  static async getPartner(id: string): Promise<ApiResponse<Partner>> {
    try {
      const response = await API.get(`${this.baseUrl}/${id}`);
      if (response?.data?.success) {
      return response.data;
    } else {
      return response  as any
    }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch partner'
      };
    }
  }

  static async updatePartner(id: string, data: UpdatePartnerRequest): Promise<ApiResponse<Partner>> {
    try {
      const response = await API.put(`${this.baseUrl}/${id}`, data);
      if (response?.data?.success) {
      return response.data;
    } else {
      return response  as any
    }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update partner'
      };
    }
  }

  static async deletePartner(id: string): Promise<ApiResponse> {
    try {
      const response = await API.delete(`${this.baseUrl}/${id}`);
      if (response?.data?.success) {
      return response.data;
    } else {
      return response  as any
    }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete partner'
      };
    }
  }

  static async getAllPartners(filters?: PartnerFilters): Promise<ApiResponse<Partner[]>> {
    try {
      const params: Record<string, string | number> = {};
      if (filters?.status) params.status = filters.status;
      if (filters?.search) params.search = filters.search;
      if (filters?.page) params.page = filters.page;
      if (filters?.limit) params.limit = filters.limit;

      const response = await API.get(this.baseUrl, { params });
      if (response?.data?.success) {
      return response.data;
    } else {
      return response  as any
    }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch partners'
      };
    }
  }
}