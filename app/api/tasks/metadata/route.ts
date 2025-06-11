// app/api/tasks/metadata/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { returnSuccess } from '@/lib/response';

// GET /api/tasks/metadata - Get task metadata (categories, priorities, statuses)
const getTaskMetadata = async (request: NextRequest) => {
  const metadata = {
    categories: [
      { value: 'user_management', label: 'User Management', description: 'Tasks related to managing users and permissions' },
      { value: 'system_config', label: 'System Configuration', description: 'System settings and configuration tasks' },
      { value: 'content_review', label: 'Content Review', description: 'Review and moderate content' },
      { value: 'security_audit', label: 'Security Audit', description: 'Security-related tasks and audits' },
      { value: 'data_analysis', label: 'Data Analysis', description: 'Data analysis and reporting tasks' },
      { value: 'maintenance', label: 'Maintenance', description: 'System maintenance and updates' },
      { value: 'support', label: 'Support', description: 'User support and assistance tasks' },
      { value: 'other', label: 'Other', description: 'Miscellaneous tasks' }
    ],
    priorities: [
      { value: 'low', label: 'Low', color: '#10B981', description: 'Low priority, no rush' },
      { value: 'medium', label: 'Medium', color: '#F59E0B', description: 'Medium priority, normal timeline' },
      { value: 'high', label: 'High', color: '#EF4444', description: 'High priority, needs attention' },
      { value: 'urgent', label: 'Urgent', color: '#DC2626', description: 'Urgent, requires immediate attention' }
    ],
    statuses: [
      { value: 'pending', label: 'Pending', color: '#6B7280', description: 'Task has not been started' },
      { value: 'in_progress', label: 'In Progress', color: '#3B82F6', description: 'Task is currently being worked on' },
      { value: 'completed', label: 'Completed', color: '#10B981', description: 'Task has been completed' },
      { value: 'cancelled', label: 'Cancelled', color: '#EF4444', description: 'Task has been cancelled' }
    ],
    defaultValues: {
      priority: 'medium',
      status: 'pending',
      category: 'other'
    },
    validation: {
      title: {
        minLength: 1,
        maxLength: 200,
        required: true
      },
      description: {
        minLength: 1,
        maxLength: 2000,
        required: true
      },
      dueDate: {
        mustBeFuture: true,
        required: false
      }
    },
    permissions: {
      admin: {
        canAssignTo: ['admin'],
        canViewAll: false,
        canDeleteAny: false
      },
      super_admin: {
        canAssignTo: ['admin', 'super_admin'],
        canViewAll: true,
        canDeleteAny: true
      }
    }
  };

  return returnSuccess({
    message: 'Task metadata retrieved successfully',
    data: metadata,
    status: 200
  });
};

export const GET = withAuth(getTaskMetadata, { roles: ['admin', 'super_admin'] });