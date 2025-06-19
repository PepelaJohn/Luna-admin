import React, { useEffect, useState, useMemo } from "react";
import {
  User as UserIcon,
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
  Loader2,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";

// shadcn/ui imports
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { usersApi } from "@/lib/api";
import { EditingUserPopup } from "./EditingUserPopup";
import { Loading } from "@/components/LoadingComponent";

// Mock types - replace with your actual types
interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "normal" | "corporate" | "admin" | "super_admin";
  isEmailVerified: boolean;
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  lastLogin?: Date;
}

interface Pagination {
  page: number;
  pages: number;
  limit: number;
  total: number;
}

interface UsersTableProps {
  users: User[];
  pagination?: Pagination;
  isCompact?: boolean;
  onPageChange?: (page: number) => void;
  onUserUpdate?: (userId: string, updates: Partial<User>) => void;
}

export interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  general?: string;
}

// Mock data for demonstration


const mockPagination: Pagination = {
  page: 1,
  pages: 3,
  limit: 10,
  total: 25,
};

const UsersTable: React.FC<UsersTableProps> = ({
  users ,
  pagination = mockPagination,
  isCompact = false,
  onPageChange,
 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [deleting, setDeleting] = useState({ status: false, id: "" });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const [originalFormData, setOriginalFormData] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  // Check for changes in form data
  useEffect(() => {
    if (!editingUser || !originalFormData) return;

    const changes = Object.keys(editFormData).some(key => {
      const currentValue = editFormData[key as keyof User];
      const originalValue = originalFormData[key as keyof User];
      return currentValue !== originalValue;
    });

    setHasChanges(changes);
  }, [editFormData, originalFormData, editingUser]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!editFormData.name?.trim()) {
      errors.name = "Name is required";
    } else if (editFormData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!editFormData.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (editFormData.phone && editFormData.phone.trim() && !/^[\+]?[1-9][\d]{0,15}$/.test(editFormData.phone.replace(/\s/g, ''))) {
      errors.phone = "Please enter a valid phone number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getRoleBadge = (role: User["role"]) => {
    const roleConfig = {
      admin: { variant: "destructive" as const, label: "Admin", icon: ShieldCheck },
      corporate: { variant: "default" as const, label: "Corporate", icon: Shield },
      normal: { variant: "secondary" as const, label: "User", icon: UserIcon },
      super_admin: { variant: "outline" as const, label: "Super Admin", icon: ShieldCheck },
    };

    const config = roleConfig[role];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex text-black items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getVerificationStatus = (isVerified: boolean) => {
    return (
      <Badge variant={isVerified ? "default" : "secondary"}>
        {isVerified ? "✓ Verified" : "⚠ Pending"}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteUser = async (userId: string) => {
    setLoading(true);
    try {
      
      const response = await usersApi.deleteUser(deleting.id)
      if(response.success){

        setDeleting({ status: false, id: "" });
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setLoading(false);
        setDeleting({ status: false, id: "" });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    const formData = {
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
    };
    setEditFormData(formData);
    setOriginalFormData(formData);
    setFormErrors({});
    setSuccessMessage("");
    setHasChanges(false);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    // Clear previous messages
    setFormErrors({});
    setSuccessMessage("");

    // Check if there are any changes
    if (!hasChanges) {
      setFormErrors({ general: "No changes detected. Please modify at least one field before saving." });
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await usersApi.updateUser({
        id: editingUser._id, 
        updateUserData: editFormData
      });
      
      
      if (response.success) {
        setSuccessMessage(response.message || "User updated successfully!");
        // Close modal after 1.5 seconds to show success message
        setTimeout(() => {
          setEditingUser(null);
          setEditFormData({});
          setOriginalFormData({});
          setSuccessMessage("");
        }, 1500);
      } else {
        setFormErrors({ general: response.message || "Failed to update user. Please try again." });
      }
    } catch (error: any) {
      console.error("Update failed:", error);
      setFormErrors({ 
        general: error?.response?.data?.message || "An error occurred while updating the user. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditFormData({});
    setOriginalFormData({});
    setFormErrors({});
    setSuccessMessage("");
    setHasChanges(false);
  };

  const handleInputChange = (field: keyof User, value: any) => {
    setEditFormData({ ...editFormData, [field]: value });
    // Clear field-specific error when user starts typing
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors({ ...formErrors, [field]: undefined });
    }
    // Clear general error when user makes changes
    if (formErrors.general) {
      setFormErrors({ ...formErrors, general: undefined });
    }
  };

  // Mobile Card Component
  const MobileUserCard = ({ user }: { user: User }) => (
    <Card className="mb-4 border-gray-200 rounded-none">
      <CardContent className="p-4 border-none">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
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
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
              {!user.isActive && (
                <span className="text-xs text-red-600 font-medium">Inactive</span>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setDeleting({ status: true, id: user._id })}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Role:</span>
            {getRoleBadge(user.role)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Status:</span>
            {getVerificationStatus(user.isEmailVerified)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Joined:</span>
            <span className="text-sm text-gray-900">{formatDate(user.createdAt)}</span>
          </div>
          {user.phone && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Phone:</span>
              <span className="text-sm text-gray-900">{user.phone}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Last Login:</span>
            <span className="text-sm text-gray-900">
              {user.lastLogin ? formatDate(user.lastLogin.toString()) : "Never"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isCompact) {
    return (
      <>
      {
        loading ? <Loading></Loading>:<div className="space-y-3">
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
            <div className="flex items-center text-black gap-2">
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
      }
      </>
    );
  }

  return (
    <div className="space-y-4 bg-transparent">
      {/* Delete Confirmation Dialog */}
      <Dialog  open={deleting.status} onOpenChange={(open) => !open && setDeleting({ status: false, id: "" })}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to remove this user? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleting({ status: false, id: "" })}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="border border-red-500 cursor-pointer text-red-500"
              onClick={() => handleDeleteUser(deleting.id)}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {EditingUserPopup(editingUser, handleCancelEdit, successMessage, formErrors, formatDate, editFormData, handleInputChange, hasChanges, loading, handleSaveEdit)}

      {/* Search and Filter Bar */}
      <Card className="!border-none bg-red-40 rounded-none">
        <CardContent className="p- !border-none ">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 !border-none relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-gray-200 "
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
              <Select  value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px] pl-10 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="normal">Users</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile View - Cards */}
      <div className="block md:hidden">
        {filteredUsers.map((user) => (
          <MobileUserCard  key={user._id} user={user} />
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block">
        <Card className="border-gray-200 rounded-none">
          <Table>
            <TableHeader className="border-gray-200 rounded-none">
              <TableRow className="border-gray-200 border-none">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow className="border-gray-200" key={user._id}>
                  <TableCell>
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
                        {!user.isActive && (
                          <span className="text-xs text-red-600 font-medium">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getVerificationStatus(user.isEmailVerified)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-3 h-3" />
                      {formatDate(user.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {user.lastLogin
                        ? formatDate(user.lastLogin.toString())
                        : "Never"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white border !cursor-pointer shadow-lg border-gray-300" align="end">
                          <DropdownMenuItem 
                          
                            onClick={() => setDeleting({ status: true, id: user._id })}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-500">
              {searchTerm || roleFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No users have been registered yet."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} users
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange && onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

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
                      <Button
                        key={pageNum}
                        variant={pagination.page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange && onPageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange && onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UsersTable;

