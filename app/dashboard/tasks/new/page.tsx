// app/dashboard/tasks/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Calendar,
  User,
  Flag,
  Folder,
  FileText,
  Paperclip,
  ArrowLeft,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Users,
  Check,
} from "lucide-react";
import {
  IAssignableUser,
  ICreateTaskData,
  ITaskMetadata,
  tasksApi,
} from "@/lib/tasksApi";

interface FormData {
  title: string;
  description: string;
  assignedToUsers: IAssignableUser[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  dueDate: string;
  attachments: string[];
}

interface FormErrors {
  title?: string;
  description?: string;
  assignedToUsers?: string;
  priority?: string;
  category?: string;
  dueDate?: string;
}

export default function CreateTaskPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    assignedToUsers: [],
    priority: "medium",
    category: "",
    dueDate: "",
    attachments: [],
  });

  const [assignableUsers, setAssignableUsers] = useState<IAssignableUser[]>([]);
  const [taskMetadata, setTaskMetadata] = useState<ITaskMetadata | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersResponse, metadataResponse] = await Promise.all([
          tasksApi.getAssignableUsers(),
          tasksApi.getTaskMetadata(),
        ]);

        if (usersResponse.users) {
          setAssignableUsers(usersResponse.users);
        }

        if (metadataResponse) {
          setTaskMetadata(metadataResponse.metadata);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.assignedToUsers.length === 0) {
      newErrors.assignedToUsers = "Please select at least one assignee";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = "Due date cannot be in the past";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (formData.assignedToUsers.length === 1) {
        // Single user - use existing createTask method
        const submitData: ICreateTaskData = {
          title: formData.title,
          description: formData.description,
          assignedTo: formData.assignedToUsers[0],
          assignedToUserId: formData.assignedToUsers[0]._id,
          priority: formData.priority,
          category: formData.category,
          dueDate: formData.dueDate || undefined,
          attachments: formData.attachments,
        };

        const response = await tasksApi.createTask(submitData);
        
        if (response.task) {
          setShowSuccess(true);
          setTimeout(() => {
            router.push("/dashboard/tasks");
          }, 2000);
        } else {
          throw new Error("Failed to create task");
        }
      } else {
        // Multiple users - use new createMultipleTasks method
        const taskData = {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          category: formData.category,
          dueDate: formData.dueDate || undefined,
          attachments: formData.attachments,
        };

        const response = await tasksApi.createMultipleTasks(taskData, formData.assignedToUsers);
        
        if (response.successful > 0) {
          setShowSuccess(true);
          setTimeout(() => {
            router.push("/dashboard/tasks");
          }, 2000);
        } else {
          throw new Error("All tasks failed to create");
        }
      }
    } catch (error) {
      console.error("Failed to create tasks:", error);
      setErrors({ title: "Failed to create tasks. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user makes changes
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleUserToggle = (user: IAssignableUser) => {
    const isSelected = formData.assignedToUsers.some(u => u._id === user._id);
    
    if (isSelected) {
      handleInputChange(
        "assignedToUsers",
        formData.assignedToUsers.filter(u => u._id !== user._id)
      );
    } else {
      handleInputChange("assignedToUsers", [...formData.assignedToUsers, user]);
    }
  };

  const handleSelectAll = () => {
    if (formData.assignedToUsers.length === assignableUsers.length) {
      // Deselect all
      handleInputChange("assignedToUsers", []);
    } else {
      // Select all
      handleInputChange("assignedToUsers", [...assignableUsers]);
    }
  };

  const removeUser = (userId: string) => {
    handleInputChange(
      "assignedToUsers",
      formData.assignedToUsers.filter(u => u._id !== userId)
    );
  };

  const getPriorityColor = (priority: string) => {
    const priorityData = taskMetadata?.priorities.find(p => p.value === priority);
    return priorityData?.color || "bg-gray-100 text-gray-800";
  };

  const getCategoryColor = (categoryValue: string) => {
    const category = taskMetadata?.categories.find(
      (c) => c.value === categoryValue
    );
    if (!category) return "bg-gray-100 text-gray-800 border-gray-200";

    // Default color mapping since your metadata doesn't include colors
    const colorMap: { [key: string]: string } = {
      user_management: "bg-blue-100 text-blue-800 border-blue-200",
      system_config: "bg-green-100 text-green-800 border-green-200",
      content_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
      security_audit: "bg-red-100 text-red-800 border-red-200",
      data_analysis: "bg-purple-100 text-purple-800 border-purple-200",
      maintenance: "bg-orange-100 text-orange-800 border-orange-200",
      support: "bg-indigo-100 text-indigo-800 border-indigo-200",
      other: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return colorMap[categoryValue] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              className="bg-white rounded-xl p-6 text-center shadow-2xl max-w-sm w-full"
              initial={{ y: -50 }}
              animate={{ y: 0 }}
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tasks Created!
              </h3>
              <p className="text-gray-600">
                {formData.assignedToUsers.length} task(s) created successfully. Redirecting...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.button
            variants={itemVariants}
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </motion.button>

          <motion.div variants={itemVariants}>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Create New Task
            </h1>
            <p className="text-gray-600">
              Fill in the details below to create a new task
            </p>
          </motion.div>
        </motion.div>

        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 space-y-6">
              {/* Title */}
              <motion.div variants={itemVariants}>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 mr-2" />
                  Task Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    errors.title
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter a clear, descriptive title..."
                />
                {errors.title && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 text-sm mt-1 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.title}
                  </motion.p>
                )}
              </motion.div>

              {/* Description */}
              <motion.div variants={itemVariants}>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 mr-2" />
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-vertical ${
                    errors.description
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Provide detailed information about the task..."
                />
                {errors.description && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 text-sm mt-1 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.description}
                  </motion.p>
                )}
              </motion.div>

              {/* Multi-User Assignment */}
              <motion.div variants={itemVariants}>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 mr-2" />
                  Assign To Users
                </label>
                
                {/* Selected Users Display */}
                {formData.assignedToUsers.length > 0 && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg border">
                    <div className="flex flex-wrap gap-2">
                      {formData.assignedToUsers.map((user) => (
                        <motion.div
                          key={user._id}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm"
                        >
                          <User className="w-3 h-3 mr-1" />
                          {user.name}
                          <button
                            type="button"
                            onClick={() => removeUser(user._id)}
                            className="ml-2 hover:bg-orange-200 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {formData.assignedToUsers.length} user(s) selected - Individual tasks will be created for each user
                    </p>
                  </div>
                )}

                {/* User Selection Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-left bg-white ${
                      errors.assignedToUsers
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">
                        {formData.assignedToUsers.length === 0
                          ? "Select users..."
                          : `${formData.assignedToUsers.length} user(s) selected`}
                      </span>
                      <motion.div
                        animate={{ rotate: showUserDropdown ? 180 : 0 }}
                        className="w-4 h-4 text-gray-400"
                      >
                        ▼
                      </motion.div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {showUserDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      >
                        {/* Select All Option */}
                        <div
                          className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                          onClick={handleSelectAll}
                        >
                          <div className="flex items-center">
                            <div className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
                              formData.assignedToUsers.length === assignableUsers.length
                                ? "bg-orange-600 border-orange-600"
                                : "border-gray-300"
                            }`}>
                              {formData.assignedToUsers.length === assignableUsers.length && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {formData.assignedToUsers.length === assignableUsers.length
                                  ? "Deselect All"
                                  : "Select All"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {assignableUsers.length} users available
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Individual Users */}
                        {assignableUsers.map((user) => {
                          const isSelected = formData.assignedToUsers.some(u => u._id === user._id);
                          return (
                            <div
                              key={user._id}
                              className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleUserToggle(user)}
                            >
                              <div className="flex items-center">
                                <div className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
                                  isSelected
                                    ? "bg-orange-600 border-orange-600"
                                    : "border-gray-300"
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{user.name}</p>
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {errors.assignedToUsers && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 text-sm mt-1 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.assignedToUsers}
                  </motion.p>
                )}
              </motion.div>

              {/* Two-column layout for desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Priority */}
                <motion.div variants={itemVariants}>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Flag className="w-4 h-4 mr-2" />
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      handleInputChange("priority", e.target.value as 'low' | 'medium' | 'high' | 'urgent')
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      errors.priority
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  >
                    {taskMetadata?.priorities.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                  {formData.priority && (
                    <div className="mt-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                          formData.priority
                        )}`}
                      >
                        {
                          taskMetadata?.priorities.find(
                            (p) => p.value === formData.priority
                          )?.label
                        }
                      </span>
                    </div>
                  )}
                </motion.div>

                {/* Category */}
                <motion.div variants={itemVariants}>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Folder className="w-4 h-4 mr-2" />
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      errors.category
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select category...</option>
                    {taskMetadata?.categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {formData.category && (
                    <div className="mt-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                          formData.category
                        )}`}
                      >
                        {
                          taskMetadata?.categories.find(
                            (c) => c.value === formData.category
                          )?.label
                        }
                      </span>
                    </div>
                  )}
                  {errors.category && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-600 text-sm mt-1 flex items-center"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.category}
                    </motion.p>
                  )}
                </motion.div>
              </div>

              {/* Due Date */}
              <motion.div variants={itemVariants}>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Due Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) =>
                    handleInputChange("dueDate", e.target.value)
                  }
                  min={new Date().toISOString().slice(0, 16)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    errors.dueDate
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {errors.dueDate && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 text-sm mt-1 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.dueDate}
                  </motion.p>
                )}
              </motion.div>
            </div>

            {/* Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="border-t border-gray-200 bg-gray-50 px-6 py-4"
            >
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <motion.button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Creating Tasks...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Task{formData.assignedToUsers.length !== 1 ? 's' : ''} 
                      {formData.assignedToUsers.length > 0 && (
                        <span className="ml-1">({formData.assignedToUsers.length})</span>
                      )}
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}