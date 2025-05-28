"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useInventory } from "@/contexts/inventory-context"
import { InventoryDetailModal } from "./inventory-detail-modal"
import { TransferDetailModal } from "./transfer-detail-modal"
import { StockMovementModal } from "./stock-movement-modal"
import { AlertsModal } from "./alerts-modal"
import {
  Package,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  ArrowRight,
  Warehouse,
  Activity,
} from "lucide-react"

export function HomePanel() {
  const { inventory, transfers, movements, alerts, getInventorySummary, refreshInventory } = useInventory()
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const summary = getInventorySummary()
  const recentTransfers = transfers.slice(0, 3)
  const recentMovements = movements.slice(0, 4)
  const unacknowledgedAlerts = alerts.filter((alert) => !alert.acknowledged)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "in-transit":
        return <RefreshCw className="w-4 h-4 text-blue-600" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      "in-stock": "default",
      "low-stock": "secondary",
      "out-of-stock": "destructive",
      overstocked: "outline",
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {status.replace("-", " ").toUpperCase()}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Warehouse Dashboard Overview</h1>
          <p className="text-muted-foreground">Real-time inventory and operations management</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={refreshInventory} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <div className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()}</div>
        </div>
      </div>

      {/* Alerts Banner */}
      {unacknowledgedAlerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-800">
                  {unacknowledgedAlerts.length} Active Alert{unacknowledgedAlerts.length > 1 ? "s" : ""}
                </span>
              </div>
              <Button
                onClick={() => setActiveModal("alerts")}
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                View Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics - Clickable Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveModal("inventory")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <Eye className="h-3 w-3 opacity-70" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalItems}</div>
            <p className="text-xs opacity-80">Cases • {formatCurrency(summary.totalValue)}</p>
            <div className="flex items-center mt-2 text-xs opacity-80">
              <span>Click to view details</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveModal("inventory")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hold Items</CardTitle>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <Eye className="h-3 w-3 opacity-70" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.lowStockItems + summary.outOfStockItems}</div>
            <p className="text-xs opacity-80">Items need attention</p>
            <div className="flex items-center mt-2 text-xs opacity-80">
              <span>Click to view details</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-gradient-to-r from-green-500 to-green-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveModal("inventory")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <Eye className="h-3 w-3 opacity-70" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.inStockItems}</div>
            <p className="text-xs opacity-80">Items available</p>
            <div className="flex items-center mt-2 text-xs opacity-80">
              <span>Click to view details</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-gradient-to-r from-red-500 to-red-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveModal("transfers")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Transfers</CardTitle>
            <div className="flex items-center space-x-2">
              <Warehouse className="h-4 w-4" />
              <Eye className="h-3 w-3 opacity-70" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pendingTransfers}</div>
            <p className="text-xs opacity-80">Awaiting approval</p>
            <div className="flex items-center mt-2 text-xs opacity-80">
              <span>Click to view details</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Transfer Status - Clickable */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveModal("transfers")}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-5 h-5" />
                <span>Stock Transfer Status</span>
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </CardTitle>
            <CardDescription>Recent stock movements between warehouse locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransfers.map((transfer) => (
                <div key={transfer.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(transfer.status)}
                    <div>
                      <p className="font-medium">{transfer.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {transfer.fromLocation} → {transfer.toLocation}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transfer.itemName} ({transfer.quantity} cases)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        transfer.status === "completed"
                          ? "default"
                          : transfer.status === "in-transit"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {transfer.status.replace("-", " ").toUpperCase()}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(transfer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                View All Transfers
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Summary - Clickable */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveModal("inventory")}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Inventory Summary</span>
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </CardTitle>
            <CardDescription>Current stock levels and status overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventory.slice(0, 4).map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.category} • {formatCurrency(item.totalValue)}
                      </p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Stock: {item.currentStock}</span>
                      <span>Min: {item.minStock}</span>
                    </div>
                    <Progress value={Math.min((item.currentStock / (item.minStock * 2)) * 100, 100)} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                View Full Inventory
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity - Clickable */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveModal("movements")}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Recent Stock Movements</span>
            </div>
            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
          </CardTitle>
          <CardDescription>Latest inventory transactions and movements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentMovements.map((movement) => (
              <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${movement.type === "in" ? "bg-green-500" : "bg-red-500"}`} />
                  <div>
                    <p className="font-medium">{movement.itemName}</p>
                    <p className="text-sm text-muted-foreground">{movement.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${movement.type === "in" ? "text-green-600" : "text-red-600"}`}>
                    {movement.type === "in" ? "+" : "-"}
                    {movement.quantity}
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(movement.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              View All Movements
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <InventoryDetailModal isOpen={activeModal === "inventory"} onClose={() => setActiveModal(null)} />
      <TransferDetailModal isOpen={activeModal === "transfers"} onClose={() => setActiveModal(null)} />
      <StockMovementModal isOpen={activeModal === "movements"} onClose={() => setActiveModal(null)} />
      <AlertsModal isOpen={activeModal === "alerts"} onClose={() => setActiveModal(null)} />
    </div>
  )
}
