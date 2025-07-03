"use client"

import { useEffect, Suspense, lazy } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

const LazySalesmanDashboardContent = lazy(() => import("@/components/salesman/salesman-dashboard-content"))

export default function SalesmanDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'salesman') {
      router.push("/salesman/login")
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || !user || user.role !== 'salesman') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div><p>Loading dashboard...</p></div>}>
      <LazySalesmanDashboardContent />
    </Suspense>
  )
}
