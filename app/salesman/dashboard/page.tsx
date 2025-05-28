"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { SalesmanDashboardContent } from "@/components/salesman/salesman-dashboard-content"

export default function SalesmanDashboard() {
  const { currentUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!currentUser || currentUser.role !== "salesman") {
      router.push("/salesman/login")
    }
  }, [currentUser, router])

  if (!currentUser) {
    return <div>Loading...</div>
  }

  return <SalesmanDashboardContent />
}
