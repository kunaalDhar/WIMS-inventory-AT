"use client"

import { useEffect, Suspense, lazy } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

const LazyAdminDashboard = lazy(() => import("@/components/admin/modern-admin-dashboard"))

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if explicitly not authenticated
    // This prevents unnecessary redirects during initial load
    if (isAuthenticated === false) {
      router.replace("/admin/login")
      return
    }

    // If we have a user but they're not an admin, redirect
    if (user && user.role !== "admin") {
      router.replace("/admin/login")
    }
  }, [isAuthenticated, user, router])

  if (isAuthenticated === undefined || user === undefined || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Show access denied if user is not an admin
  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <button
            onClick={() => router.replace("/admin/login")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div><p>Loading dashboard...</p></div>}>
      <LazyAdminDashboard />
    </Suspense>
  )
}
