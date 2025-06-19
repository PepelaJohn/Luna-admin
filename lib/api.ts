// @/lib/api.ts
import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { AuthResponse } from "@/types/auth";
import { CreateUserFormData, LogResponse, UpdateuserData, User } from "./types";
import {
  FetchPartnersParams,
  IStatsResponse,
  PartnersApiResponse,
} from "@/types/api";

// Default axios instance for regular API calls
export const API: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Separate axios instance for token refresh (to avoid infinite loops)
export const refreshApi: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 5000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor to add auth headers if needed
API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add any additional headers or processing here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
API.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return API(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const response = await refreshApi.post("/auth/refresh");

        if (response.data?.success) {
          processQueue(null, response.data?.token);
          return API(originalRequest);
        } else {
          throw new Error("Token refresh failed");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Redirect to login or dispatch logout action
        window.location.href = "/auth";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return error.response.data;
  }
);

// Auth API calls
export const authApi = {
  // Check current authentication status
  me: async (): Promise<AuthResponse> => {
    const response = await API.get("/auth/me");
    return response.data;
  },

  // Login user
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await API.post("/auth/login", { email, password });
    return response.data;
  },

  // Register new user
  register: async (
    name: string,
    email: string,
    password: string,
    role?: string
  ): Promise<AuthResponse> => {
    const response = await API.post("/auth/register", {
      name,
      email,
      password,
      role,
    });
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    await API.post("/auth/logout");
  },

  // Refresh token
  refresh: async (): Promise<AuthResponse> => {
    const response = await refreshApi.post("/auth/refresh");
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string): Promise<AuthResponse> => {
    const response = await API.post("/auth/verify-email", { token });
    return response.data;
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<AuthResponse> => {
    const response = await API.post("/auth/forgot-password", { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (
    token: string,
    password: string
  ): Promise<AuthResponse> => {
    const response = await API.post("/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  },

  // Change password (authenticated)
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<AuthResponse> => {
    const response = await API.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Update profile
  updateProfile: async (data: {
    name?: string;
    email?: string;
    avatar?: string;
  }): Promise<AuthResponse> => {
    const response = await API.put("/auth/profile", data);
    return response.data;
  },
};

// Export default api instance for other API calls
export default API;

interface UsersResponse {
  users: User[];
  pagination: Pagination;
  success: boolean;
}
export interface deleteUserResponse {
  data: User;
  success: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const usersApi = {
  getUsers: async (role?: string): Promise<UsersResponse> => {
    const response = await API.get(`/users?role=${role}`);
    if (response?.data?.success) {
      return response.data;
    } else {
      return response as unknown as UsersResponse;
    }
  },

  deleteUser: async (id: string): Promise<deleteUserResponse> => {
    const response = await API.delete(`/users/${id}`);
    if (response?.data?.success) {
      return response.data;
    } else {
      return response as unknown as deleteUserResponse;
    }
  },

  createUser: async (createUserData: CreateUserFormData) => {
    const response: any = await API.post("/users", createUserData);

    if (response?.data?.success) {
      return response.data;
    } else {
      return response;
    }
  },
  updateUser: async ({
    updateUserData,
    id,
  }: {
    id: string;
    updateUserData: UpdateuserData;
  }) => {
    const response: any = await API.put(`/users/${id}`, updateUserData);
    if (response?.data?.success) {
      return response.data;
    } else {
      return response;
    }
  },
};

interface ILogResponse {
  logs: LogResponse[];
  success: boolean;
}

export const logsApi = {
  getLogs: async (): Promise<ILogResponse> => {
    const response = await API.get("/logs");

    if ((response as any)?.data?.success) {
      return response.data;
    } else {
      return response as unknown as ILogResponse;
    }
  },
};

interface ISubResponse {
  subscribers: SubUser[];
  pagination: Pagination;
  success: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface SubUser {
  preferences: Preferences;
  _id: string;
  email: string;
  confirmed: boolean;
  isActive: boolean;
  tags: any[];
  subscribedAt: string;
  updatedAt: string;
  confirmedAt: string;
  confirmationTokenExpires: string;
}

interface Preferences {
  frequency: string;
  categories: any[];
}

export const subsApi = {
  getSubs: async (): Promise<ISubResponse> => {
    const response = await API.get("/subscribers");
    if (response?.data?.success) {
      return response.data;
    } else {
      return response as unknown as ISubResponse;
    }
  },
};

export const partnersApi = {
  getPartners: async (
    params: FetchPartnersParams
  ): Promise<PartnersApiResponse> => {
    const queryParams = new URLSearchParams();

    // Add filters and options to the query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const response = await API.get<PartnersApiResponse>(
      `/partners?${queryParams.toString()}`
    );
    if (response?.data?.success) {
      return response.data;
    } else {
      return response as any;
    }
  },
  getPartnerStats: async (): Promise<IStatsResponse> => {
    const response = await API.get("/partners/stats");
    if (response?.data?.success) {
      return response.data;
    } else {
      return response as unknown as IStatsResponse;
    }
  },
};
