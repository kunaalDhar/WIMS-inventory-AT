"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useInventory } from "@/contexts/inventory-context"
import { Activity, ArrowUp, ArrowDown, RefreshCw, Settings, Calendar, MapPin, User } from "lucide-react"

interface StockMovementModalProps {
  isOpen: boolean
  onClose: () => void
}

export function StockMovementModal({ isOpen, onClose }: StockMovementModalProps) {
  const { movements } = useInventory()

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "in":
        return <ArrowUp className="w-4 h-4 text-green-600" />
      case "out":
        return <ArrowDown className="w-4 h-4 text-red-600" />
      case "transfer":
        return <RefreshCw className="w-4 h-4 text-blue-600" />
      case "adjustment":
        return <Settings className="w-4 h-4 text-orange-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getMovementBadge = (type: string) => {
    const variants = {
      in: "default",
      out: "destructive",
      transfer: "secondary",
      adjustment: "outline",
    } as const

    return <Badge variant={variants[type as keyof typeof variants] || "outline"}>{type.toUpperCase()}</Badge>
  }

  const getMovementColor = (type: string) => {
    switch (type) {
      case "in":
        return "text-green-600"
      case "out":
        return "text-red-600"
      case "transfer":
        return "text-blue-600"
      case "adjustment":
        return "text-orange-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Stock Movement History</span>
          </DialogTitle>
          <DialogDescription>Complete log of all inventory transactions and movements</DialogDescription>
        </DialogHeader>

        {/* Movement Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ArrowUp className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Stock In</p>
                  <p className="text-2xl font-bold">{movements.filter((m) => m.type === "in").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ArrowDown className="w-4 h-4 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Stock Out</p>
                  <p className="text-2xl font-bold">{movements.filter((m) => m.type === "out").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Transfers</p>
                  <p className="text-2xl font-bold">{movements.filter((m) => m.type === "transfer").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Adjustments</p>
                  <p className="text-2xl font-bold">{movements.filter((m) => m.type === "adjustment").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Movements Timeline */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Movements</h3>
          {movements.map((movement) => (
            <Card key={movement.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getMovementIcon(movement.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{movement.itemName}</h4>
                        {getMovementBadge(movement.type)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{movement.reason}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{movement.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{movement.performedBy}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(movement.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getMovementColor(movement.type)}`}>
                      {movement.type === "in" ? "+" : "-"}
                      {movement.quantity}
                    </p>
                    <p className="text-xs text-muted-foreground">cases</p>
                  </div>
                </div>
                {(movement.orderId || movement.transferId) && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center space-x-4 text-xs">
                      {movement.orderId && (
                        <span className="text-muted-foreground">
                          Order ID: <span className="font-medium">{movement.orderId}</span>
                        </span>
                      )}
                      {movement.transferId && (
                        <span className="text-muted-foreground">
                          Transfer ID: <span className="font-medium">{movement.transferId}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {movements.length === 0 && (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No stock movements recorded yet.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
