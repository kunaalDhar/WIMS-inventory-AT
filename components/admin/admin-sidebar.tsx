"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Home, ShoppingCart, FileText, BarChart3, DollarSign, Settings, LogOut, Shield } from "lucide-react"

interface AdminSidebarProps {
  activePanel: string
  setActivePanel: (panel: string) => void
}

const menuItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "sales", label: "Sales", icon: ShoppingCart },
  { id: "invoice", label: "Invoice Bills", icon: FileText },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "pricing", label: "Order Pricing", icon: DollarSign },
  { id: "settings", label: "Settings", icon: Settings },
]

export function AdminSidebar({ activePanel, setActivePanel }: AdminSidebarProps) {
  const { currentUser, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">WIMS Admin</h2>
            <p className="text-sm text-muted-foreground">Warehouse Intelligence</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => setActivePanel(item.id)}
                  isActive={activePanel === item.id}
                  className="w-full justify-start"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar>
            <AvatarFallback className="bg-indigo-100 text-indigo-600">
              {currentUser?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{currentUser?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
          </div>
        </div>
        <Button onClick={handleLogout} variant="outline" size="sm" className="w-full">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
