"use client"

import { useState, useEffect } from "react"
import { useOrders } from "@/contexts/order-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Eye,
  Calendar,
  MapPin,
  Package,
  User,
  Award,
  Target,
  BarChart3,
} from "lucide-react"

interface SalesmanStats {
  salesmanId: string
  salesmanName: string
  totalOrders: number
  pendingOrders: number
  approvedOrders: number
  rejectedOrders: number
  totalRevenue: number
  averageOrderValue: number
  lastOrderDate: string
  performance: "excellent" | "good" | "average" | "poor"
  orders: any[]
}

export function SalesmanPanel() {
  const { orders, clients, bills, refreshData } = useOrders()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSalesman, setSelectedSalesman] = useState<string>("all")
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refreshData()
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshData])

  // Group orders by salesman and calculate statistics
  const salesmanStats: SalesmanStats[] = (() => {
    const salesmanMap = new Map<string, SalesmanStats>()

    orders.forEach((order) => {
      const key = `${order.salesmanId}-${order.salesmanName}`

      if (!salesmanMap.has(key)) {
        salesmanMap.set(key, {
          salesmanId: order.salesmanId,
          salesmanName: order.salesmanName,
          totalOrders: 0,
          pendingOrders: 0,
          approvedOrders: 0,
          rejectedOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          lastOrderDate: order.createdAt,
          performance: "average",
          orders: [],
        })
      }

      const stats = salesmanMap.get(key)!
      stats.totalOrders++
      stats.orders.push(order)

      // Update status counts
      switch (order.status) {
        case "pending":
          stats.pendingOrders++
          break
        case "approved":
          stats.approvedOrders++
          break
        case "rejected":
          stats.rejectedOrders++
          break
      }

      // Calculate revenue
      const pricing = order.finalPricing || order.adminPricing || order.salesmanPricing
      if (pricing) {
        stats.totalRevenue += pricing.total
      }

      // Update last order date
      if (new Date(order.createdAt) > new Date(stats.lastOrderDate)) {
        stats.lastOrderDate = order.createdAt
      }
    })

    // Calculate averages and performance
    return Array.from(salesmanMap.values())
      .map((stats) => {
        stats.averageOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0

        // Determine performance based on approval rate and order volume
        const approvalRate = stats.totalOrders > 0 ? stats.approvedOrders / stats.totalOrders : 0
        if (approvalRate >= 0.8 && stats.totalOrders >= 10) {
          stats.performance = "excellent"
        } else if (approvalRate >= 0.6 && stats.totalOrders >= 5) {
          stats.performance = "good"
        } else if (approvalRate >= 0.4 || stats.totalOrders >= 3) {
          stats.performance = "average"
        } else {
          stats.performance = "poor"
        }

        return stats
      })
      .sort((a, b) => b.totalOrders - a.totalOrders)
  })()

  // Filter orders based on selected salesman and search
  const filteredOrders = orders.filter((order) => {
    const matchesSalesman = selectedSalesman === "all" || order.salesmanId === selectedSalesman
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.salesmanName.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSalesman && matchesSearch
  })

  // Overall statistics
  const overallStats = {
    totalSalespeople: salesmanStats.length,
    totalOrders: orders.length,
    totalRevenue: salesmanStats.reduce((sum, stats) => sum + stats.totalRevenue, 0),
    averageOrdersPerSalesman: salesmanStats.length > 0 ? orders.length / salesmanStats.length : 0,
    topPerformer: salesmanStats.find((s) => s.performance === "excellent") || salesmanStats[0],
    activeToday: salesmanStats.filter((s) => {
      const today = new Date().toDateString()
      return new Date(s.lastOrderDate).toDateString() === today
    }).length,
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      admin_priced: "default",
      salesman_adjusted: "outline",
      approved: "default",
      rejected: "destructive",
      completed: "default",
    } as const

    const labels = {
      pending: "PENDING",
      admin_priced: "PRICED",
      salesman_adjusted: "ADJUSTED",
      approved: "APPROVED",
      rejected: "REJECTED",
      completed: "COMPLETED",
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {labels[status as keyof typeof labels] || status.toUpperCase()}
      </Badge>
    )
  }

  const getPerformanceBadge = (performance: string) => {
    const variants = {
      excellent: "default",
      good: "secondary",
      average: "outline",
      poor: "destructive",
    } as const

    const colors = {
      excellent: "text-green-600",
      good: "text-blue-600",
      average: "text-yellow-600",
      poor: "text-red-600",
    }

    return (
      <Badge
        variant={variants[performance as keyof typeof variants]}
        className={colors[performance as keyof typeof colors]}
      >
        {performance.toUpperCase()}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Salesman Management</h1>
          <p className="text-muted-foreground">Monitor salespeople performance and their orders</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant={autoRefresh ? "default" : "outline"} size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Auto-Refresh {autoRefresh ? "ON" : "OFF"}
          </Button>
          <Button onClick={refreshData} variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Salespeople</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalSalespeople}</div>
            <p className="text-xs text-muted-foreground">Active in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">All salespeople</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overallStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Combined revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Orders/Person</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.averageOrdersPerSalesman.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Per salesperson</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.activeToday}</div>
            <p className="text-xs text-muted-foreground">Created orders today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{overallStats.topPerformer?.salesmanName || "N/A"}</div>
            <p className="text-xs text-muted-foreground">{overallStats.topPerformer?.totalOrders || 0} orders</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Salesman Overview</TabsTrigger>
          <TabsTrigger value="orders">All Orders</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Salesman Statistics</CardTitle>
              <CardDescription>Performance overview of all salespeople</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Salesman</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Total Orders</TableHead>
                      <TableHead>Pending</TableHead>
                      <TableHead>Approved</TableHead>
                      <TableHead>Rejected</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Avg Order</TableHead>
                      <TableHead>Last Order</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesmanStats.map((stats) => (
                      <TableRow key={stats.salesmanId}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{stats.salesmanName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{stats.salesmanId.slice(-8)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4 text-blue-600" />
                            <span className="font-bold">{stats.totalOrders}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <span>{stats.pendingOrders}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>{stats.approvedOrders}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span>{stats.rejectedOrders}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatCurrency(stats.averageOrderValue)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{new Date(stats.lastOrderDate).toLocaleDateString()}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(stats.lastOrderDate).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getPerformanceBadge(stats.performance)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedSalesman(stats.salesmanId)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Salesman Orders</CardTitle>
                  <CardDescription>Complete list of orders from all salespeople</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <select
                    value={selectedSalesman}
                    onChange={(e) => setSelectedSalesman(e.target.value)}
                    className="border border-input bg-background px-3 py-2 rounded-md"
                  >
                    <option value="all">All Salespeople</option>
                    {salesmanStats.map((stats) => (
                      <option key={stats.salesmanId} value={stats.salesmanId}>
                        {stats.salesmanName} ({stats.totalOrders} orders)
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
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((order) => {
                        const currentPricing = order.finalPricing || order.adminPricing || order.salesmanPricing

                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-bold text-blue-600">{order.orderNumber}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{order.salesmanName}</p>
                                <p className="text-xs text-muted-foreground font-mono">
                                  ID: {order.salesmanId.slice(-8)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{order.clientName}</p>
                                <p className="text-xs text-muted-foreground flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {order.clientId.slice(-8)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{order.items.length} types</p>
                                <p className="text-xs text-muted-foreground">
                                  {order.items.reduce((sum, item) => sum + item.requestedQuantity, 0)} units
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                                <p className="text-xs text-muted-foreground flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {new Date(order.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell>
                              {currentPricing ? (
                                <div className="text-green-600">
                                  <p className="font-bold">{formatCurrency(currentPricing.total)}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Tax: {formatCurrency(currentPricing.tax)}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-amber-600">Pending</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    alert(
                                      `Order Details:\n\nOrder #: ${order.orderNumber}\nSalesman: ${order.salesmanName}\nClient: ${order.clientName}\nItems: ${order.items.length} types\nStatus: ${order.status}\nNotes: ${order.notes || "No notes"}`,
                                    )
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </div>

              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    {searchTerm || selectedSalesman !== "all"
                      ? "No orders match your search criteria"
                      : "No orders found"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salesmanStats.map((stats) => (
              <Card key={stats.salesmanId} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>{stats.salesmanName}</span>
                    </CardTitle>
                    {getPerformanceBadge(stats.performance)}
                  </div>
                  <CardDescription>ID: {stats.salesmanId}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalOrders}</div>
                      <div className="text-xs text-muted-foreground">Total Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
                      <div className="text-xs text-muted-foreground">Revenue</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-amber-600" />
                        Pending
                      </span>
                      <span className="font-medium">{stats.pendingOrders}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                        Approved
                      </span>
                      <span className="font-medium">{stats.approvedOrders}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1 text-red-600" />
                        Rejected
                      </span>
                      <span className="font-medium">{stats.rejectedOrders}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="text-sm text-muted-foreground">Last Order</div>
                    <div className="font-medium">{new Date(stats.lastOrderDate).toLocaleDateString()}</div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedSalesman(stats.salesmanId)}
                  >
                    View Orders
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
