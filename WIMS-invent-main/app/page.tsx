"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, LogIn, UserPlus, Settings, BarChart3 } from "lucide-react"

export default function HomePage() {
  const { users, autoLoginLastUser, isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      if (!autoLoginAttempted) {
        setAutoLoginAttempted(true)
        const success = await autoLoginLastUser()
        if (success) {
          // Auto-login successful, redirect based on role
          return
        }
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [autoLoginLastUser, autoLoginAttempted])

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect authenticated users to their dashboard
      if (user.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/salesman/dashboard")
      }
    }
  }, [isAuthenticated, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading WIMS...</p>
        </div>
      </div>
    )
  }

  const adminUsers = users.filter((u) => u.role === "admin")
  const salesmanUsers = users.filter((u) => u.role === "salesman")
  const hasUsers = users.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6">
            <BarChart3 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            WIMS - Warehouse Inventory Management System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your warehouse operations with our comprehensive inventory and sales management platform
          </p>
        </div>

        {/* User Status */}
        {hasUsers && (
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <UserCheck className="h-5 w-5" />
                  Registered Users
                </CardTitle>
                <CardDescription className="text-green-700">
                  Welcome back! Your accounts are ready to use.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {adminUsers.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Admin Accounts ({adminUsers.length})
                      </h4>
                      {adminUsers.map((admin) => (
                        <div
                          key={admin.id}
                          className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-200"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{admin.name}</p>
                            <p className="text-sm text-gray-600">{admin.email}</p>
                          </div>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Admin
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {salesmanUsers.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Salesman Accounts ({salesmanUsers.length})
                      </h4>
                      {salesmanUsers.map((salesman) => (
                        <div
                          key={salesman.id}
                          className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-200"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{salesman.name}</p>
                            <p className="text-sm text-gray-600">{salesman.email}</p>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Salesman
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Cards */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Admin Section */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Admin Portal</CardTitle>
              <CardDescription className="text-gray-600">
                {adminUsers.length > 0
                  ? "Access your admin dashboard to manage the system"
                  : "Manage inventory, orders, and system settings"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {adminUsers.length > 0 ? (
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push("/admin/login")}
                    className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Login as Admin
                  </Button>
                  <p className="text-sm text-center text-gray-600">
                    {adminUsers.length} admin account{adminUsers.length > 1 ? "s" : ""} registered
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push("/admin/signup")}
                    className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create Admin Account
                  </Button>
                  <Button
                    onClick={() => router.push("/admin/login")}
                    variant="outline"
                    className="w-full py-3 text-lg font-semibold border-2 border-blue-200 hover:bg-blue-50"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Login as Admin
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Salesman Section */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Salesman Portal</CardTitle>
              <CardDescription className="text-gray-600">
                {salesmanUsers.length > 0
                  ? "Access your sales dashboard to manage orders"
                  : "Create orders, manage clients, and track sales"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {salesmanUsers.length > 0 ? (
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push("/salesman/login")}
                    className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Login as Salesman
                  </Button>
                  <p className="text-sm text-center text-gray-600">
                    {salesmanUsers.length} salesman account{salesmanUsers.length > 1 ? "s" : ""} registered
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push("/salesman/signup")}
                    className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Join as Salesman
                  </Button>
                  <Button
                    onClick={() => router.push("/salesman/login")}
                    variant="outline"
                    className="w-full py-3 text-lg font-semibold border-2 border-green-200 hover:bg-green-50"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Login as Salesman
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">System Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Inventory Management</h3>
              <p className="text-gray-600">
                Track stock levels, manage products, and monitor inventory movements in real-time.
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sales Management</h3>
              <p className="text-gray-600">
                Create orders, manage clients, and track sales performance across your team.
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Admin Controls</h3>
              <p className="text-gray-600">Comprehensive admin dashboard with user management and system controls.</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
