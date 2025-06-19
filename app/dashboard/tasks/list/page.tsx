"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  Filter,
  Plus,
  Calendar,
  User,
  AlertTriangle,
  Clock,
  CheckCircle,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  tasksApi,
  ITask,
  ITaskFilters,
  ITasksResponse,
  mockTasksResponse,
  mockTaskMetadata,
} from "@/lib/tasksApi";
import { usePopup } from "@/context/PopupContext";

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        colors[status as keyof typeof colors]
      }`}
    >
      {status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
    </span>
  );
};

// Priority Badge Component
const PriorityBadge = ({ priority }: { priority: string }) => {
  const colors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        colors[priority as keyof typeof colors]
      }`}
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

// Filter Dropdown Component
const FilterDropdown = ({
  label,
  value,
  options,
  onSelect,
  isOpen,
  onToggle,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <div className="relative">
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
        value
          ? "bg-blue-50 border-blue-200 text-blue-700"
          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
      }`}
    >
      <span>
        {value ? options.find((opt) => opt.value === value)?.label : label}
      </span>
      <ChevronDown
        className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
      />
    </button>

    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
        >
          <div className="py-1">
            <button
              onClick={() => {
                onSelect("");
                onToggle();
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              All {label}
            </button>
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onSelect(option.value);
                  onToggle();
                }}
                className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                  value === option.value
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// Task Card Component
const TaskCard = ({
  task,
  onEdit,
  onDelete,
}: {
  task: ITask;
  onEdit: (task: ITask) => void;
  onDelete: (taskId: string) => void;
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
            {task.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {task.description}
          </p>
        </div>

        <div className="relative ml-4">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>

          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
              >
                <div className="py-1">
                  <button
                    onClick={() => {
                      onEdit(task);
                      setShowActions(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Task
                  </button>
                  <button
                    onClick={() => {
                      onDelete(task._id);
                      setShowActions(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Task
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-4">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
        {task.isOverdue && (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            <AlertTriangle className="w-3 h-3" />
            Overdue
          </span>
        )}
      </div>

      {/* Assignment Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span>
            Assigned to:{" "}
            <span className="font-medium">{task.assignedTo.name}</span>
          </span>
        </div>
        {task.dueDate && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              Due:{" "}
              <span className="font-medium">{formatDate(task.dueDate)}</span>
            </span>
            {task.dueDate && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  getDaysUntilDue(task.dueDate) < 0
                    ? "bg-red-100 text-red-800"
                    : getDaysUntilDue(task.dueDate) <= 3
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {getDaysUntilDue(task.dueDate) < 0
                  ? `${Math.abs(getDaysUntilDue(task.dueDate))} days overdue`
                  : getDaysUntilDue(task.dueDate) === 0
                  ? "Due today"
                  : `${getDaysUntilDue(task.dueDate)} days left`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Created {formatDate(task.createdAt)}</span>
          <span className="capitalize">{task.category.replace("_", " ")}</span>
        </div>

        {task.comments.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MessageSquare className="w-4 h-4" />
            <span>{task.comments.length}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Pagination Component
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => (
  <div className="flex items-center justify-between mt-8">
    <div className="text-sm text-gray-700">
      Page {currentPage} of {totalPages}
    </div>

    <div className="flex items-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// Main Tasks List Component
const TasksList = () => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTasks: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [filters, setFilters] = useState<ITaskFilters>({
    page: 1,
    limit: 12,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const {showError,  showSuccess} = usePopup()

  // Mock metadata
  const metadata = mockTaskMetadata;

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // In development, use mock data
      const response = await tasksApi.getTasks(filters);

        if (response.success && response.data.tasks) {
          // setStats(response.data.tasks);
          setTasks(response.data.tasks);
          setPagination(response.data.pagination);
        }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters((prev) => ({
      ...prev,
      search: query || undefined,
      page: 1,
    }));
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof ITaskFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setSearchQuery("");
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Handle task actions
  const handleEditTask = (task: ITask) => {
    // TODO: Open edit modal or navigate to edit page
    console.log("Edit task:", task);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await tasksApi.deleteTask(taskId);
      fetchTasks(); // Refresh the list
    } catch (err) {
      showError("Failed to delete task");
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Tasks</h1>
            <p className="text-gray-600 mt-1">
              {pagination.totalTasks} tasks found
            </p>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Filter Options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-200 pt-4"
              >
                <div className="flex flex-wrap gap-4 mb-4">
                  <FilterDropdown
                    label="Status"
                    value={filters.status || ""}
                    options={metadata.statuses.map((s) => ({
                      value: s.value,
                      label: s.label,
                    }))}
                    onSelect={(value) => handleFilterChange("status", value)}
                    isOpen={openDropdown === "status"}
                    onToggle={() =>
                      setOpenDropdown(
                        openDropdown === "status" ? null : "status"
                      )
                    }
                  />

                  <FilterDropdown
                    label="Priority"
                    value={filters.priority || ""}
                    options={metadata.priorities.map((p) => ({
                      value: p.value,
                      label: p.label,
                    }))}
                    onSelect={(value) => handleFilterChange("priority", value)}
                    isOpen={openDropdown === "priority"}
                    onToggle={() =>
                      setOpenDropdown(
                        openDropdown === "priority" ? null : "priority"
                      )
                    }
                  />

                  <FilterDropdown
                    label="Category"
                    value={filters.category || ""}
                    options={metadata.categories.map((c) => ({
                      value: c.value,
                      label: c.label,
                    }))}
                    onSelect={(value) => handleFilterChange("category", value)}
                    isOpen={openDropdown === "category"}
                    onToggle={() =>
                      setOpenDropdown(
                        openDropdown === "category" ? null : "category"
                      )
                    }
                  />
                </div>

                {/* Active Filters & Clear */}
                {(filters.status ||
                  filters.priority ||
                  filters.category ||
                  filters.search) && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Active filters:
                    </span>
                    {filters.status && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        Status:{" "}
                        {
                          metadata.statuses.find(
                            (s) => s.value === filters.status
                          )?.label
                        }
                        <button
                          onClick={() => handleFilterChange("status", "")}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filters.priority && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                        Priority:{" "}
                        {
                          metadata.priorities.find(
                            (p) => p.value === filters.priority
                          )?.label
                        }
                        <button
                          onClick={() => handleFilterChange("priority", "")}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filters.category && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Category:{" "}
                        {
                          metadata.categories.find(
                            (c) => c.value === filters.category
                          )?.label
                        }
                        <button
                          onClick={() => handleFilterChange("category", "")}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    <button
                      onClick={clearFilters}
                      className="text-sm text-gray-600 hover:text-gray-800 underline"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
              <button
                onClick={fetchTasks}
                className="ml-auto text-red-600 hover:text-red-800 underline"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}

        {/* Tasks Grid */}
        {tasks.length === 0 && !loading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tasks found
            </h3>
            <p className="text-gray-600 mb-4">
              {filters.search ||
              filters.status ||
              filters.priority ||
              filters.category
                ? "Try adjusting your filters or search query"
                : "Get started by creating your first task"}
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Create Task
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {tasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}

        {/* Loading overlay for page changes */}
        {loading && tasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-lg p-4 flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Loading tasks...</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TasksList;
