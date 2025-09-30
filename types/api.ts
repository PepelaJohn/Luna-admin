export interface PartnerFilters {
  status?: string;
  priority?: string;
  region?: string;
  industry?: string;
  interest?: string;
}

export interface FetchPartnersParams extends PartnerFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}



export interface Partner {
    _id:string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  companyName: string;
  industry?: string;
  region: string;
  interest: string;
  deliveryNeeds?: string;
  status: "pending" | "reviewing" | "approved" | "rejected";
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  contactedAt?: Date;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
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



export interface IStatsResponse {
  stats: FetchedStatsType;
  success: boolean;
  errror?: any;
}

export interface FetchedStatsType {
  totalPartners: number;
  statusStats: StatusStat[];
  priorityStats: StatusStat[];
  regionStats: StatusStat[];
  industryStats: StatusStat[];
  recentPartners: RecentPartner[];
  pendingPartners: number;
  approvedPartners: number;
}

interface RecentPartner {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  createdAt: Date;
  status: "pending" | "reviewing" | "approved" | "rejected";
  industry?: string;
}

interface StatusStat {
  _id: string;
  count: number;
}



// types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FinancialStats {
  summary: {
    totalIncome: number;
    totalExpenditure: number;
    balance: number;
    incomeCount: number;
    expenditureCount: number;
    averageIncome: number;
    averageExpenditure: number;
  };
  categoryBreakdown: Array<{
    category: string;
    total: number;
    count: number;
  }>;
  monthlyTrends: Array<{
    year: number;
    month: number;
    type: 'income' | 'expenditure';
    total: number;
  }>;
}

export interface FinancialRecordFilters {
  type?: 'income' | 'expenditure';
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

