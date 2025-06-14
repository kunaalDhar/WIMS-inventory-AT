"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import {
  ShoppingCart,
  Users,
  BarChart3,
  Package,
  Shield,
  User,
  Building2,
  TrendingUp,
  Lock,
  UserCheck,
} from "lucide-react"

export default function HomePage() {
  const { users } = useAuth()
  const salesmen = users.filter((user) => user.role === "salesman")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  WIMS
                </h1>
                <p className="text-sm text-gray-600">Warehouse Inventory Management System</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              v2.0 Enterprise
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to WIMS
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Advanced Warehouse Inventory Management System designed for modern businesses. Streamline your operations
              with powerful tools for inventory tracking, order management, and sales analytics.
            </p>

            {/* Feature Highlights */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <Package className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Inventory Control</h3>
                <p className="text-sm text-gray-600">Real-time stock tracking and management</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <ShoppingCart className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Order Management</h3>
                <p className="text-sm text-gray-600">Streamlined order processing workflow</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Analytics</h3>
                <p className="text-sm text-gray-600">Comprehensive business insights</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-pink-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <Users className="h-8 w-8 text-pink-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Team Management</h3>
                <p className="text-sm text-gray-600">Multi-user access and permissions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Login Options */}
      <section className="py-16 px-4 bg-white/40 backdrop-blur-sm">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Access Your Dashboard</h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Secure Admin Login */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-red-50 to-orange-50 shadow-xl">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-red-800 flex items-center justify-center gap-2">
                  <Lock className="h-5 w-5" />
                  Secure Admin Portal
                </CardTitle>
                <CardDescription className="text-red-600 font-medium">🔒 Authorized Personnel Only</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-800 font-medium mb-2">
                    <Shield className="h-4 w-4 inline mr-1" />
                    High-Security Access
                  </p>
                  <p className="text-xs text-red-700">
                    Pre-authorized credentials required. Unauthorized access attempts are monitored and logged.
                  </p>
                </div>
                <ul className="text-sm text-red-700 space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-red-600" />
                    Complete system administration
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-red-600" />
                    Advanced analytics & reports
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-red-600" />
                    User management & permissions
                  </li>
                  <li className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-red-600" />
                    Full inventory control
                  </li>
                </ul>
                <Button
                  asChild
                  className="w-full mt-6 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <a href="/admin/login">
                    <Shield className="h-4 w-4 mr-2" />
                    Secure Admin Access
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Salesman Login */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <User className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-blue-800">Salesman Portal</CardTitle>
                <CardDescription className="text-blue-600">Sales team access and order management</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                {salesmen.length > 0 && (
                  <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                      <UserCheck className="h-4 w-4 inline mr-1" />
                      Registered Salesmen ({salesmen.length})
                    </p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {salesmen.slice(0, 3).map((salesman) => (
                        <Badge key={salesman.id} variant="secondary" className="text-xs bg-blue-200 text-blue-800">
                          {salesman.name}
                        </Badge>
                      ))}
                      {salesmen.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-blue-200 text-blue-800">
                          +{salesmen.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                <ul className="text-sm text-blue-700 space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                    Create and manage orders
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Client relationship management
                  </li>
                  <li className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    Inventory lookup and tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    Sales performance metrics
                  </li>
                </ul>
                <div className="flex gap-2 mt-6">
                  <Button
                    asChild
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <a href="/salesman/login">
                      <User className="h-4 w-4 mr-2" />
                      Login
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <a href="/salesman/signup">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Register
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold">WIMS</h3>
          </div>
          <p className="text-gray-400 mb-4">
            Warehouse Inventory Management System - Empowering businesses with intelligent inventory solutions
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <span>© 2024 WIMS Enterprise</span>
            <span>•</span>
            <span>Secure & Reliable</span>
            <span>•</span>
            <span>24/7 Support</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
