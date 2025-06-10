import React, { useEffect, useState, useMemo } from "react";
import { User, Pagination } from "@/lib/types";
import {
  UserIcon,
  Mail,
  Phone,
  Calendar,
  Shield,
  ShieldCheck,
  Eye,
  Edit2,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  FileWarningIcon,
  DeleteIcon,
  Loader2,
} from "lucide-react";
import { useData } from "@/hooks/useData";

interface UsersTableProps {
  users: User[];
  pagination?: Pagination;
  isCompact?: boolean;
  onPageChange?: (page: number) => void;
  onUserUpdate?: (userId: string, updates: Partial<User>) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  pagination,
  isCompact = false,
  onPageChange,
  onUserUpdate,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "normal" | "corporate" | "admin"
  >("all");
  const [deleting, setDeleting] = useState({ status: false, id: "" });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { deleteUser, loading } = useData();

  // ✅ Fixed: Use useMemo for filtering with proper dependencies
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const getRoleBadge = (role: User["role"]) => {
    const roleConfig = {
      admin: {
        color: "bg-red-100 text-red-700",
        icon: ShieldCheck,
        label: "Admin",
      },
      corporate: {
        color: "bg-blue-100 text-blue-700",
        icon: Shield,
        label: "Corporate",
      },
      normal: {
        color: "bg-green-100 text-green-700",
        icon: UserIcon,
        label: "User",
      },
      super_admin: {
        color: "bg-green-300 text-green-700",
        icon: UserIcon,
        label: "Super Admin",
      },
    };

    const config = roleConfig[role];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getVerificationStatus = (isVerified: boolean) => {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          isVerified
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {isVerified ? "✓ Verified" : "⚠ Pending"}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleRoleChange = async (userId: string, newRole: User["role"]) => {
    if (onUserUpdate) {
      await onUserUpdate(userId, { role: newRole });
    }
    setActiveDropdown(null);
  };

  // ✅ Fixed: Better delete handler
  const handleDeleteUser = async (userId: string) => {
    try {
      const result = await deleteUser(userId);
      if (result?.success) {
        setDeleting({ status: false, id: "" });
        // Optionally show success message
      }
    } catch (error) {
      console.error("Delete failed:", error);
      // Handle error appropriately
    }
  };

  if (isCompact) {
    return (
      <div className="space-y-3">
        {filteredUsers.slice(0, 5).map((user) => (
          <div
            key={user._id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-medium text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getRoleBadge(user.role)}
              {getVerificationStatus(user.isEmailVerified)}
            </div>
          </div>
        ))}
        {filteredUsers.length > 5 && (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500">
              +{filteredUsers.length - 5} more users
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      {/* ✅ Improved delete confirmation modal */}
      {deleting.status && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl w-[300px] overflow-hidden">
            <div className="flex flex-col">
              <div className="flex gap-2 p-4 text-red-400 bg-gray-200">
                <Trash2 />
                <h1>Confirm Action</h1>
              </div>
              <p className="p-4 text-sm">
                Are you sure you want to remove this user? This action cannot be
                undone.
              </p>
            </div>
            <div className="flex border-t">
              <button
                disabled={loading}
                onClick={() => handleDeleteUser(deleting.id)}
                className="flex-1 cursor-pointer flex items-center border-r justify-center p-3 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="text-orange-400 animate-spin" />
                ) : (
                  "Yes"
                )}
              </button>
              <button
                disabled={loading}
                onClick={() => setDeleting({ status: false, id: "" })}
                className="flex-1 cursor-pointer flex items-center justify-center p-3 disabled:opacity-50"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
            className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white appearance-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="normal">Users</option>
            <option value="corporate">Corporate</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-4 font-medium text-gray-700">User</th>
              <th className="text-left p-4 font-medium text-gray-700">Role</th>
              <th className="text-left p-4 font-medium text-gray-700">Status</th>
              <th className="text-left p-4 font-medium text-gray-700">Contact</th>
              <th className="text-left p-4 font-medium text-gray-700">Joined</th>
              <th className="text-left p-4 font-medium text-gray-700">Last Login</th>
              <th className="text-right p-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user._id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">{getRoleBadge(user.role)}</td>
                <td className="p-4">
                  {getVerificationStatus(user.isEmailVerified)}
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">
                        {user.email}
                      </span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3 h-3" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-3 h-3" />
                    {formatDate(user.createdAt)}
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-gray-600">
                    {user.lastLogin
                      ? formatDate(user.lastLogin.toString())
                      : "Never"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit User"
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>

                    {/* Role Change Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === user._id ? null : user._id
                          )
                        }
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="More Actions"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>

                      {activeDropdown === user._id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                          <div className="p-2">
                            <p className="text-xs text-gray-500 px-2 py-1">
                              Change Role
                            </p>
                            {(["normal", "corporate", "admin"] as const).map(
                              (role) => (
                                <button
                                  key={role}
                                  onClick={() =>
                                    handleRoleChange(user._id, role)
                                  }
                                  className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 transition-colors ${
                                    user.role === role
                                      ? "bg-gray-100 font-medium"
                                      : ""
                                  }`}
                                >
                                  {role.charAt(0).toUpperCase() +
                                    role.slice(1)}
                                </button>
                              )
                            )}
                            <hr className="my-1" />
                            <button
                              onClick={() => {
                                setDeleting({ status: true, id: user._id });
                                setActiveDropdown(null);
                              }}
                              className="w-full text-left px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              Delete User
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No users found
          </h3>
          <p className="text-gray-500">
            {searchTerm || roleFilter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "No users have been registered yet."}
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} users
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange && onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                const pageNum =
                  pagination.page <= 3
                    ? i + 1
                    : pagination.page >= pagination.pages - 2
                    ? pagination.pages - 4 + i
                    : pagination.page - 2 + i;

                if (pageNum < 1 || pageNum > pagination.pages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange && onPageChange(pageNum)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      pagination.page === pageNum
                        ? "bg-orange-500 text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onPageChange && onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTable;