"use client";
import {
  Bell,
  Edit,
  User,
  MapPin,
  Shield,
  Search,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  Flag,
  Building,
  Hash,
  Lock,
  Settings,
  Camera,
  X,
  Menu,
  ChevronDown,
  LogOut,
  Upload,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "@/components/notifications/NotificationBell";

const ProfilePage = () => {
  const { user, logout, setUser } = useAuth();
  const [activeSection, setActiveSection] = useState("personal-info");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  type SearchResult = {
    key: string;
    label: string;
    value: string;
    section: string;
    category: string;
  };

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const mainContentRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLDivElement | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const sectionRefs = {
    "personal-info": useRef<HTMLDivElement | null>(null),
    address: useRef<HTMLDivElement | null>(null),
    security: useRef<HTMLDivElement | null>(null),
  };


  const profileMenuItems = [
    {
      id: "logout",
      label: "Sign Out",
      icon: LogOut,
      action: () => {
        logout();
      },
      danger: true,
    },
  ];
  // imgbb API configuration
  const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "YOUR_IMGBB_API_KEY";

  

  // Function to upload image to imgbb
  const uploadToImgbb = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData,
    });
    console.log(response)
    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.data.url;
  };

  // Function to update user profile
  const updateUserProfile = async (updates: any) => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const result = await response.json();
      console.log(result)
      setUser(result.user);
      return result;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // Upload to imgbb
      const imageUrl = await uploadToImgbb(file);
      
      // Update user profile with new avatar URL
      await updateUserProfile({ avatar: imageUrl });
      
      console.log("Avatar updated successfully!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload avatar. Please try again.");
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Generate avatar initials
  const getAvatarInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Searchable items with their locations
  const searchableItems = [
    {
      key: "firstName",
      label: "First Name",
      value: user?.name,
      section: "personal-info",
      category: "Personal Information",
    },
    {
      key: "lastName",
      label: "Last Name",
      value: user?.name,
      section: "personal-info",
      category: "Personal Information",
    },
    {
      key: "email",
      label: "Email",
      value: user?.email,
      section: "personal-info",
      category: "Personal Information",
    },
    {
      key: "phone",
      label: "Phone Number",
      value: user?.phone,
      section: "personal-info",
      category: "Personal Information",
    },
    {
      key: "dateOfBirth",
      label: "Date of Birth",
      value: "5 Oct 1999",
      section: "personal-info",
      category: "Personal Information",
    },
    {
      key: "role",
      label: "Role",
      value: user?.role,
      section: "personal-info",
      category: "Personal Information",
    },
    {
      key: "country",
      label: "Country",
      value: "Kenya",
      section: "address",
      category: "Address & Location",
    },
    {
      key: "city",
      label: "City",
      value: "Nairobi",
      section: "address",
      category: "Address & Location",
    },
    {
      key: "postalCode",
      label: "Postal Code",
      value: "00100",
      section: "address",
      category: "Address & Location",
    },
    {
      key: "password",
      label: "Password",
      value: "Strong",
      section: "security",
      category: "Security Settings",
    },
    {
      key: "twoFactor",
      label: "Two-Factor Authentication",
      value: "Not Enabled",
      section: "security",
      category: "Security Settings",
    },
  ];

  // Search functionality
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results = searchableItems.filter(
      (item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item?.value?.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(results as any);
    setShowSearchResults(true);
  };

  // Handle search input change
  const handleSearchChange = (e: { target: { value: any } }) => {
    const query = e.target.value;
    setSearchQuery(query);
    performSearch(query);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Navigate to search result
  const navigateToResult = (sectionKey: string) => {
    scrollToSection(sectionKey);
    setShowSearchResults(false);
    setSearchQuery("");
    setIsSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Click outside to close search results and sidebar
  useEffect(() => {
    const handleClickOutside = (event: { target: any }) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      const sidebar = document.getElementById("sidebar");
      const menuButton = document.getElementById("menu-button");

      if (
        isSidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target) &&
        menuButton &&
        !menuButton.contains(event.target)
      ) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle menu item clicks
  const handleProfileMenuClick = (item: any) => {
    item.action();
    setProfileMenuOpen(false);
  };
  const scrollToSection = (sectionKey: React.SetStateAction<string>) => {
    const sectionRef =
      sectionRefs[sectionKey as unknown as keyof typeof sectionRefs];
    const mainContent = mainContentRef.current;

    if (sectionRef.current && mainContent) {
      const sectionTop = sectionRef.current.offsetTop;
      const targetScrollTop = sectionTop - 100;

      mainContent.scrollTo({
        top: targetScrollTop,
        behavior: "smooth",
      });

      setActiveSection(sectionKey);
    }
  };

  // Intersection Observer to detect which section is in view
  useEffect(() => {
    const mainContent = mainContentRef.current;
    if (!mainContent) return;

    const observerOptions = {
      root: mainContent,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0.1,
    };

    const observerCallback = (entries: any[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute("data-section");
          if (sectionId) {
            setActiveSection(sectionId);
          }
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const navigationItems = [
    { key: "personal-info", label: "Personal Information", icon: User },
    { key: "address", label: "Address & Location", icon: MapPin },
    { key: "security", label: "Security Settings", icon: Shield },
  ];

  return (
    <div className="w-full h-screen overflow-hidden flex bg-gray-50">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`h-screen fixed inset-y-0 left-0 z-50 w-80 flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white transform transition-all duration-300 ease-in-out shadow-2xl ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-0 flex items-start`}
      >
        {/* Header */}
        <div className="flex items-center w-full px-6 py-8 border-b border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <div>
              <Link
                href={"/dashboard"}
                className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
              >
                LUNA ADMIN
              </Link>
              <p className="text-sm text-slate-400 flex items-center gap-1">
                <Settings className="w-3 h-3" />
                Management Portal
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col gap-2 px-4 pt-8 w-full">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.key;

            return (
              <button
                key={item.key}
                onClick={() => {
                  scrollToSection(item.key);
                  setIsSidebarOpen(false); // Close sidebar on mobile after selection
                }}
                className={`w-full transition-all duration-200 py-4 px-4 rounded-xl flex items-center gap-3 group relative ${
                  isActive
                    ? "bg-orange-500/20 border border-orange-500/30 shadow-lg"
                    : "hover:bg-slate-800/50"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-red-500 rounded-r-full"></div>
                )}
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? "text-orange-300"
                      : "text-orange-400 group-hover:text-orange-300"
                  }`}
                />
                <span
                  className={`transition-colors ${
                    isActive
                      ? "text-white font-medium"
                      : "group-hover:text-white"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        {/* User Profile Section */}
        <div
          className="relative border-t border-slate-700/50 w-full bg-slate-900/80 backdrop-blur-sm"
          ref={profileMenuRef}
        >
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="w-full p-4 flex items-center gap-3 hover:bg-slate-800/50 transition-colors"
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="User Avatar"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-lg">
                    {getAvatarInitials(user?.name || "User")}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full"></div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium text-white capitalize truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-400 lowercase truncate">
                {user?.email || ""}
              </p>
              <p className="text-xs text-orange-400 capitalize font-medium">
                {user?.role || "Admin"}
              </p>
            </div>

            {/* Dropdown Arrow */}
            <ChevronDown
              className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                profileMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {profileMenuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="py-2">
                {profileMenuItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => handleProfileMenuClick(item)}
                    className={`
                        w-full flex items-center gap-3 px-4 py-3 text-sm font-medium
                        transition-colors hover:bg-slate-700/50
                        ${
                          item.danger
                            ? "text-red-400 hover:text-red-300"
                            : "text-slate-300 hover:text-white"
                        }
                        ${
                          index !== profileMenuItems.length - 1
                            ? "border-b border-slate-700/30"
                            : ""
                        }
                      `}
                  >
                    <div
                      className={`
                        p-1.5 rounded-lg
                        ${
                          item.danger
                            ? "bg-red-500/10 text-red-400"
                            : "bg-slate-700/50 text-slate-400"
                        }
                      `}
                    >
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen h-full flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 ">
        {/* Top Bar with Enhanced Search */}
        <div className="flex bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 py-4 space-x-2 sm:space-x-4 rounded-2xl text-white items-center shadow-lg">
          {/* Mobile Menu Button */}
          <button
            id="menu-button"
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>

          <div className="flex-1 flex items-center justify-start relative">
            <div className="relative max-lg:hidden w-full" ref={searchInputRef}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <input
                className="bg-white/95 rounded-xl w-full max-w-md pl-12 pr-12 py-3 text-black border-none focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                type="text"
                placeholder="Search profile settings..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery && setShowSearchResults(true)}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-50">
                  {searchResults.length > 0 ? (
                    <div className="p-2">
                      <div className="text-xs text-gray-500 px-3 py-2 font-medium uppercase tracking-wide">
                        Found {searchResults.length} result
                        {searchResults.length !== 1 ? "s" : ""}
                      </div>
                      {searchResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={() => navigateToResult(result.section)}
                          className="w-full text-left px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">
                                {result.label}
                              </div>
                              <div className="text-sm text-gray-600">
                                {result.value}
                              </div>
                            </div>
                            <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                              {result.category}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <div className="font-medium">No results found</div>
                      <div className="text-sm">
                        Try searching for name, email, address, or settings
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-orange-400" />
              <span className="hidden md:inline">
                {new Date().toDateString()}
              </span>
            </div>
            <div className="relative">
              <NotificationBell></NotificationBell>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div
          ref={mainContentRef}
          className="overflow-y-auto h-full mt-4 sm:mt-6 custom-scrollbar pb-20 space-y-6 sm:space-y-8 scroll-smooth"
        >
          {/* Page Header */}
          <div className="relative flex gap-3 items-center w-full">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
            <span className="bg-gray-50 pr-4 z-10 text-xl sm:text-2xl font-bold text-gray-800">
              My Profile
            </span>
            <span className="flex-1 h-[2px] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 rounded-full"></span>
          </div>

          {/* Enhanced Profile Card */}
          <div className="w-full relative overflow-hidden bg-gradient-to-br from-white via-orange-50/30 to-red-50/30 rounded-3xl shadow-2xl border border-orange-100/50">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/5 via-transparent to-red-400/5"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-200/20 to-transparent rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-red-200/20 to-transparent rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row items-center gap-6 lg:gap-8">
              <div className="relative flex-shrink-0 group">
                {/* Enhanced Avatar Container */}
                <div className="relative">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 p-1 shadow-2xl group-hover:shadow-orange-500/25 transition-all duration-300">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                      {user?.avatar ? (
                        <Image
                          alt="Profile picture"
                          height={144}
                          width={144}
                          src={user.avatar}
                          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                          <span className="text-2xl lg:text-3xl font-bold text-orange-600">
                            {getAvatarInitials(user?.name || "User")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Upload Button */}
                  <button
                    onClick={triggerFileInput}
                    disabled={isUploadingAvatar}
                    className="absolute bottom-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 rounded-full p-3 shadow-lg transition-all duration-200 transform hover:scale-110 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>

                {/* Online Status */}
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 border-4 border-white rounded-full shadow-lg animate-pulse"></div>
              </div>

              <div className="flex flex-col gap-3 text-center sm:text-left flex-1">
                {/* Enhanced User Info */}
                <div className="space-y-2">
                  <h2 className="text-3xl sm:text-4xl font-bold capitalize bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {user?.name}
                  </h2>
                  <div className="flex items-center gap-2 text-orange-600 justify-center sm:justify-start">
                    <div className="p-1 bg-orange-100 rounded-full">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <span className="font-semibold capitalize text-lg">{user?.role}</span>
                  </div>
                </div>

                {/* Location & Status */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600 justify-center sm:justify-start">
                    <div className="p-1 bg-gray-100 rounded-full">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Nairobi, Kenya</span>
                  </div>
                  
                  <div className="flex gap-3 justify-center sm:justify-start flex-wrap">
                    <span className="px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full text-sm font-semibold border border-green-300/30 shadow-sm">
                      ✓ {user?.isEmailVerified ? "Active" : "Inactive"}
                    </span>
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-sm font-semibold border border-blue-300/30 shadow-sm">
                      ✓ {user?.isEmailVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200/50">
                  <div className="text-center p-2">
                    <div className="text-lg font-bold text-gray-800">{user?.role === 'admin' ? '24/7' : 'Limited'}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Access</div>
                  </div>
                  <div className="text-center p-2">
                    <div className="text-lg font-bold text-gray-800">{user?.isEmailVerified ? 'High' : 'Medium'}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Security</div>
                  </div>
                  <div className="text-center p-2 sm:col-span-1 col-span-2">
                    <div className="text-lg font-bold text-gray-800">{user?.lastLogin ? 'Recent' : 'New'}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Activity</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div
            ref={sectionRefs["personal-info"]}
            data-section="personal-info"
            className="w-full p-4 sm:p-6 lg:p-8 bg-white rounded-3xl shadow-lg border border-gray-100"
          >
            <div className="py-4 px-2 border-b-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-gray-100">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                <span className="text-lg sm:text-xl font-bold text-gray-800">
                  Personal Information
                </span>
              </div>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 cursor-pointer text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-xl hover:shadow-lg transition-all duration-200">
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>

            <div className="grid gap-6 sm:gap-8 py-6 sm:py-8 px-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <User className="w-4 h-4" />
                    <span className="font-medium">First Name</span>
                  </div>
                  <span className="text-gray-900 capitalize font-semibold text-base sm:text-lg">
                    {user?.name.split(" ")[0]}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Mail className="w-4 h-4" />
                    <span className="font-medium">Email</span>
                  </div>
                  <span className="text-gray-900 lowercase font-semibold text-sm sm:text-base break-all">
                    {user?.email || "-"}
                  </span>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <User className="w-4 h-4" />
                    <span className="font-medium">Last Name</span>
                  </div>
                  <span className="text-gray-900 capitalize font-semibold text-base sm:text-lg">
                    {user?.name.split(" ")[1] || "-"}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Phone className="w-4 h-4" />
                    <span className="font-medium">Phone Number</span>
                  </div>
                  <span className="text-gray-900 font-semibold">
                    {user?.phone || "-"}
                  </span>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6 sm:col-span-2 lg:col-span-1">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Date of Birth</span>
                  </div>
                  <span className="text-gray-900 font-semibold">-</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <UserCheck className="w-4 h-4" />
                    <span className="font-medium">Role</span>
                  </div>
                  <span className="text-orange-600 capitalize font-semibold">
                    {user?.role || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div
            ref={sectionRefs["address"]}
            data-section="address"
            className="w-full p-4 sm:p-6 lg:p-8 bg-white rounded-3xl shadow-lg border border-gray-100"
          >
            <div className="py-4 px-2 border-b-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-gray-100">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                <span className="text-lg sm:text-xl font-bold text-gray-800">
                  Address & Location
                </span>
              </div>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 cursor-pointer text-orange-600 border border-orange-200 rounded-xl hover:bg-orange-50 transition-all duration-200">
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 py-6 sm:py-8 px-2 gap-6 sm:gap-8 w-full">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <Flag className="w-4 h-4" />
                  <span className="font-medium">Country</span>
                </div>
                <span className="text-gray-900 font-semibold text-base sm:text-lg">
                  Kenya
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <Building className="w-4 h-4" />
                  <span className="font-medium">City</span>
                </div>
                <span className="text-gray-900 font-semibold text-base sm:text-lg">
                  Nairobi
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 text-gray-500">
                  <Hash className="w-4 h-4" />
                  <span className="font-medium">Postal Code</span>
                </div>
                <span className="text-gray-900 font-semibold text-base sm:text-lg">
                  00100
                </span>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div
            ref={sectionRefs["security"]}
            data-section="security"
            className="w-full p-4 sm:p-6 lg:p-8 bg-white rounded-3xl shadow-lg border border-gray-100 mb-8"
          >
            <div className="py-4 px-2 border-b-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-gray-100">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                <span className="text-lg sm:text-xl font-bold text-gray-800">
                  Security Settings
                </span>
              </div>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 cursor-pointer text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-xl hover:shadow-lg transition-all duration-200">
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Change Password</span>
                <span className="sm:hidden">Change</span>
              </button>
            </div>

            <div className="py-6 sm:py-8 px-2 space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-xl gap-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <div>
                    <span className="font-semibold text-gray-800">
                      Two-Factor Authentication
                    </span>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security
                    </p>
                  </div>
                </div>
                {user?.multifactorAuthentication ? (
                  <span className="text-green-600 font-medium">Enabled</span>
                ) : (
                  <span className="text-orange-600 font-medium">
                    Not Enabled
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;