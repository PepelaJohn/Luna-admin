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
} from "lucide-react";
import {
  IAssignableUser,
  ICreateTaskData,
  ITaskMetadata,
  tasksApi,
} from "@/lib/tasksApi";

interface FormData extends ICreateTaskData {
  dueDate: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  assignedToUserId?: string;
  priority?: string;
  category?: string;
  dueDate?: string;
  assignedTo?: string;
}

{
  /* 
      title,
      description,
      assignedToUserId,
      assignedToName,
      assignedToEmail,
      assignedToRole,
      priority = "medium",
      dueDate,
      category,
      attachments = [],
  */
}
export default function CreateTaskPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    assignedTo: null,
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
        const [usersResponse, metadataResponse] = (await Promise.all([
          tasksApi.getAssignableUsers(),
          tasksApi.getTaskMetadata(),
        ])) as any;

        console.log(usersResponse, "kl", metadataResponse);
        if (usersResponse.success && usersResponse.users) {
          setAssignableUsers(usersResponse.users);
        }

        if (metadataResponse.success && metadataResponse.metadata) {
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

    if (!formData.assignedToUserId) {
      newErrors.assignedToUserId = "Please select an assignee";
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
      const assignedTo = assignableUsers.find(
        (user) => user._id === formData.assignedToUserId
      );
      if (!!assignedTo) {
        const submitData: ICreateTaskData = {
          ...formData,
          assignedTo,
          dueDate: formData.dueDate || undefined,
        };

        const response = (await tasksApi.createTask(submitData)) as any;
        console.log(response);
        if (response.success) {
          setShowSuccess(true);
          setTimeout(() => {
            router.push("/dashboard/tasks");
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Failed to create task:", error);
      setErrors({ title: "Failed to create task. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-green-100 text-green-800 border-green-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      urgent: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getCategoryColor = (categoryValue: string) => {
    const category = taskMetadata?.categories.find(
      (c) => c.value === categoryValue
    );
    if (!category) return "bg-gray-100 text-gray-800 border-gray-200";

    const colorMap = {
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      green: "bg-green-100 text-green-800 border-green-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      red: "bg-red-100 text-red-800 border-red-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      colorMap[(category as any)?.color as keyof typeof colorMap] ||
      colorMap.gray
    );
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
                Task Created!
              </h3>
              <p className="text-gray-600">Redirecting to tasks page...</p>
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

              {/* Two-column layout for desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assignee */}
                <motion.div variants={itemVariants}>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 mr-2" />
                    Assign To
                  </label>
                  <select
                    value={formData.assignedToUserId}
                    onChange={(e) =>
                      handleInputChange("assignedToUserId", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      errors.assignedToUserId
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select assignee...</option>
                    {assignableUsers.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  {errors.assignedToUserId && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-600 text-sm mt-1 flex items-center"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.assignedToUserId}
                    </motion.p>
                  )}
                </motion.div>

                {/* Priority */}
                <motion.div variants={itemVariants}>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Flag className="w-4 h-4 mr-2" />
                    Priority
                  </label>
                  <select
                    value={formData.priority || ""}
                    onChange={(e) =>
                      handleInputChange("priority", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      errors.priority
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select priority...</option>
                    {taskMetadata?.priorities.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      Creating Task...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Task
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
