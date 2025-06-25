"use client"

import React, { createContext, useContext, useState } from "react"
import { useAuth } from "./auth-context"

interface AdminPermissionRequest {
  id: string
  salesmanId: string
  salesmanName: string
  requestType: "login" | "order_edit" | "price_adjustment"
  status: "pending" | "approved" | "rejected"
  timestamp: string
  notes?: string
}

interface AdminPermissionContextType {
  permissionRequests: AdminPermissionRequest[]
  requestAdminPermission: (
    requestType: AdminPermissionRequest["requestType"],
    notes?: string
  ) => Promise<{ success: boolean; message: string }>
  approveRequest: (requestId: string) => void
  rejectRequest: (requestId: string) => void
  getPendingRequests: () => AdminPermissionRequest[]
  getRequestStatus: (salesmanId: string, requestType: AdminPermissionRequest["requestType"]) => AdminPermissionRequest | null
}

const AdminPermissionContext = createContext<AdminPermissionContextType | null>(null)

export function AdminPermissionProvider({ children }: { children: React.ReactNode }) {
  const { user, users, setUsers } = useAuth()
  const [permissionRequests, setPermissionRequests] = useState<AdminPermissionRequest[]>([])

  const requestAdminPermission = async (
    requestType: AdminPermissionRequest["requestType"],
    notes?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: "You must be logged in to request admin permission" }
    }

    // Check if there's already a pending request
    const existingRequest = permissionRequests.find(
      (req) =>
        req.salesmanId === user.id &&
        req.requestType === requestType &&
        (req.status === "pending" || req.status === "approved")
    )

    if (existingRequest) {
      if (existingRequest.status === "approved") {
        return { success: true, message: "Permission already granted" }
      }
      return { success: false, message: "You already have a pending request" }
    }

    // Create new request
    const newRequest: AdminPermissionRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      salesmanId: user.id,
      salesmanName: user.name,
      requestType,
      status: "pending",
      timestamp: new Date().toISOString(),
      notes,
    }

    setPermissionRequests((prev) => [...prev, newRequest])
    return { success: true, message: "Permission request sent to admin" }
  }

  const approveRequest = (requestId: string) => {
    setPermissionRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          // If this is a login approval, set the salesman as approved
          if (req.requestType === "login") {
            setUsers(
              users.map((u) =>
                u.id === req.salesmanId ? { ...u, isApproved: true } : u
              )
            )
          }
          return { ...req, status: "approved" }
        }
        return req
      })
    )
  }

  const rejectRequest = (requestId: string) => {
    setPermissionRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: "rejected" } : req))
    )
  }

  const getPendingRequests = () => {
    return permissionRequests.filter((req) => req.status === "pending")
  }

  const getRequestStatus = (salesmanId: string, requestType: AdminPermissionRequest["requestType"]) => {
    return (
      permissionRequests.find(
        (req) =>
          req.salesmanId === salesmanId &&
          req.requestType === requestType &&
          (req.status === "pending" || req.status === "approved")
      ) || null
    )
  }

  const value = {
    permissionRequests,
    requestAdminPermission,
    approveRequest,
    rejectRequest,
    getPendingRequests,
    getRequestStatus,
  }

  return <AdminPermissionContext.Provider value={value}>{children}</AdminPermissionContext.Provider>
}

export const useAdminPermission = () => {
  const context = useContext(AdminPermissionContext)
  if (!context) {
    throw new Error("useAdminPermission must be used within an AdminPermissionProvider")
  }
  return context
} 