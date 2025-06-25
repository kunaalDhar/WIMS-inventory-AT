"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useOrders } from "@/contexts/order-context"
import { useInventory } from "@/contexts/inventory-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Home,
  Package,
  Receipt,
  BarChart3,
  Settings,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Users,
  Building2,
  Download,
  Eye,
  Edit,
  Activity,
  Loader2,
  FileText,
  Search,
  RotateCcw,
  ShoppingCart,
  MoreVertical,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Target,
  TrendingDown,
  RefreshCw,
  Briefcase,
  Truck,
  Package2,
  UserCheck,
  UserX,
  ChevronDown,
  LogOut,
  UserCircle,
  Star,
  Shield,
} from "lucide-react"
import { OrderPricingPanel } from "@/components/admin/order-pricing-panel"
import { PermissionRequestsPanel } from "@/components/admin/permission-requests-panel"
import { EditOrderItemsPanel } from "@/components/admin/edit-order-items-panel"

interface SidebarItem {
  id: string
  label: string
  icon: any
  hasDropdown?: boolean
  dropdownItems?: { id: string; label: string; icon?: any }[]
}

const sidebarItems: SidebarItem[] = [
  {
    id: "home",
    label: "Dashboard",
    icon: Home,
  },
  {
    id: "permissions",
    label: "Permissions",
    icon: Shield,
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingCart,
    hasDropdown: true,
    dropdownItems: [
      { id: "all-orders", label: "All Orders", icon: Receipt },
      { id: "pending-orders", label: "Pending Orders", icon: Clock },
      { id: "approved-orders", label: "Approved Orders", icon: CheckCircle },
      { id: "rejected-orders", label: "Rejected Orders", icon: XCircle },
      { id: "edit-items", label: "Edit Items", icon: Edit },
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Package,
    hasDropdown: true,
    dropdownItems: [
      { id: "all-items", label: "All Items", icon: Package2 },
      { id: "low-stock", label: "Low Stock", icon: AlertTriangle },
      { id: "out-of-stock", label: "Out of Stock", icon: XCircle },
      { id: "stock-transfer", label: "Stock Transfer", icon: Truck },
    ],
  },
  {
    id: "clients",
    label: "Clients",
    icon: Users,
    hasDropdown: true,
    dropdownItems: [
      { id: "all-clients", label: "All Clients", icon: Users },
      { id: "active-clients", label: "Active Clients", icon: UserCheck },
      { id: "inactive-clients", label: "Inactive Clients", icon: UserX },
    ],
  },
  {
    id: "salesman",
    label: "Salesman",
    icon: Briefcase,
    hasDropdown: true,
    dropdownItems: [
      { id: "all-salesman", label: "All Salesman", icon: Users },
      { id: "performance", label: "Performance", icon: Target },
      { id: "commissions", label: "Commissions", icon: DollarSign },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    hasDropdown: true,
    dropdownItems: [
      { id: "sales-report", label: "Sales Report", icon: TrendingUp },
      { id: "inventory-report", label: "Inventory Report", icon: Package },
      { id: "client-report", label: "Client Report", icon: Users },
      { id: "financial-report", label: "Financial Report", icon: DollarSign },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
]

// Peaceful girl voice welcome for admin
const speakPeacefulWelcome = (userName: string) => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance()
    utterance.text = `Welcome back ${userName}. Your dashboard is ready. Have a wonderful day ahead.`

    // Gentle, peaceful voice settings
    utterance.rate = 0.8 // Slower, more peaceful
    utterance.pitch = 1.3 // Higher for feminine voice
    utterance.volume = 0.6 // Softer volume

    // Try to find a female voice
    const voices = window.speechSynthesis.getVoices()
    const femaleVoice =
      voices.find(
        (voice) =>
          voice.name.toLowerCase().includes("female") ||
          voice.name.toLowerCase().includes("woman") ||
          voice.name.toLowerCase().includes("samantha") ||
          voice.name.toLowerCase().includes("karen") ||
          voice.name.toLowerCase().includes("susan") ||
          voice.name.toLowerCase().includes("zira"),
      ) || voices[0]

    if (femaleVoice) {
      utterance.voice = femaleVoice
    }

    window.speechSynthesis.speak(utterance)
  }
}

export function ModernAdminDashboard() {
  const { user, logout, users, setUsers } = useAuth()
  const { orders = [], clients = [], bills = [], isDataLoaded, refreshData } = useOrders()
  const { inventory = [], getInventorySummary, refreshInventory } = useInventory()

  const [activePanel, setActivePanel] = useState("home")
  const [expandedDropdown, setExpandedDropdown] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [statusFilter, setStatusFilter] = useState("")
  const [sortBy, setSortBy] = useState<"orderNumber" | "clientName" | "createdAt" | "status">("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Peaceful welcome effect for admin
  useEffect(() => {
    if (user?.name) {
      const speakWelcome = () => {
        setTimeout(() => {
          speakPeacefulWelcome(user.name)
        }, 1200)
      }

      if (window.speechSynthesis.getVoices().length > 0) {
        speakWelcome()
      } else {
        window.speechSynthesis.onvoiceschanged = speakWelcome
      }
    }
  }, [user?.name])

  // Real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
      // Refresh data every 30 seconds
      refreshData()
      refreshInventory()
    }, 30000)

    return () => clearInterval(interval)
  }, [refreshData, refreshInventory])

  // Auto-refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true)
    refreshData()
    refreshInventory()
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLastUpdate(new Date())
    setIsRefreshing(false)
  }

  // Show loading state while data is being loaded
  if (!isDataLoaded) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="w-72 bg-white shadow-2xl border-r border-gray-200">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">WIMS Admin</h2>
                <p className="text-blue-100 text-sm">Warehouse Management</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-6" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 rounded-full mx-auto animate-pulse"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Dashboard</h3>
            <p className="text-gray-600">Preparing your comprehensive business overview...</p>
          </div>
        </div>
      </div>
    )
  }

  const inventoryStats = getInventorySummary()

  // Calculate comprehensive REAL-TIME statistics
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    approvedOrders: orders.filter((o) => o.status === "approved").length,
    rejectedOrders: orders.filter((o) => o.status === "rejected").length,
    adminPricedOrders: orders.filter((o) => o.status === "admin_priced").length,
    salesmanAdjustedOrders: orders.filter((o) => o.status === "salesman_adjusted").length,
    completedOrders: orders.filter((o) => o.status === "completed").length,
    totalRevenue: orders
      .filter((o) => o.status === "approved" || o.status === "completed")
      .reduce(
        (sum, order) => sum + ((order.finalPricing || order.adminPricing || order.salesmanPricing)?.total || 0),
        0,
      ),
    pendingRevenue: orders
      .filter((o) => o.status === "pending" || o.status === "admin_priced" || o.status === "salesman_adjusted")
      .reduce(
        (sum, order) => sum + ((order.finalPricing || order.adminPricing || order.salesmanPricing)?.total || 0),
        0,
      ),
    totalItems: inventory.length,
    lowStockItems: inventoryStats?.lowStockItems || 0,
    outOfStockItems: inventoryStats?.outOfStockItems || 0,
    inStockItems: inventoryStats?.inStockItems || 0,
    totalClients: clients.length,
    activeClients: clients.filter((c) => (c.orderCount || 0) > 0).length,
    inactiveClients: clients.filter((c) => (c.orderCount || 0) === 0).length,
    totalBills: bills.length,
    generatedBills: bills.filter((b) => b.status === "generated").length,
    verifiedBills: bills.filter((b) => b.status === "verified").length,
    processedBills: bills.filter((b) => b.status === "processed").length,
    rejectedBills: bills.filter((b) => b.status === "rejected").length,
    todayOrders: orders.filter((o) => {
      const today = new Date().toDateString()
      return new Date(o.createdAt).toDateString() === today
    }).length,
    thisWeekOrders: orders.filter((o) => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(o.createdAt) >= weekAgo
    }).length,
    thisMonthOrders: orders.filter((o) => {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return new Date(o.createdAt) >= monthAgo
    }).length,
    averageOrderValue:
      orders.length > 0
        ? orders.reduce(
            (sum, order) => sum + ((order.finalPricing || order.adminPricing || order.salesmanPricing)?.total || 0),
            0,
          ) / orders.length
        : 0,
    totalInventoryValue: inventoryStats?.totalValue || 0,
    pendingTransfers: inventoryStats?.pendingTransfers || 0,
  }

  // Calculate real growth percentages based on actual data
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  // Mock previous period data for growth calculation (in real app, this would come from historical data)
  const previousStats = {
    orders: Math.max(0, stats.totalOrders - Math.floor(stats.totalOrders * 0.1)),
    revenue: Math.max(0, stats.totalRevenue - Math.floor(stats.totalRevenue * 0.15)),
    clients: Math.max(0, stats.totalClients - Math.floor(stats.totalClients * 0.05)),
    inventory: Math.max(0, stats.totalItems - Math.floor(stats.totalItems * 0.02)),
  }

  const growth = {
    orders: calculateGrowth(stats.totalOrders, previousStats.orders),
    revenue: calculateGrowth(stats.totalRevenue, previousStats.revenue),
    clients: calculateGrowth(stats.totalClients, previousStats.clients),
    inventory: calculateGrowth(stats.totalItems, previousStats.inventory),
  }

  const toggleDropdown = (itemId: string) => {
    setExpandedDropdown(expandedDropdown === itemId ? null : itemId)
  }

  const handlePanelChange = (panelId: string) => {
    setActivePanel(panelId)
    if (!sidebarItems.find((item) => item.id === panelId.split("-")[0])?.hasDropdown) {
      setExpandedDropdown(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`
  }

  const getGrowthColor = (value: number) => {
    return value > 0 ? "text-green-600" : value < 0 ? "text-red-600" : "text-gray-600"
  }

  const getGrowthIcon = (value: number) => {
    return value > 0 ? TrendingUp : value < 0 ? TrendingDown : Activity
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
      admin_priced: { variant: "default" as const, color: "bg-blue-100 text-blue-800" },
      salesman_adjusted: { variant: "default" as const, color: "bg-purple-100 text-purple-800" },
      approved: { variant: "default" as const, color: "bg-green-100 text-green-800" },
      rejected: { variant: "destructive" as const, color: "bg-red-100 text-red-800" },
      completed: { variant: "default" as const, color: "bg-emerald-100 text-emerald-800" },
      generated: { variant: "secondary" as const, color: "bg-gray-100 text-gray-800" },
      verified: { variant: "default" as const, color: "bg-blue-100 text-blue-800" },
      processed: { variant: "default" as const, color: "bg-green-100 text-green-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <Badge variant={config.variant} className={config.color}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  const renderHomePanel = () => (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name || user?.email}!</h1>
            <p className="text-blue-100 text-lg">Here's your real-time business overview</p>
            <div className="flex items-center mt-4 space-x-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Activity className="w-3 h-3 mr-1" />
                Live Data
              </Badge>
              <span className="text-blue-100 text-sm">Last updated: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="text-right">
            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalOrders}</p>
                <div className="flex items-center mt-2">
                  {React.createElement(getGrowthIcon(growth.orders), {
                    className: `w-4 h-4 mr-1 ${getGrowthColor(growth.orders)}`,
                  })}
                  <span className={`text-sm font-medium ${getGrowthColor(growth.orders)}`}>
                    {formatPercentage(growth.orders)}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="p-4 bg-blue-100 rounded-2xl">
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-900">{formatCurrency(stats.totalRevenue)}</p>
                <div className="flex items-center mt-2">
                  {React.createElement(getGrowthIcon(growth.revenue), {
                    className: `w-4 h-4 mr-1 ${getGrowthColor(growth.revenue)}`,
                  })}
                  <span className={`text-sm font-medium ${getGrowthColor(growth.revenue)}`}>
                    {formatPercentage(growth.revenue)}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="p-4 bg-green-100 rounded-2xl">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 mb-1">Active Clients</p>
                <p className="text-3xl font-bold text-purple-900">{stats.activeClients}</p>
                <div className="flex items-center mt-2">
                  {React.createElement(getGrowthIcon(growth.clients), {
                    className: `w-4 h-4 mr-1 ${getGrowthColor(growth.clients)}`,
                  })}
                  <span className={`text-sm font-medium ${getGrowthColor(growth.clients)}`}>
                    {formatPercentage(growth.clients)}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="p-4 bg-purple-100 rounded-2xl">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 mb-1">Inventory Items</p>
                <p className="text-3xl font-bold text-orange-900">{stats.totalItems}</p>
                <div className="flex items-center mt-2">
                  {React.createElement(getGrowthIcon(growth.inventory), {
                    className: `w-4 h-4 mr-1 ${getGrowthColor(growth.inventory)}`,
                  })}
                  <span className={`text-sm font-medium ${getGrowthColor(growth.inventory)}`}>
                    {formatPercentage(growth.inventory)}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="p-4 bg-orange-100 rounded-2xl">
                <Package className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <div className="text-center">
            <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-800">{stats.pendingOrders}</p>
            <p className="text-xs text-yellow-700">Pending Orders</p>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="text-center">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-800">{stats.approvedOrders}</p>
            <p className="text-xs text-green-700">Approved Orders</p>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <div className="text-center">
            <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-800">{stats.rejectedOrders}</p>
            <p className="text-xs text-red-700">Rejected Orders</p>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="text-center">
            <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-800">{stats.todayOrders}</p>
            <p className="text-xs text-blue-700">Today's Orders</p>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <div className="text-center">
            <AlertTriangle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-800">{stats.lowStockItems}</p>
            <p className="text-xs text-purple-700">Low Stock Items</p>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
          <div className="text-center">
            <FileText className="w-6 h-6 text-gray-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{stats.totalBills}</p>
            <p className="text-xs text-gray-700">Generated Bills</p>
          </div>
        </Card>
      </div>

      {/* Revenue Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Revenue Analytics
            </CardTitle>
            <CardDescription className="text-green-100">Real-time financial performance</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-green-700 font-medium">Confirmed Revenue</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div>
                  <p className="text-sm text-yellow-700 font-medium">Pending Revenue</p>
                  <p className="text-2xl font-bold text-yellow-900">{formatCurrency(stats.pendingRevenue)}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Total Potential</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(stats.totalRevenue + stats.pendingRevenue)}
                  </p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Average Order Value</p>
                  <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.averageOrderValue)}</p>
                </div>
                <Star className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Inventory Status
            </CardTitle>
            <CardDescription className="text-blue-100">Real-time stock management</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Total Items</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalItems}</p>
                </div>
                <Package2 className="w-8 h-8 text-blue-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-green-700 font-medium">In Stock</p>
                  <p className="text-2xl font-bold text-green-900">{stats.inStockItems}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="text-sm text-orange-700 font-medium">Low Stock Alert</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.lowStockItems}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm text-red-700 font-medium">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-900">{stats.outOfStockItems}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-purple-100">Latest real-time system activities</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {orders.slice(0, 5).map((order, index) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-full ${
                      order.status === "approved"
                        ? "bg-green-100"
                        : order.status === "pending"
                          ? "bg-yellow-100"
                          : order.status === "rejected"
                            ? "bg-red-100"
                            : "bg-gray-100"
                    }`}
                  >
                    {order.status === "approved" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : order.status === "pending" ? (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    ) : order.status === "rejected" ? (
                      <XCircle className="w-4 h-4 text-red-600" />
                    ) : (
                      <Activity className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order #{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">
                      {order.clientName} • {order.items?.length || 0} items • {order.salesmanName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(order.status)}
                  <p className="text-sm text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-400">
                    {formatCurrency((order.finalPricing || order.adminPricing || order.salesmanPricing)?.total || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderOrdersPanel = () => <OrderPricingPanel />

  const renderInventoryPanel = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Inventory Management</h2>
            <p className="text-gray-600">Real-time stock monitoring and management</p>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh Inventory
          </Button>
        </div>

        {/* Inventory Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Total Items</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalItems}</p>
                <p className="text-xs text-blue-600 mt-1">Inventory products</p>
              </div>
              <Package2 className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">In Stock</p>
                <p className="text-3xl font-bold text-green-900">{stats.inStockItems}</p>
                <p className="text-xs text-green-600 mt-1">Available items</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Low Stock</p>
                <p className="text-3xl font-bold text-orange-900">{stats.lowStockItems}</p>
                <p className="text-xs text-orange-600 mt-1">Need reorder</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Out of Stock</p>
                <p className="text-3xl font-bold text-red-900">{stats.outOfStockItems}</p>
                <p className="text-xs text-red-600 mt-1">Urgent restock</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Inventory Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items ({inventory.length})</CardTitle>
            <CardDescription>Real-time inventory data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Min Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.currentStock}</TableCell>
                      <TableCell>{item.minStock}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{formatCurrency(item.totalValue)}</TableCell>
                      <TableCell>{new Date(item.lastUpdated).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderClientsPanel = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Client Management</h2>
            <p className="text-gray-600">Real-time client data and analytics</p>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh Clients
          </Button>
        </div>

        {/* Client Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Total Clients</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalClients}</p>
                <p className="text-xs text-blue-600 mt-1">Registered clients</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Active Clients</p>
                <p className="text-3xl font-bold text-green-900">{stats.activeClients}</p>
                <p className="text-xs text-green-600 mt-1">With orders</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 font-medium">Inactive Clients</p>
                <p className="text-3xl font-bold text-gray-900">{stats.inactiveClients}</p>
                <p className="text-xs text-gray-600 mt-1">No orders yet</p>
              </div>
              <UserX className="w-8 h-8 text-gray-600" />
            </div>
          </Card>
        </div>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Clients ({clients.length})</CardTitle>
            <CardDescription>Real-time client database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Last Order</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.partyName || client.name}</TableCell>
                      <TableCell>{client.contactPerson}</TableCell>
                      <TableCell>{client.contactNumber || client.phone}</TableCell>
                      <TableCell>{client.city}</TableCell>
                      <TableCell>{client.orderCount || 0}</TableCell>
                      <TableCell>
                        {client.lastUsed ? new Date(client.lastUsed).toLocaleDateString() : "Never"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderBillsPanel = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Bills Management</h2>
            <p className="text-gray-600">Real-time billing and invoice tracking</p>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh Bills
          </Button>
        </div>

        {/* Bill Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Total Bills</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalBills}</p>
                <p className="text-xs text-blue-600 mt-1">All generated bills</p>
              </div>
              <Receipt className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 font-medium">Generated</p>
                <p className="text-3xl font-bold text-yellow-900">{stats.generatedBills}</p>
                <p className="text-xs text-yellow-600 mt-1">Awaiting verification</p>
              </div>
              <FileText className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Processed</p>
                <p className="text-3xl font-bold text-green-900">{stats.processedBills}</p>
                <p className="text-xs text-green-600 mt-1">Completed bills</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Rejected</p>
                <p className="text-3xl font-bold text-red-900">{stats.rejectedBills}</p>
                <p className="text-xs text-red-600 mt-1">Declined bills</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Bills Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Bills ({bills.length})</CardTitle>
            <CardDescription>Real-time billing data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill ID</TableHead>
                    <TableHead>Order #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.id.slice(-8)}</TableCell>
                      <TableCell>{bill.orderNumber}</TableCell>
                      <TableCell>{bill.clientName}</TableCell>
                      <TableCell>{formatCurrency(bill.total)}</TableCell>
                      <TableCell>
                        <Badge variant={bill.billType === "gst" ? "default" : "secondary"}>
                          {bill.billType.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(bill.status)}</TableCell>
                      <TableCell>{new Date(bill.generatedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderSalesmanPanel = () => {
    // Get all salesmen from the system
    const allSalesmen = users.filter((u) => u.role === "salesman")

    // Group orders by salesman
    const ordersBySalesman = allSalesmen.map((salesman) => {
      const salesmanOrders = orders.filter(
        (order) =>
          order.salesmanId === salesman.id ||
          order.salesmanName === salesman.name ||
          order.createdBy === salesman.id ||
          order.createdBy === salesman.name,
      )

      const salesmanStats = {
        totalOrders: salesmanOrders.length,
        pendingOrders: salesmanOrders.filter((o) => o.status === "pending").length,
        approvedOrders: salesmanOrders.filter((o) => o.status === "approved").length,
        rejectedOrders: salesmanOrders.filter((o) => o.status === "rejected").length,
        totalRevenue: salesmanOrders.reduce(
          (sum, order) => sum + ((order.finalPricing || order.adminPricing || order.salesmanPricing)?.total || 0),
          0,
        ),
        averageOrderValue:
          salesmanOrders.length > 0
            ? salesmanOrders.reduce(
                (sum, order) => sum + ((order.finalPricing || order.adminPricing || order.salesmanPricing)?.total || 0),
                0,
              ) / salesmanOrders.length
            : 0,
        lastOrderDate:
          salesmanOrders.length > 0 ? Math.max(...salesmanOrders.map((o) => new Date(o.createdAt).getTime())) : null,
      }

      return {
        salesman,
        orders: salesmanOrders,
        stats: salesmanStats,
      }
    })

    // Filter orders based on search and salesman filter
    const filteredOrders = orders
      .filter((order) => {
        const matchesSearch =
          order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.salesmanName?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesSalesman =
          !statusFilter || order.salesmanId === statusFilter || order.salesmanName === statusFilter

        return matchesSearch && matchesSalesman
      })
      .sort((a, b) => {
        if (sortBy === "createdAt") {
          return sortOrder === "desc"
            ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        }
        return 0
      })

    const totalSalesmanOrders = orders.length
    const totalSalesmanRevenue = orders.reduce(
      (sum, order) => sum + ((order.finalPricing || order.adminPricing || order.salesmanPricing)?.total || 0),
      0,
    )

    // Pending approval salesmen
    const pendingSalesmen = allSalesmen.filter((s) => s.isApproved === false)

    // Approve handler
    const handleApproveSalesman = (salesmanId: string) => {
      const updatedUsers = users.map((u) =>
        u.id === salesmanId ? { ...u, isApproved: true } : u
      )
      setUsers(updatedUsers)
      try {
        localStorage.setItem("wims-users-v4", JSON.stringify(updatedUsers))
      } catch (error) {
        console.error("Error saving users:", error)
      }
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Salesman Management</h2>
            <p className="text-gray-600">Monitor all salesmen performance and orders in real-time</p>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh Data
          </Button>
        </div>

        {/* Salesman Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Total Salesmen</p>
                <p className="text-3xl font-bold text-blue-900">{allSalesmen.length}</p>
                <p className="text-xs text-blue-600 mt-1">Registered salespeople</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-green-900">{totalSalesmanOrders}</p>
                <p className="text-xs text-green-600 mt-1">From all salesmen</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-purple-900">{formatCurrency(totalSalesmanRevenue)}</p>
                <p className="text-xs text-purple-600 mt-1">Generated by team</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Active Today</p>
                <p className="text-3xl font-bold text-orange-900">
                  {
                    ordersBySalesman.filter((s) =>
                      s.orders.some((o) => new Date(o.createdAt).toDateString() === new Date().toDateString()),
                    ).length
                  }
                </p>
                <p className="text-xs text-orange-600 mt-1">Salesmen with orders today</p>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
          </Card>
        </div>

        {/* Individual Salesman Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ordersBySalesman.map(({ salesman, orders: salesmanOrders, stats }) => (
            <Card
              key={salesman.id}
              className="p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500"
            >
              <div className="space-y-4">
                {/* Salesman Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{salesman.name}</h3>
                    <p className="text-sm text-gray-600">{salesman.email}</p>
                    <p className="text-xs text-gray-500">ID: {salesman.id}</p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Salesman
                  </Badge>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-900">{stats.totalOrders}</p>
                    <p className="text-xs text-blue-700">Total Orders</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-900">{stats.approvedOrders}</p>
                    <p className="text-xs text-green-700">Approved</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-900">{stats.pendingOrders}</p>
                    <p className="text-xs text-yellow-700">Pending</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-900">{stats.rejectedOrders}</p>
                    <p className="text-xs text-red-700">Rejected</p>
                  </div>
                </div>

                {/* Revenue Information */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 font-medium">Total Revenue</p>
                      <p className="text-xl font-bold text-green-900">{formatCurrency(stats.totalRevenue)}</p>
                    </div>
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-green-600">Avg: {formatCurrency(stats.averageOrderValue)}</p>
                  </div>
                </div>

                {/* Last Activity */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last Order:</span>
                  <span className="font-medium text-gray-900">
                    {stats.lastOrderDate ? new Date(stats.lastOrderDate).toLocaleDateString() : "No orders yet"}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setStatusFilter(salesman.id)
                      setActivePanel("all-orders")
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Orders
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Analytics
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* All Orders from All Salesmen */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Salesman Orders ({filteredOrders.length})</CardTitle>
                <CardDescription>Real-time orders from all salespeople</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Salesmen</option>
                  {allSalesmen.map((salesman) => (
                    <option key={salesman.id} value={salesman.id}>
                      {salesman.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Salesman</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.salesmanName}</p>
                          <p className="text-xs text-gray-500">ID: {order.salesmanId?.slice(-8)}</p>
                        </div>
                      </TableCell>
                      <TableCell>{order.clientName}</TableCell>
                      <TableCell>{order.items?.length || 0}</TableCell>
                      <TableCell>
                        {formatCurrency(
                          (order.finalPricing || order.adminPricing || order.salesmanPricing)?.total || 0,
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {allSalesmen.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-3">No Salesmen Registered</h3>
            <p className="text-gray-600 mb-6">
              No salespeople have registered in the system yet. Salesmen can register themselves to start creating
              orders.
            </p>
          </Card>
        )}

        {/* Pending Salesman Approvals */}
        {pendingSalesmen.length > 0 && (
          <Card className="p-6 border-l-4 border-l-amber-500 bg-amber-50 mb-6">
            <h3 className="text-xl font-bold text-amber-800 mb-4">Pending Salesman Approvals</h3>
            <div className="space-y-3">
              {pendingSalesmen.map((salesman) => (
                <div key={salesman.id} className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
                  <div>
                    <div className="font-semibold text-gray-900">{salesman.name}</div>
                    <div className="text-gray-600 text-sm">{salesman.email}</div>
                  </div>
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleApproveSalesman(salesman.id)}
                  >
                    Approve
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    )
  }

  const renderReportsPanel = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Reports and Analytics</h2>
        <p className="text-gray-600">Comprehensive business insights and reporting</p>
      </div>
      <Card className="p-8 text-center">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Reports Panel</h3>
        <p className="text-gray-600">Detailed reports and analytics will be available here</p>
      </Card>
    </div>
  )

  const renderPermissionsPanel = () => <PermissionRequestsPanel />

  const renderPanel = () => {
    switch (activePanel) {
      case "home":
        return renderHomePanel()
      case "permissions":
        return renderPermissionsPanel()
      case "orders":
      case "all-orders":
      case "pending-orders":
      case "approved-orders":
      case "rejected-orders":
        return renderOrdersPanel()
      case "inventory":
      case "all-items":
      case "low-stock":
      case "out-of-stock":
      case "stock-transfer":
        return renderInventoryPanel()
      case "clients":
      case "all-clients":
      case "active-clients":
      case "inactive-clients":
        return renderClientsPanel()
      case "bills":
        return renderBillsPanel()
      case "salesman":
      case "all-salesman":
      case "performance":
      case "commissions":
        return renderSalesmanPanel()
      case "reports":
      case "sales-report":
      case "inventory-report":
      case "client-report":
      case "financial-report":
        return renderReportsPanel()
      case "settings":
        // You may want to render a settings panel here
        return <div>Settings Panel (to be implemented)</div>
      case "edit-items":
        return <EditOrderItemsPanel />
      default:
        return renderHomePanel()
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Sidebar */}
      <div className="w-72 bg-white shadow-2xl border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">WIMS Admin</h2>
              <p className="text-blue-100 text-sm">Warehouse Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-2 px-4">
            {sidebarItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (item.hasDropdown) {
                      toggleDropdown(item.id)
                    } else {
                      handlePanelChange(item.id)
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                    activePanel === item.id || activePanel.startsWith(item.id)
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.hasDropdown && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${expandedDropdown === item.id ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {/* Dropdown Items */}
                {item.hasDropdown && expandedDropdown === item.id && (
                  <div className="mt-2 ml-4 space-y-1">
                    {item.dropdownItems?.map((dropdownItem) => (
                      <button
                        key={dropdownItem.id}
                        onClick={() => handlePanelChange(dropdownItem.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-2 text-left rounded-lg transition-all duration-200 ${
                          activePanel === dropdownItem.id
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                        }`}
                      >
                        {dropdownItem.icon && <dropdownItem.icon className="w-4 h-4" />}
                        <span className="text-sm">{dropdownItem.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white transition-colors">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">{user?.name || user?.email}</p>
                  <p className="text-sm text-gray-600">Administrator</p>
                </div>
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <UserCircle className="w-4 h-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePanelChange("settings")}>
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderPanel()}
        </div>
      </div>
    </div>
  )
}
