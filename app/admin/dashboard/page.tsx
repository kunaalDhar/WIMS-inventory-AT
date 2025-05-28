"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { HomePanel } from "@/components/admin/home-panel"
import { SalesPanel } from "@/components/admin/sales-panel"
import { InvoicePanel } from "@/components/admin/invoice-panel"
import { ReportsPanel } from "@/components/admin/reports-panel"
import { OrderPricingPanel } from "@/components/admin/order-pricing-panel"
import { SettingsPanel } from "@/components/admin/settings-panel"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function AdminDashboard() {
  const { currentUser } = useAuth()
  const router = useRouter()
  const [activePanel, setActivePanel] = useState("home")

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      router.push("/admin/login")
    }
  }, [currentUser, router])

  if (!currentUser) {
    return <div>Loading...</div>
  }

  const renderPanel = () => {
    switch (activePanel) {
      case "home":
        return <HomePanel />
      case "sales":
        return <SalesPanel />
      case "invoice":
        return <InvoicePanel />
      case "reports":
        return <ReportsPanel />
      case "pricing":
        return <OrderPricingPanel />
      case "settings":
        return <SettingsPanel />
      default:
        return <HomePanel />
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar activePanel={activePanel} setActivePanel={setActivePanel} />
        <SidebarInset className="flex-1">
          <div className="flex-1 overflow-auto">{renderPanel()}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
