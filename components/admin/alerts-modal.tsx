"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useInventory } from "@/contexts/inventory-context"
import { AlertTriangle, CheckCircle, Clock, XCircle, Bell, BellOff } from "lucide-react"

interface AlertsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AlertsModal({ isOpen, onClose }: AlertsModalProps) {
  const { alerts, acknowledgeAlert } = useInventory()

  const getAlertIcon = (type: string, severity: string) => {
    const iconClass =
      severity === "critical"
        ? "text-red-600"
        : severity === "high"
          ? "text-orange-600"
          : severity === "medium"
            ? "text-yellow-600"
            : "text-blue-600"

    switch (type) {
      case "low-stock":
        return <AlertTriangle className={`w-5 h-5 ${iconClass}`} />
      case "out-of-stock":
        return <XCircle className={`w-5 h-5 ${iconClass}`} />
      case "expiry-warning":
        return <Clock className={`w-5 h-5 ${iconClass}`} />
      case "overstock":
        return <AlertTriangle className={`w-5 h-5 ${iconClass}`} />
      default:
        return <Bell className={`w-5 h-5 ${iconClass}`} />
    }
  }

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: "destructive",
      high: "destructive",
      medium: "secondary",
      low: "outline",
    } as const

    return <Badge variant={variants[severity as keyof typeof variants] || "outline"}>{severity.toUpperCase()}</Badge>
  }

  const unacknowledgedAlerts = alerts.filter((alert) => !alert.acknowledged)
  const acknowledgedAlerts = alerts.filter((alert) => alert.acknowledged)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Inventory Alerts</span>
          </DialogTitle>
          <DialogDescription>Monitor and manage inventory alerts and notifications</DialogDescription>
        </DialogHeader>

        {/* Alert Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold">
                    {alerts.filter((a) => a.severity === "critical" && !a.acknowledged).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">High</p>
                  <p className="text-2xl font-bold">
                    {alerts.filter((a) => a.severity === "high" && !a.acknowledged).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Medium</p>
                  <p className="text-2xl font-bold">
                    {alerts.filter((a) => a.severity === "medium" && !a.acknowledged).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Low</p>
                  <p className="text-2xl font-bold">
                    {alerts.filter((a) => a.severity === "low" && !a.acknowledged).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Alerts */}
        {unacknowledgedAlerts.length > 0 && (
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-red-600">Active Alerts</h3>
            {unacknowledgedAlerts.map((alert) => (
              <Card key={alert.id} className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getAlertIcon(alert.type, alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{alert.itemName}</h4>
                          {getSeverityBadge(alert.severity)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Created: {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => acknowledgeAlert(alert.id)} variant="outline">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Acknowledge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Acknowledged Alerts */}
        {acknowledgedAlerts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-600">Acknowledged Alerts</h3>
            {acknowledgedAlerts.map((alert) => (
              <Card key={alert.id} className="opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <BellOff className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{alert.itemName}</h4>
                        {getSeverityBadge(alert.severity)}
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          ACKNOWLEDGED
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created: {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {alerts.length === 0 && (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No alerts at this time.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
