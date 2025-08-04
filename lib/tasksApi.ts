// lib/tasksApi.ts
export interface IComment {
  _id: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

export interface IUserRef {
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
}

export interface ITask {
  _id: string;
  title: string;
  description: string;
  assignedBy: IUserRef;
  assignedTo: IUserRef;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: string;
  category: string;
  attachments: string[];
  comments: IComment[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  isOverdue: boolean;
  ageInDays: number;
}

export interface ITaskStats {
  overall: Overall;
  assignment: null;
  byCategory: ByCategory[];
  byPriority: ByPriority[];
  recentActivity: RecentActivity[];
  upcomingTasks: any[];
}

interface RecentActivity {
  _id: string;
  created: number;
  completed: number;
}

interface ByPriority {
  _id: string;
  count: number;
  completed: number;
  overdue: number;
}

interface ByCategory {
  _id: string;
  count: number;
  completed: number;
  pending: number;
  inProgress: number;
}

interface Overall {
  _id: null;
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  overdue: number;
  highPriority: number;
  urgentPriority: number;
}



interface ItaskStatsPromise {
  success:boolean,
  stats:ITaskStats
}

export interface ITaskFilters {
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
  assignedBy?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ITasksResponse {
  tasks: ITask[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalTasks: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface ItaskResponsePromise{
  success:boolean,
  data:ITasksResponse
}

export interface ICreateTaskData {
  title: string;
  description: string;
  assignedTo: IAssignableUser | null; // userId
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  category: string;
  attachments?: string[];
  assignedToUserId?:string;
}

export interface IUpdateTaskData {
  title?: string;
  description?: string;
  assignedTo?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: string;
  category?: string;
  attachments?: string[];
}

export interface IAssignableUser  {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar: null;
  canAssignTo: boolean;
  joinedAt: string;
}

export interface ITaskMetadata {
  categories: {
    value: string;
    label: string;
    description: string;
  }[];
  priorities: {
    value: string;
    label: string;
    color: string;
    description: string;
  }[];
  statuses: {
    value: string;
    label: string;
    color: string;
    description: string;
  }[];
}

// API Base Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

class TasksAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Get all tasks with filters
  async getTasks(filters: ITaskFilters = {}): Promise<ItaskResponsePromise> {
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const query = searchParams.toString();
    const endpoint = `/tasks${query ? `?${query}` : ''}`;
    
    return this.request<ItaskResponsePromise>(endpoint);
  }

  // Get single task by ID
  async getTask(taskId: string): Promise<{ task: ITask }> {
    return this.request<{ task: ITask }>(`/tasks/${taskId}`);
  }

  // Create new task
  async createTask(taskData: ICreateTaskData): Promise<{ task: ITask }> {
    return this.request<{ task: ITask }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  // Add this method to your existing TasksAPI class
async createMultipleTasks(taskData: Omit<ICreateTaskData, 'assignedTo' | 'assignedToUserId'>, assignedUsers: IAssignableUser[]): Promise<{ 
  tasks: ITask[];
  successful: number;
  failed: number;
  errors: any[];
}> {
  const results = {
    tasks: [] as ITask[],
    successful: 0,
    failed: 0,
    errors: [] as any[]
  };

  for (const user of assignedUsers) {
    try {
      const singleTaskData: ICreateTaskData = {
        ...taskData,
        assignedTo: user,
        assignedToUserId: user._id
      };

      const response = await this.createTask(singleTaskData);
      
      if (response.task) {
        results.tasks.push(response.task);
        results.successful++;
      } else {
        results.failed++;
        results.errors.push({ user: user.name, error: 'No task returned' });
      }
    } catch (error) {
      results.failed++;
      results.errors.push({
        user: user.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}

  // Update task
  async updateTask(taskId: string, taskData: IUpdateTaskData): Promise<{ task: ITask }> {
    return this.request<{ task: ITask }>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  // Delete/Cancel task
  async deleteTask(taskId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // Get task statistics
  async getTaskStats(): Promise<ItaskStatsPromise> {
    return this.request<ItaskStatsPromise>('/tasks/stats');
  }

  // Get task comments
  async getTaskComments(taskId: string, page = 1, limit = 10): Promise<{
    comments: IComment[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalComments: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    return this.request(`/tasks/${taskId}/comments?page=${page}&limit=${limit}`);
  }

  // Add comment to task
  async addTaskComment(taskId: string, message: string): Promise<{ task: ITask }> {
    return this.request<{ task: ITask }>(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Get assignable users
  async getAssignableUsers(): Promise<{ users: IAssignableUser[] }> {
    return this.request<{ users: IAssignableUser[] }>('/tasks/assignable-users');
  }

  // Get task metadata
  async getTaskMetadata(): Promise<ITaskMetadataResponse> {
    return this.request<ITaskMetadataResponse>('/tasks/metadata');
  }
}

interface ITaskMetadataResponse {
  metadata: Metadata;
  success: boolean;
}

interface Metadata {
  categories: Category[];
  priorities: Priority[];
  statuses: Priority[];
  defaultValues: DefaultValues;
  validation: Validation;
  permissions: Permissions;
}

interface Permissions {
  admin: Admin;
  super_admin: Admin;
}

interface Admin {
  canAssignTo: string[];
  canViewAll: boolean;
  canDeleteAny: boolean;
}

interface Validation {
  title: Title;
  description: Title;
  dueDate: DueDate;
}

interface DueDate {
  mustBeFuture: boolean;
  required: boolean;
}

interface Title {
  minLength: number;
  maxLength: number;
  required: boolean;
}

interface DefaultValues {
  priority: string;
  status: string;
  category: string;
}

interface Priority {
  value: string;
  label: string;
  color: string;
  description: string;
}

interface Category {
  value: string;
  label: string;
  description: string;
}
// Export singleton instance
export const tasksApi = new TasksAPI();

// Mock data for development/testing
export const mockTasksResponse: ITasksResponse = {
  tasks: [
    {
      _id: '1',
      title: 'Update user permissions system',
      description: 'Implement new role-based permissions for the admin panel',
      assignedBy: {
        userId: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'super_admin'
      },
      assignedTo: {
        userId: 'user2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'admin'
      },
      priority: 'high',
      status: 'in_progress',
      dueDate: '2025-06-20T10:00:00Z',
      category: 'user_management',
      attachments: ['doc1.pdf'],
      comments: [
        {
          _id: 'comment1',
          userId: 'user2',
          userName: 'Jane Smith',
          message: 'Started working on this task',
          createdAt: '2025-06-10T08:00:00Z'
        }
      ],
      createdAt: '2025-06-10T08:00:00Z',
      updatedAt: '2025-06-10T09:00:00Z',
      isOverdue: false,
      ageInDays: 2
    },
    {
      _id: '2',
      title: 'Security audit review',
      description: 'Conduct comprehensive security audit of the application',
      assignedBy: {
        userId: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'super_admin'
      },
      assignedTo: {
        userId: 'user3',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        role: 'admin'
      },
      priority: 'urgent',
      status: 'pending',
      dueDate: '2025-06-15T10:00:00Z',
      category: 'security_audit',
      attachments: [],
      comments: [],
      createdAt: '2025-06-08T08:00:00Z',
      updatedAt: '2025-06-08T08:00:00Z',
      isOverdue: true,
      ageInDays: 4
    }
  ],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalTasks: 2,
    hasNextPage: false,
    hasPrevPage: false
  }
};



export const mockTaskMetadata: ITaskMetadata = {
  categories: [
    { value: 'user_management', label: 'User Management', description: 'Tasks related to user accounts and permissions' },
    { value: 'system_config', label: 'System Configuration', description: 'System setup and configuration tasks' },
    { value: 'content_review', label: 'Content Review', description: 'Content moderation and review tasks' },
    { value: 'security_audit', label: 'Security Audit', description: 'Security assessments and audits' },
    { value: 'data_analysis', label: 'Data Analysis', description: 'Data processing and analysis tasks' },
    { value: 'maintenance', label: 'Maintenance', description: 'System maintenance and updates' },
    { value: 'support', label: 'Support', description: 'User support and assistance' },
    { value: 'other', label: 'Other', description: 'Miscellaneous tasks' }
  ],
  priorities: [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800', description: 'Can be done when time permits' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800', description: 'Should be completed soon' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800', description: 'Important, needs attention' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800', description: 'Requires immediate action' }
  ],
  statuses: [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', description: 'Not yet started' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800', description: 'Currently being worked on' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800', description: 'Successfully finished' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800', description: 'Task was cancelled' }
  ]
};