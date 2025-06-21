"use client"

import React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useOrders } from "@/contexts/order-context"
import type { Order, OrderItem, Bill } from "@/contexts/order-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { CreateOrderDialog } from "./create-order-dialog"
import { CreateClientDialog } from "./create-client-dialog"
import { AdminLoginDialog } from "./admin-login-dialog"
import { BillPreviewDialog } from "./bill-preview-dialog"
import { OrderStatusCard } from "./order-status-card"
import {
  ShoppingCart,
  Building2,
  Package,
  Clock,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Download,
  FileText,
  RefreshCw,
  Receipt,
  Edit,
  TrendingUp,
  Calculator,
  User,
  Search,
  Eye,
  Calendar,
  MapPin,
} from "lucide-react"
import { useRouter } from 'next/navigation'
import { useAdminPermission } from "@/contexts/admin-permission-context"

type Variant = "default" | "secondary" | "destructive" | "outline"

export function SalesmanDashboardContent() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const {
    orders,
    clients,
    bills,
    isDataLoaded,
    refreshData,
    generateBill,
    getOrderPricingSummary,
    adjustOrderPricing,
    exportBackup,
    createManualBackup,
    verifyDataIntegrity,
  } = useOrders()
  const { requestAdminPermission, getRequestStatus } = useAdminPermission()

  // State management
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false)
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false)
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [previewBill, setPreviewBill] = useState<Bill | null>(null)
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Speech synthesis for welcome message
  const speakWelcome = useCallback(() => {
    if (!isSpeaking && "speechSynthesis" in window) {
      setIsSpeaking(true)
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance()
      utterance.text = `Welcome back ${user?.name || ''}! I'm here to help you manage your orders.`
      utterance.rate = 0.9
      utterance.pitch = 1.2

      const setVoice = () => {
        const voices = window.speechSynthesis.getVoices()
        const femaleVoice = voices.find(
          (voice) =>
            voice.name.toLowerCase().includes("female") ||
            voice.name.toLowerCase().includes("woman") ||
            voice.name.toLowerCase().includes("samantha")
        )
        if (femaleVoice) {
          utterance.voice = femaleVoice
        }
        window.speechSynthesis.speak(utterance)
      }

      if (window.speechSynthesis.getVoices().length > 0) {
        setVoice()
      } else {
        window.speechSynthesis.onvoiceschanged = setVoice
      }

      utterance.onend = () => setIsSpeaking(false)
    }
  }, [user?.name, isSpeaking])

  // Filter orders for current salesman
  const salesmanOrders = useMemo(() => {
    return orders.filter((order) => order.salesmanId === user?.id)
  }, [orders, user?.id])

  // Filter orders based on search and status
  const filteredOrders = useMemo(() => {
    return salesmanOrders.filter((order) => {
      const matchesSearch =
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.notes.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || order.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [salesmanOrders, searchTerm, statusFilter])

  // Filter bills for current salesman
  const salesmanBills = useMemo(() => {
    return bills.filter((bill) => {
      const order = orders.find((order) => order.id === bill.orderId)
      return order?.salesmanId === user?.id
    })
  }, [bills, orders, user?.id])

  // Calculate statistics
  const stats = useMemo(() => ({
    totalOrders: salesmanOrders.length,
    pendingOrders: salesmanOrders.filter((order) => order.status === "pending").length,
    approvedOrders: salesmanOrders.filter((order) => order.status === "approved").length,
    totalClients: clients.length,
    generatedBills: salesmanBills.length,
    pendingBills: salesmanBills.filter((bill) => bill.status === "generated").length,
  }), [salesmanOrders, clients.length, salesmanBills])

  // Get pricing summary
  const pricingSummary = useMemo(() => getOrderPricingSummary(), [getOrderPricingSummary])

  // Get recent orders (last 10)
  const recentOrders = useMemo(() => salesmanOrders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10), [salesmanOrders])

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: Variant, label: string }> = {
      pending: { variant: "secondary", label: "PENDING" },
      admin_priced: { variant: "default", label: "PRICED" },
      salesman_adjusted: { variant: "outline", label: "ADJUSTED" },
      approved: { variant: "default", label: "APPROVED" },
      rejected: { variant: "destructive", label: "REJECTED" },
      completed: { variant: "default", label: "COMPLETED" },
    }

    const { variant = "default", label = status.toUpperCase() } = statusMap[status] || {}
    return <Badge variant={variant}>{label}</Badge>
  }

  const getBillStatusBadge = (status: string) => {
    const statusMap: Record<string, Variant> = {
      generated: "secondary",
      verified: "default",
      processed: "default",
      rejected: "destructive",
    }
    return <Badge variant={statusMap[status] || "default"}>{status.toUpperCase()}</Badge>
  }

  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      pending: <Clock className="w-4 h-4 text-amber-600" />,
      admin_priced: <DollarSign className="w-4 h-4 text-blue-600" />,
      approved: <CheckCircle className="w-4 h-4 text-green-600" />,
      rejected: <AlertTriangle className="w-4 h-4 text-red-600" />,
    }
    return iconMap[status] || <Package className="w-4 h-4 text-gray-600" />
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const handleGenerateBill = async (order: Order, billType: "regular" | "gst") => {
    try {
      const currentPricing = order.finalPricing || order.adminPricing || order.salesmanPricing
      if (!currentPricing) {
        throw new Error("Order must be priced before generating a bill")
      }

      if (billType === "gst" && !order.withGst) {
        throw new Error("This order is not marked for GST billing")
      }

      let gstNumber = order.gstNumber
      if (billType === "gst" && !gstNumber) {
        gstNumber = prompt("Enter GST Number:")?.trim() || ""
        if (!gstNumber) {
          throw new Error("GST Number is required for GST bills")
        }
      }

      const bill = await generateBill(order.id, billType, gstNumber)
      if (!bill) {
        throw new Error("Failed to generate bill")
      }

      alert(`${billType.toUpperCase()} bill generated successfully! Bill ID: ${bill.id}`)
    } catch (error) {
      console.error("Error generating bill:", error)
      alert(error instanceof Error ? error.message : "An error occurred while generating the bill")
    }
  }

  const handleEditOrder = (order: Order) => {
    if (!order.isEditable) {
      alert("This order cannot be edited as it has been processed by admin.")
      return
    }
    setEditingOrder(order)
    setIsCreateOrderOpen(true)
  }

  const handleCloseOrderDialog = () => {
    setIsCreateOrderOpen(false)
    setEditingOrder(null)
  }

  const handlePreviewBill = (order: Order) => {
    const orderBill = bills.find((bill) => bill.orderId === order.id)
    if (orderBill) {
      setPreviewBill(orderBill)
      setPreviewOrder(order)
    } else {
      alert("No bill found for this order")
    }
  }

  const handleExportBackup = async () => {
    try {
      await exportBackup()
      alert("Backup exported successfully! Check your downloads folder.")
    } catch (error) {
      console.error("Backup export failed:", error)
      alert("Failed to export backup. Please try again.")
    }
  }

  const handleCreateBackup = async () => {
    try {
      await createManualBackup()
      alert("Manual backup created successfully!")
    } catch (error) {
      console.error("Backup creation failed:", error)
      alert("Failed to create backup. Please try again.")
    }
  }

  // Welcome message effect
  useEffect(() => {
    if (isDataLoaded && user?.name) {
      speakWelcome()
    }

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [isDataLoaded, user?.name, speakWelcome])

  // Request approval if not approved
  useEffect(() => {
    if (user && user.role === "salesman" && user.isApproved === false) {
      // Only send a request if not already pending/approved
      const existing = getRequestStatus(user.id, "login")
      if (!existing) {
        requestAdminPermission("login")
      }
    }
  }, [user, getRequestStatus, requestAdminPermission])

  // Show loading state while data is being loaded
  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 to-neutral-900 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-600 border-t-transparent mx-auto"></div>
            <p className="text-stone-200 text-lg">Loading Dashboard...</p>
            <p className="text-stone-400">Please wait a moment</p>
          </div>
        </div>
      </div>
    )
  }

  if (user && user.isApproved === false) {
    const req = getRequestStatus(user.id, "login")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-900 to-neutral-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-amber-600 mb-2">Pending Approval</h2>
          <p className="text-stone-200 mb-4">Your account is pending admin approval. Please wait for approval before accessing the dashboard.</p>
          {req && req.status === "pending" && (
            <p className="text-amber-400 mt-2">Approval request sent to admin.</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 to-neutral-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-stone-800 to-neutral-800 rounded-lg p-6 border border-amber-700/30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-stone-100 mb-1">Welcome, {user?.name}</h1>
              <p className="text-stone-400">Salesman Dashboard</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                className="bg-stone-700 border-amber-600/50 text-stone-200 hover:bg-stone-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportBackup}
                className="bg-stone-700 border-amber-600/50 text-stone-200 hover:bg-stone-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAdminLoginOpen(true)}
                className="bg-amber-800 border-amber-600 text-amber-100 hover:bg-amber-700"
              >
                <User className="w-4 h-4 mr-2" />
                Admin Access
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  logout();
                  window.location.href = '/login';
                }}
                className="bg-red-700 border-red-600 text-white hover:bg-red-800"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-stone-800 to-neutral-800 border-amber-700/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-stone-100">
                <ShoppingCart className="w-5 h-5 text-amber-600" />
                <span>Create New Order</span>
              </CardTitle>
              <CardDescription className="text-stone-400">
                Place a new order with pricing and GST options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setIsCreateOrderOpen(true)}
                className="w-full bg-amber-700 hover:bg-amber-600 text-white"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Create Order
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-stone-800 to-neutral-800 border-amber-700/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-stone-100">
                <Building2 className="w-5 h-5 text-amber-600" />
                <span>Add New Client</span>
              </CardTitle>
              <CardDescription className="text-stone-400">Register a new client for future orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setIsCreateClientOpen(true)}
                variant="outline"
                className="w-full bg-stone-700 border-amber-600/50 text-stone-200 hover:bg-stone-600"
                  >
                <Building2 className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: Package, label: "Total Orders", value: stats.totalOrders, color: "text-blue-400" },
            { icon: Clock, label: "Pending Orders", value: stats.pendingOrders, color: "text-amber-400" },
            { icon: CheckCircle, label: "Approved Orders", value: stats.approvedOrders, color: "text-green-400" },
            { icon: Building2, label: "Total Clients", value: stats.totalClients, color: "text-purple-400" },
            { icon: Receipt, label: "Generated Bills", value: stats.generatedBills, color: "text-orange-400" },
            { icon: AlertTriangle, label: "Pending Bills", value: stats.pendingBills, color: "text-red-400" },
          ].map((stat, index) => (
            <Card key={index} className="bg-gradient-to-br from-stone-800 to-neutral-800 border-amber-700/30">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  <div>
                    <p className="text-sm font-medium text-stone-300">{stat.label}</p>
                    <p className="text-xl font-bold text-stone-100">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Pricing Summary */}
        <Card className="bg-gradient-to-br from-stone-800 to-neutral-800 border-amber-700/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-stone-100">
              <Calculator className="w-5 h-5 text-amber-600" />
              Order Pricing Summary
            </CardTitle>
            <CardDescription className="text-stone-400">
              Overview of all order values and pricing metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: TrendingUp,
                  label: "Total Order Value",
                  value: formatCurrency(pricingSummary.totalValue),
                  bgColor: "bg-blue-900/30",
                  textColor: "text-blue-300",
                },
                {
                  icon: Clock,
                  label: "Pending Value",
                  value: formatCurrency(pricingSummary.pendingValue),
                  bgColor: "bg-amber-900/30",
                  textColor: "text-amber-300",
                },
                {
                  icon: CheckCircle,
                  label: "Approved Value",
                  value: formatCurrency(pricingSummary.approvedValue),
                  bgColor: "bg-green-900/30",
                  textColor: "text-green-300",
                },
                {
                  icon: DollarSign,
                  label: "Average Order",
                  value: formatCurrency(pricingSummary.averageOrderValue),
                  bgColor: "bg-purple-900/30",
                  textColor: "text-purple-300",
                },
              ].map((item, index) => (
                <div key={index} className={`text-center p-4 ${item.bgColor} rounded-lg border border-stone-600`}>
                  <item.icon className={`w-8 h-8 ${item.textColor} mx-auto mb-2`} />
                  <p className="text-sm font-medium text-stone-300">{item.label}</p>
                  <p className={`text-xl font-bold ${item.textColor}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All My Orders Section */}
        <Card className="bg-gradient-to-br from-stone-800 to-neutral-800 border-amber-700/30">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-stone-100">
                  <Package className="w-5 h-5 text-amber-600" />
                  All My Orders ({salesmanOrders.length})
                </CardTitle>
                <CardDescription className="text-stone-400">
                  Complete list of all orders you have created
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-stone-700 border-stone-600 text-stone-200 w-full"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-stone-700 border border-stone-600 text-stone-200 rounded-md px-3 py-2"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="admin_priced">Admin Priced</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-stone-500 mx-auto mb-4" />
                <p className="text-stone-400 text-lg">
                  {searchTerm || statusFilter !== "all"
                    ? "No orders match your search"
                    : "No orders found for your account"}
                </p>
                <p className="text-sm text-stone-500 mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Create your first order to get started"}
                </p>

                {!searchTerm && statusFilter === "all" && (
                  <Button
                    onClick={() => setIsCreateOrderOpen(true)}
                    className="bg-amber-700 hover:bg-amber-600 text-white mt-4"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Create First Order
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Order Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {filteredOrders.slice(0, 6).map((order) => (
                    <OrderStatusCard key={order.id} order={order} />
                  ))}
                </div>

                {/* Detailed Orders Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-stone-700">
                        <TableHead className="text-stone-300">Order #</TableHead>
                        <TableHead className="text-stone-300">Client</TableHead>
                        <TableHead className="text-stone-300">Items</TableHead>
                        <TableHead className="text-stone-300">Date</TableHead>
                        <TableHead className="text-stone-300">Status</TableHead>
                        <TableHead className="text-stone-300">Total</TableHead>
                        <TableHead className="text-stone-300">GST</TableHead>
                        <TableHead className="text-stone-300">Bill Status</TableHead>
                        <TableHead className="text-stone-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => {
                        const currentPricing = order.finalPricing || order.adminPricing || order.salesmanPricing
                        const canGenerateBill =
                          currentPricing && (order.status === "approved" || order.status === "admin_priced")
                        const orderBill = bills.find((bill) => bill.orderId === order.id)

                        return (
                          <TableRow key={order.id} className="border-stone-700 hover:bg-stone-700/30">
                            <TableCell className="font-bold text-amber-400">{order.orderNumber}</TableCell>
                            <TableCell>
                              <div className="text-stone-200">
                                <p className="font-medium">{order.clientName}</p>
                                <p className="text-xs text-stone-400 flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  Client ID: {order.clientId.slice(-8)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-stone-300">
                                <p className="font-medium">{order.items.length} types</p>
                                <p className="text-xs text-stone-400">
                                  {order.items.reduce((sum, item) => sum + item.requestedQuantity, 0)} units total
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-stone-300">
                                <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                                <p className="text-xs text-stone-400 flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {new Date(order.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(order.status)}
                                {getStatusBadge(order.status)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {currentPricing ? (
                                <div className="text-green-400">
                                  <p className="font-bold">{formatCurrency(currentPricing.total)}</p>
                                  <p className="text-xs text-stone-400">Tax: {formatCurrency(currentPricing.tax)}</p>
                                </div>
                              ) : (
                                <span className="text-amber-400">Pending</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={order.withGst ? "default" : "outline"}>
                                {order.withGst ? "With GST" : "No GST"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {orderBill ? (
                                <div className="flex items-center gap-2">
                                  {getBillStatusBadge(orderBill.status)}
                                  {order.autoGeneratedBill && (
                                    <Badge variant="outline" className="text-xs">
                                      Auto
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-stone-500">No Bill</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                {order.isEditable && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditOrder(order)}
                                    className="text-stone-400 hover:text-stone-200 h-8 w-8 p-0"
                                    title="Edit Order"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    alert(
                                      `Order Details:\n\nOrder #: ${order.orderNumber}\nClient: ${order.clientName}\nItems: ${order.items.length} types\nStatus: ${order.status}\nNotes: ${order.notes || "No notes"}`
                                    )
                                  }}
                                  className="text-stone-400 hover:text-stone-200 h-8 w-8 p-0"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {orderBill && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePreviewBill(order)}
                                    className="text-stone-400 hover:text-stone-200 h-8 w-8 p-0"
                                    title="View Bill"
                                  >
                                    <FileText className="w-4 h-4" />
                                  </Button>
                                )}
                                {canGenerateBill && !orderBill && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleGenerateBill(order, "regular")}
                                      className="text-stone-400 hover:text-stone-200 h-8 w-8 p-0"
                                      title="Generate Regular Bill"
                                    >
                                      <Download className="w-4 h-4" />
                                    </Button>
                                    {order.withGst && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleGenerateBill(order, "gst")}
                                        className="text-stone-400 hover:text-stone-200 h-8 w-8 p-0"
                                        title="Generate GST Bill"
                                      >
                                        <Receipt className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Show more button if there are more orders */}
                {filteredOrders.length > 10 && (
                  <div className="text-center pt-4">
                    <p className="text-stone-400 text-sm">
                      Showing {Math.min(10, filteredOrders.length)} of {filteredOrders.length} orders
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generated Bills */}
        {salesmanBills.length > 0 && (
          <Card className="bg-gradient-to-br from-stone-800 to-neutral-800 border-amber-700/30">
            <CardHeader>
              <CardTitle className="text-stone-100">Generated Bills</CardTitle>
              <CardDescription className="text-stone-400">
                Bills you have generated and their verification status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-stone-700">
                    <TableHead className="text-stone-300">Bill ID</TableHead>
                    <TableHead className="text-stone-300">Order #</TableHead>
                    <TableHead className="text-stone-300">Client</TableHead>
                    <TableHead className="text-stone-300">Type</TableHead>
                    <TableHead className="text-stone-300">Amount</TableHead>
                    <TableHead className="text-stone-300">Status</TableHead>
                    <TableHead className="text-stone-300">Generated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesmanBills
                    .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
                    .map((bill) => (
                      <TableRow key={bill.id} className="border-stone-700 hover:bg-stone-700/30">
                        <TableCell className="font-medium text-stone-200">{bill.id}</TableCell>
                        <TableCell className="font-bold text-amber-400">{bill.orderNumber}</TableCell>
                        <TableCell className="text-stone-200">{bill.clientName}</TableCell>
                        <TableCell>
                          <Badge variant={bill.billType === "gst" ? "default" : "outline"}>
                            {bill.billType.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-green-400">{formatCurrency(bill.total)}</TableCell>
                        <TableCell>{getBillStatusBadge(bill.status)}</TableCell>
                        <TableCell className="text-stone-300">
                          {new Date(bill.generatedAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Dialogs */}
        <CreateOrderDialog open={isCreateOrderOpen} onOpenChange={handleCloseOrderDialog} editOrder={editingOrder} />
        <CreateClientDialog open={isCreateClientOpen} onOpenChange={setIsCreateClientOpen} />
        <AdminLoginDialog open={isAdminLoginOpen} onOpenChange={setIsAdminLoginOpen} />

        {/* Bill Preview Dialog */}
        <BillPreviewDialog
          open={!!previewBill}
          onOpenChange={(open: boolean) => {
            if (!open) {
              setPreviewBill(null)
              setPreviewOrder(null)
            }
          }}
          bill={previewBill as any}
          order={previewOrder as any}
        />
      </div>
    </div>
  )
}