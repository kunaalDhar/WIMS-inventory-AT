"use client"

import { useAdminPermission } from "@/contexts/admin-permission-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, X, Clock, Shield } from "lucide-react"

export function PermissionRequestsPanel() {
  const { permissionRequests, approveRequest, rejectRequest } = useAdminPermission()

  const pendingRequests = permissionRequests.filter((req) => req.status === "pending")

  if (pendingRequests.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <span>Permission Requests</span>
          </h2>
        </div>
        <Alert className="mt-4">
          <AlertDescription>No pending permission requests.</AlertDescription>
        </Alert>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center space-x-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          <span>Permission Requests</span>
        </h2>
        <Badge variant="secondary" className="text-xs">
          {pendingRequests.length} Pending
        </Badge>
      </div>

      <div className="space-y-4">
        {pendingRequests.map((request) => (
          <div
            key={request.id}
            className="border rounded-lg p-4 bg-white shadow-sm flex items-center justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{request.salesmanName}</span>
                <Badge variant="outline" className="text-xs">
                  {request.requestType.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
              {request.notes && <p className="text-sm text-gray-600">{request.notes}</p>}
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{new Date(request.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50"
                onClick={() => approveRequest(request.id)}
              >
                <Check className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => rejectRequest(request.id)}
              >
                <X className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}