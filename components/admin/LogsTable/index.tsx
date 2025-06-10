import React, { useState } from 'react';
import { 
  Eye, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Shield, 
  Trash2, 
  Edit, 
  Plus, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export interface LogResponse {
  _id: string;
  action: string;
  entity: string;
  entityId: string;
  performedBy: {
    email: string;
    name: string;
    role: 'normal' | 'corporate' | 'admin' | 'super_admin';
    _id: string;
  };
  metadata: {
    old: any;
    reason?: string;
    changes: any[];
  };
  ip: string;
  userAgent: string;
  severity: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

interface LogsTableProps {
  logs: LogResponse[];
  isCompact?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPageChange?: (page: number) => void;
}

const LogsTable: React.FC<LogsTableProps> = ({ 
  logs, 
  isCompact = false, 
  pagination,
  onPageChange 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [selectedLog, setSelectedLog] = useState<LogResponse | null>(null);

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <XCircle className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Info className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'update':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'login':
        return <User className="w-4 h-4 text-green-500" />;
      case 'logout':
        return <User className="w-4 h-4 text-gray-500" />;
      default:
        return <Shield className="w-4 h-4 text-blue-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'corporate':
        return 'bg-blue-100 text-blue-800';
      case 'normal':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.performedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    
    return matchesSearch && matchesSeverity && matchesAction;
  });

  const uniqueActions = [...new Set(logs.map(log => log.action))];
  const uniqueSeverities = [...new Set(logs.map(log => log.severity))];

  return (
    <div className="w-full">
      {/* Filters - Only show if not compact */}
      {!isCompact && (
        <div className="p-4 bg-gray-50 border-b flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Severities</option>
            {uniqueSeverities.map(severity => (
              <option key={severity} value={severity}>{severity}</option>
            ))}
          </select>

          {/* Action Filter */}
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isCompact ? 'Log' : 'Action & Entity'}
              </th>
              {!isCompact && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performed By
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              {!isCompact && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <React.Fragment key={log._id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {!isCompact && (
                        <button
                          onClick={() => toggleLogExpansion(log._id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {expandedLogs.has(log._id) ? 
                            <ChevronDown className="w-4 h-4" /> : 
                            <ChevronRight className="w-4 h-4" />
                          }
                        </button>
                      )}
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <div>
                          <div className="font-medium text-gray-900 capitalize">
                            {log.action} {log.entity}
                          </div>
                          {isCompact && (
                            <div className="text-sm text-gray-500">
                              by {log.performedBy.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {!isCompact && (
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {log.performedBy.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {log.performedBy.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {log.performedBy.email}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(log.performedBy.role)}`}>
                              {log.performedBy.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                  )}
                  
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(log.severity)}
                      <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {formatDate(log.createdAt)}
                  </td>
                  
                  {!isCompact && (
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </td>
                  )}
                </tr>
                
                {/* Expanded Details */}
                {expandedLogs.has(log._id) && !isCompact && (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 bg-gray-50">
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Entity ID:</span>
                            <span className="ml-2 text-gray-600 font-mono">{log.entityId}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">IP Address:</span>
                            <span className="ml-2 text-gray-600">{log.ip}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Status:</span>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {log.status}
                            </span>
                          </div>
                        </div>
                        
                        {log.metadata.reason && (
                          <div>
                            <span className="font-medium text-gray-700">Reason:</span>
                            <p className="mt-1 text-gray-600">{log.metadata.reason}</p>
                          </div>
                        )}
                        
                        {log.metadata.changes && log.metadata.changes.length > 0 && (
                          <div>
                            <span className="font-medium text-gray-700">Changes:</span>
                            <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.metadata.changes, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && !isCompact && (
        <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} entries
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredLogs.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No logs found</h3>
          <p className="text-gray-500">
            {searchTerm || filterSeverity !== 'all' || filterAction !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No activity logs available'}
          </p>
        </div>
      )}

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Log Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-gray-700">Action</label>
                  <p className="text-gray-600 capitalize">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Entity</label>
                  <p className="text-gray-600">{selectedLog.entity}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Severity</label>
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(selectedLog.severity)}
                    <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(selectedLog.severity)}`}>
                      {selectedLog.severity}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Status</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedLog.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedLog.status}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="font-medium text-gray-700">Performed By</label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-medium">
                      {selectedLog.performedBy.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{selectedLog.performedBy.name}</p>
                      <p className="text-sm text-gray-600">{selectedLog.performedBy.email}</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(selectedLog.performedBy.role)}`}>
                        {selectedLog.performedBy.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedLog.metadata.old && (
                <div>
                  <label className="font-medium text-gray-700">Previous Data</label>
                  <pre className="mt-2 text-xs bg-gray-100 p-3 rounded-lg overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata.old, null, 2)}
                  </pre>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-gray-700">IP Address</label>
                  <p className="text-gray-600">{selectedLog.ip}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Date</label>
                  <p className="text-gray-600">{formatDate(selectedLog.createdAt)}</p>
                </div>
              </div>

              <div>
                <label className="font-medium text-gray-700">User Agent</label>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {selectedLog.userAgent}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsTable;