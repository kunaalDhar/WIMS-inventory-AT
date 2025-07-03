"use client"

import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  // Handler for Explore More button
  const handleExploreMore = () => {
    router.push("/login") // Unified login page for both Admin and Salesman
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      <div className="container mx-auto px-4 py-16 flex-1 flex flex-col items-center justify-center">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-8 shadow-lg">
            <BarChart3 className="h-14 w-14 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6 drop-shadow-lg">
            WIMS - Warehouse Inventory Management System
          </h1>
          <p className="text-2xl text-gray-700 max-w-3xl mx-auto font-medium mb-8">
            Streamline your warehouse operations with our comprehensive inventory and sales management platform.
          </p>
        </div>
        
        {/* Explore More Section */}
        <Card className="mx-auto max-w-xl p-10 rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md flex flex-col items-center mb-16 border-0 hover:shadow-3xl transition-all duration-300">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Explore More</h2>
          <p className="text-lg text-gray-600 mb-8 text-center">
            Discover how WIMS can help you manage inventory, sales, and operations efficiently. Click below to get started as an Admin or Salesman.
          </p>
          <button
            onClick={handleExploreMore}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xl font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-700 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            Explore More &rarr;
          </button>
        </Card>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto mt-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">System Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-xl transition-shadow rounded-2xl bg-blue-50/60">
              <div className="mx-auto w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Inventory Management</h3>
              <p className="text-gray-600">
                Track stock levels, manage products, and monitor inventory movements in real-time.
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-shadow rounded-2xl bg-green-50/60">
              <div className="mx-auto w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sales Management</h3>
              <p className="text-gray-600">
                Create orders, manage clients, and track sales performance across your team.
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-shadow rounded-2xl bg-purple-50/60">
              <div className="mx-auto w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600" />
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
