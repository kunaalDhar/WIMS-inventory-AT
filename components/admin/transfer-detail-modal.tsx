"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useInventory } from "@/contexts/inventory-context"
import { RefreshCw, CheckCircle, Clock, XCircle, Truck, MapPin, User, Calendar } from "lucide-react"

interface TransferDetailModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TransferDetailModal({ isOpen, onClose }: TransferDetailModalProps) {
  const { transfers, updateTransferStatus } = useInventory()
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const filteredTransfers = transfers.filter((transfer) => {
    return filterStatus === "all" || transfer.status === filterStatus
  })

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
      completed: "default",
      "in-transit": "secondary",
      pending: "outline",
      cancelled: "destructive",
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.replace("-", " ").toUpperCase()}
      </Badge>
    )
  }

  const getTransferTypeIcon = (type: string) => {
    switch (type) {
      case "warehouse-to-store":
        return "🏪"
      case "store-to-warehouse":
        return "🏢"
      case "store-to-store":
        return "🔄"
      default:
        return "📦"
    }
  }

  const handleStatusUpdate = (transferId: string, newStatus: "in-transit" | "completed" | "cancelled") => {
    updateTransferStatus(transferId, newStatus)
  }

  const statusCounts = {
    pending: transfers.filter((t) => t.status === "pending").length,
    "in-transit": transfers.filter((t) => t.status === "in-transit").length,
    completed: transfers.filter((t) => t.status === "completed").length,
    cancelled: transfers.filter((t) => t.status === "cancelled").length,
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Truck className="w-5 h-5" />
            <span>Stock Transfer Management</span>
          </DialogTitle>
          <DialogDescription>Monitor and manage all stock transfers between locations</DialogDescription>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{statusCounts.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">In Transit</p>
                  <p className="text-2xl font-bold">{statusCounts["in-transit"]}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{statusCounts.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Cancelled</p>
                  <p className="text-2xl font-bold">{statusCounts.cancelled}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-4 mb-6">
          <span className="text-sm font-medium">Filter by status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Transfers</option>
            <option value="pending">Pending</option>
            <option value="in-transit">In Transit</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Transfers List */}
        <div className="space-y-4">
          {filteredTransfers.map((transfer) => (
            <Card key={transfer.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(transfer.status)}
                    <div>
                      <CardTitle className="text-lg">{transfer.id}</CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center space-x-1">
                        <span>{getTransferTypeIcon(transfer.transferType)}</span>
                        <span>{transfer.transferType.replace("-", " to ").toUpperCase()}</span>
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(transfer.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Route</span>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">{transfer.fromLocation}</span>
                      <span className="mx-2">→</span>
                      <span className="font-medium">{transfer.toLocation}</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Item Details</span>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">{transfer.itemName}</span>
                      <br />
                      <span className="text-muted-foreground">{transfer.quantity} cases</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Personnel</span>
                    </div>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Requested by:</span>
                      <br />
                      <span className="font-medium">{transfer.requestedBy}</span>
                      {transfer.approvedBy && (
                        <>
                          <br />
                          <span className="text-muted-foreground">Approved by:</span>
                          <br />
                          <span className="font-medium">{transfer.approvedBy}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Timeline</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-muted-foreground">Created:</span>{" "}
                        {new Date(transfer.createdAt).toLocaleString()}
                      </p>
                      {transfer.completedAt && (
                        <p>
                          <span className="text-muted-foreground">Completed:</span>{" "}
                          {new Date(transfer.completedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {transfer.notes && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Notes</span>
                      <p className="text-sm text-muted-foreground">{transfer.notes}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {transfer.status === "pending" && (
                  <div className="flex space-x-2 pt-4 border-t">
                    <Button size="sm" onClick={() => handleStatusUpdate(transfer.id, "in-transit")}>
                      Approve & Start Transfer
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(transfer.id, "cancelled")}>
                      Cancel Transfer
                    </Button>
                  </div>
                )}
                {transfer.status === "in-transit" && (
                  <div className="flex space-x-2 pt-4 border-t">
                    <Button size="sm" onClick={() => handleStatusUpdate(transfer.id, "completed")}>
                      Mark as Completed
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(transfer.id, "cancelled")}>
                      Cancel Transfer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTransfers.length === 0 && (
          <div className="text-center py-8">
            <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No transfers found for the selected filter.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
