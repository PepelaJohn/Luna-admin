import React from "react";
import { Loader2, X, Save, AlertCircle, CheckCircle, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormErrors } from ".";

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

export function EditingUserPopup(
  editingUser: User | null,
  handleCancelEdit: () => void,
  successMessage: string,
  formErrors: FormErrors,
  formatDate: (dateString: string) => string,
  editFormData: Partial<User>,
  handleInputChange: (field: keyof User, value: any) => void,
  hasChanges: boolean,
  loading: boolean,
  handleSaveEdit: () => Promise<void>
) {
  return (
    <Dialog
      open={!!editingUser}
      onOpenChange={(open) => !open && handleCancelEdit()}
    >
      <DialogContent className="max-w-md max-h-[95vh] bg-white border-none overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4 border-b border-gray-100">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Edit User
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          {editingUser && (
            <div className="space-y-6 py-4">
              {/* Success Message */}
              {successMessage && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* General Error Message */}
              {formErrors.general && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {formErrors.general}
                  </AlertDescription>
                </Alert>
              )}

              {/* Avatar Section */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  {editingUser.avatar ? (
                    <img
                      src={editingUser.avatar}
                      alt={editingUser.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-medium text-xl">
                      {editingUser.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {editingUser.name}
                  </p>
                  <p className="text-sm text-gray-500">ID: {editingUser._id}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Joined {formatDate(editingUser.createdAt)}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={editFormData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`mt-2 ${
                      formErrors.name
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                    }`}
                    placeholder="Enter full name"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={editFormData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`mt-2 ${
                      formErrors.email
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                    }`}
                    placeholder="Enter email address"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={editFormData.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`mt-2 ${
                      formErrors.phone
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                    }`}
                    placeholder="Enter phone number (optional)"
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="role"
                    className="text-sm font-medium text-gray-700"
                  >
                    User Role
                  </Label>
                  <Select
                    value={editFormData.role || "normal"}
                    onValueChange={(value) =>
                      handleInputChange("role", value as User["role"])
                    }
                  >
                    <SelectTrigger className="mt-2 border-gray-200 focus:border-blue-400 focus:ring-blue-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="normal">User</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Toggles - Fixed with better contrast */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div>
                      <Label
                        htmlFor="email-verified"
                        className="text-sm font-medium text-gray-900"
                      >
                        Email Verification
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        Mark email as verified
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Switch
                        id="email-verified"
                        checked={editFormData.isEmailVerified || false}
                        onCheckedChange={(checked) =>
                          handleInputChange("isEmailVerified", checked)
                        }
                        className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                      />
                     
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div>
                      <Label
                        htmlFor="active-status"
                        className="text-sm font-medium text-gray-900"
                      >
                        Account Status
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        Enable or disable user account
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Switch
                        id="active-status"
                        checked={editFormData.isActive || false}
                        onCheckedChange={(checked) =>
                          handleInputChange("isActive", checked)
                        }
                        className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                      />
                      
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Account Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Joined:</span>
                      <p className="text-gray-900 font-medium">
                        {formatDate(editingUser.createdAt)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Login:</span>
                      <p className="text-gray-900 font-medium">
                        {editingUser.lastLogin
                          ? formatDate(editingUser.lastLogin.toString())
                          : "Never"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Changes Indicator */}
                {hasChanges && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      You have unsaved changes. Click "Save Changes" to apply
                      them.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={handleCancelEdit}
            disabled={loading}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            disabled={loading || !hasChanges}
            className={`${
              !hasChanges ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            } bg-blue-600 hover:bg-blue-700 text-white`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}