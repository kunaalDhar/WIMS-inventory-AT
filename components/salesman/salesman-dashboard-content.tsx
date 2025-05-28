"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useOrders } from "@/contexts/order-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreateOrderDialog } from "./create-order-dialog"
import { CreateVendorDialog } from "./create-vendor-dialog"
import { AdminLoginDialog } from "./admin-login-dialog"
import { OrderStatusCard } from "./order-status-card"
import { Briefcase, Plus, ShoppingCart, Users, Package, TrendingUp, LogOut, Shield } from "lucide-react"

export function SalesmanDashboardContent() {
  const { currentUser, logout } = useAuth()
  const { orders, vendors } = useOrders()
  const router = useRouter()
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false)
  const [isCreateVendorOpen, setIsCreateVendorOpen] = useState(false)
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // Filter orders for current salesman
  const salesmanOrders = orders.filter((order) => order.salesmanId === currentUser?.id)
  const pendingOrders = salesmanOrders.filter((order) => order.status === "pending")
  const pricedOrders = salesmanOrders.filter((order) => order.status === "priced")
  const completedOrders = salesmanOrders.filter((order) => order.status === "completed")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-8 h-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Salesman Dashboard</h1>
                <p className="text-sm text-gray-600">Warehouse Intelligent Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {currentUser?.name}</span>
              <Button onClick={() => setIsAdminLoginOpen(true)} variant="outline" size="sm">
                <Shield className="w-4 h-4 mr-2" />
                Return to Admin Panel
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setIsCreateOrderOpen(true)}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
                <span>Create Order</span>
              </CardTitle>
              <CardDescription>Create a new order with item selection and quantities</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Start New Order
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setIsCreateVendorOpen(true)}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-green-600" />
                <span>Create New Vendor</span>
              </CardTitle>
              <CardDescription>Add a new vendor to the warehouse system with contact details</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Vendor
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesmanOrders.length}</div>
              <p className="text-xs text-muted-foreground">Orders created by you</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting admin pricing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Priced Orders</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pricedOrders.length}</div>
              <p className="text-xs text-muted-foreground">Ready for approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendors.length}</div>
              <p className="text-xs text-muted-foreground">Total vendors in system</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Your Recent Orders</CardTitle>
            <CardDescription>Track the status of your submitted orders</CardDescription>
          </CardHeader>
          <CardContent>
            {salesmanOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No orders created yet</p>
                <Button onClick={() => setIsCreateOrderOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Order
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {salesmanOrders
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 5)
                  .map((order) => (
                    <OrderStatusCard key={order.id} order={order} />
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vendor List */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Available Vendors</CardTitle>
            <CardDescription>Vendors you can select when creating orders</CardDescription>
          </CardHeader>
          <CardContent>
            {vendors.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No vendors added yet</p>
                <Button onClick={() => setIsCreateVendorOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Vendor
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vendors.map((vendor) => (
                  <div key={vendor.id} className="p-4 border rounded-lg">
                    <h4 className="font-medium">{vendor.name}</h4>
                    <p className="text-sm text-gray-600">{vendor.email}</p>
                    <p className="text-sm text-gray-600">{vendor.phone}</p>
                    <p className="text-sm text-gray-500 mt-2">Contact: {vendor.contactPerson}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Dialogs */}
      <CreateOrderDialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen} />
      <CreateVendorDialog open={isCreateVendorOpen} onOpenChange={setIsCreateVendorOpen} />
      <AdminLoginDialog open={isAdminLoginOpen} onOpenChange={setIsAdminLoginOpen} />
    </div>
  )
}
