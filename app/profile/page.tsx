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
} from "lucide-react";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import image from "@/assets/passportphoto.jpg";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("personal-info");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
   // 0110926355


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
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
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
              <span className="bg-gradient-to-r from-orange-400 to-red-500 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer hover:shadow-lg transition-all duration-200">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                3
              </span>
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

          {/* Profile Card */}
          <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8 bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="relative flex-shrink-0">
              <span className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full border-4 border-orange-400 overflow-hidden shadow-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <Image
                  alt="profile image for pepela"
                  height={128}
                  width={128}
                  src={image.src}
                  className="w-full h-full object-cover object-center"
                />
              </span>
              <button className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-orange-500 hover:bg-orange-600 rounded-full p-1.5 sm:p-2 shadow-lg transition-colors duration-200">
                <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </button>
            </div>

            <div className="flex flex-col gap-2 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold capitalize text-gray-900">
                {user?.name}
              </h2>
              <div className="flex items-center gap-2 text-orange-600 justify-center sm:justify-start">
                <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold capitalize">{user?.role}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 justify-center sm:justify-start">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Nairobi, Kenya</span>
              </div>
              <div className="flex gap-2 mt-2 justify-center sm:justify-start">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {user?.isEmailVerified && "Active"}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {user?.isEmailVerified && "Verified"}
                </span>
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
