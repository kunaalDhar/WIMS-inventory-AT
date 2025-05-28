"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface InventoryItem {
  id: string
  name: string
  category: string
  volume: string
  bottlesPerCase: number
  currentStock: number
  minStock: number
  maxStock: number
  status: "in-stock" | "low-stock" | "out-of-stock" | "overstocked"
  lastUpdated: string
  location: string
  supplier: string
  unitCost: number
  totalValue: number
  reorderPoint: number
  lastOrderDate?: string
  expiryDate?: string
}

interface StockTransfer {
  id: string
  itemId: string
  itemName: string
  fromLocation: string
  toLocation: string
  quantity: number
  status: "pending" | "in-transit" | "completed" | "cancelled"
  requestedBy: string
  approvedBy?: string
  createdAt: string
  completedAt?: string
  notes?: string
  transferType: "warehouse-to-store" | "store-to-warehouse" | "store-to-store"
}

interface StockMovement {
  id: string
  itemId: string
  itemName: string
  type: "in" | "out" | "transfer" | "adjustment"
  quantity: number
  reason: string
  location: string
  performedBy: string
  timestamp: string
  orderId?: string
  transferId?: string
}

interface InventoryAlert {
  id: string
  type: "low-stock" | "out-of-stock" | "expiry-warning" | "overstock"
  itemId: string
  itemName: string
  message: string
  severity: "low" | "medium" | "high" | "critical"
  createdAt: string
  acknowledged: boolean
}

interface InventoryContextType {
  inventory: InventoryItem[]
  transfers: StockTransfer[]
  movements: StockMovement[]
  alerts: InventoryAlert[]
  updateStock: (itemId: string, quantity: number, reason: string, type: "in" | "out") => void
  createTransfer: (transfer: Omit<StockTransfer, "id" | "createdAt">) => void
  updateTransferStatus: (transferId: string, status: StockTransfer["status"], notes?: string) => void
  acknowledgeAlert: (alertId: string) => void
  getInventorySummary: () => {
    totalItems: number
    totalValue: number
    lowStockItems: number
    outOfStockItems: number
    inStockItems: number
    pendingTransfers: number
  }
  refreshInventory: () => void
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: "1",
      name: "Litchi",
      category: "Fruit Juice",
      volume: "160 ml",
      bottlesPerCase: 40,
      currentStock: 45,
      minStock: 10,
      maxStock: 100,
      status: "in-stock",
      lastUpdated: new Date().toISOString(),
      location: "Warehouse A",
      supplier: "Fresh Fruits Ltd",
      unitCost: 320,
      totalValue: 14400,
      reorderPoint: 15,
      lastOrderDate: "2024-01-10",
      expiryDate: "2024-06-15",
    },
    {
      id: "2",
      name: "Mango",
      category: "Fruit Juice",
      volume: "160 ml",
      bottlesPerCase: 40,
      currentStock: 8,
      minStock: 15,
      maxStock: 100,
      status: "low-stock",
      lastUpdated: new Date().toISOString(),
      location: "Warehouse A",
      supplier: "Tropical Beverages",
      unitCost: 340,
      totalValue: 2720,
      reorderPoint: 20,
      lastOrderDate: "2024-01-08",
      expiryDate: "2024-07-20",
    },
    {
      id: "3",
      name: "Guava",
      category: "Fruit Juice",
      volume: "160 ml",
      bottlesPerCase: 40,
      currentStock: 0,
      minStock: 20,
      maxStock: 100,
      status: "out-of-stock",
      lastUpdated: new Date().toISOString(),
      location: "Warehouse A",
      supplier: "Natural Drinks Co",
      unitCost: 330,
      totalValue: 0,
      reorderPoint: 25,
      lastOrderDate: "2024-01-05",
      expiryDate: "2024-08-10",
    },
    {
      id: "4",
      name: "Mix Fruit",
      category: "Fruit Juice",
      volume: "160 ml",
      bottlesPerCase: 40,
      currentStock: 32,
      minStock: 8,
      maxStock: 80,
      status: "in-stock",
      lastUpdated: new Date().toISOString(),
      location: "Warehouse B",
      supplier: "Premium Juices",
      unitCost: 350,
      totalValue: 11200,
      reorderPoint: 12,
      lastOrderDate: "2024-01-12",
      expiryDate: "2024-09-05",
    },
    {
      id: "5",
      name: "Orange",
      category: "Fruit Juice",
      volume: "160 ml",
      bottlesPerCase: 40,
      currentStock: 25,
      minStock: 10,
      maxStock: 90,
      status: "in-stock",
      lastUpdated: new Date().toISOString(),
      location: "Warehouse A",
      supplier: "Citrus Fresh Ltd",
      unitCost: 335,
      totalValue: 8375,
      reorderPoint: 15,
      lastOrderDate: "2024-01-14",
      expiryDate: "2024-05-30",
    },
  ])

  const [transfers, setTransfers] = useState<StockTransfer[]>([
    {
      id: "T001",
      itemId: "1",
      itemName: "Litchi",
      fromLocation: "Warehouse A",
      toLocation: "Store B",
      quantity: 5,
      status: "completed",
      requestedBy: "John Doe",
      approvedBy: "Admin",
      createdAt: "2024-01-15T10:00:00Z",
      completedAt: "2024-01-15T14:30:00Z",
      transferType: "warehouse-to-store",
      notes: "Regular stock replenishment",
    },
    {
      id: "T002",
      itemId: "4",
      itemName: "Mix Fruit",
      fromLocation: "Store C",
      toLocation: "Warehouse A",
      quantity: 10,
      status: "in-transit",
      requestedBy: "Jane Smith",
      createdAt: "2024-01-14T09:15:00Z",
      transferType: "store-to-warehouse",
      notes: "Return excess stock",
    },
    {
      id: "T003",
      itemId: "5",
      itemName: "Orange",
      fromLocation: "Warehouse A",
      toLocation: "Store D",
      quantity: 8,
      status: "pending",
      requestedBy: "Mike Johnson",
      createdAt: "2024-01-13T16:45:00Z",
      transferType: "warehouse-to-store",
      notes: "Urgent store requirement",
    },
  ])

  const [movements, setMovements] = useState<StockMovement[]>([
    {
      id: "M001",
      itemId: "1",
      itemName: "Litchi",
      type: "out",
      quantity: 5,
      reason: "Transfer to Store B",
      location: "Warehouse A",
      performedBy: "Admin",
      timestamp: "2024-01-15T14:30:00Z",
      transferId: "T001",
    },
    {
      id: "M002",
      itemId: "2",
      itemName: "Mango",
      type: "out",
      quantity: 7,
      reason: "Customer Order",
      location: "Warehouse A",
      performedBy: "System",
      timestamp: "2024-01-14T11:20:00Z",
      orderId: "ORD-123",
    },
  ])

  const [alerts, setAlerts] = useState<InventoryAlert[]>([
    {
      id: "A001",
      type: "low-stock",
      itemId: "2",
      itemName: "Mango",
      message: "Mango stock is below minimum threshold (8/15)",
      severity: "medium",
      createdAt: new Date().toISOString(),
      acknowledged: false,
    },
    {
      id: "A002",
      type: "out-of-stock",
      itemId: "3",
      itemName: "Guava",
      message: "Guava is completely out of stock",
      severity: "critical",
      createdAt: new Date().toISOString(),
      acknowledged: false,
    },
    {
      id: "A003",
      type: "expiry-warning",
      itemId: "5",
      itemName: "Orange",
      message: "Orange stock expires in 30 days",
      severity: "low",
      createdAt: new Date().toISOString(),
      acknowledged: false,
    },
  ])

  // Load data from localStorage on mount
  useEffect(() => {
    const savedInventory = localStorage.getItem("wims-inventory")
    const savedTransfers = localStorage.getItem("wims-transfers")
    const savedMovements = localStorage.getItem("wims-movements")
    const savedAlerts = localStorage.getItem("wims-alerts")

    if (savedInventory) setInventory(JSON.parse(savedInventory))
    if (savedTransfers) setTransfers(JSON.parse(savedTransfers))
    if (savedMovements) setMovements(JSON.parse(savedMovements))
    if (savedAlerts) setAlerts(JSON.parse(savedAlerts))
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("wims-inventory", JSON.stringify(inventory))
  }, [inventory])

  useEffect(() => {
    localStorage.setItem("wims-transfers", JSON.stringify(transfers))
  }, [transfers])

  useEffect(() => {
    localStorage.setItem("wims-movements", JSON.stringify(movements))
  }, [movements])

  useEffect(() => {
    localStorage.setItem("wims-alerts", JSON.stringify(alerts))
  }, [alerts])

  // Update stock status based on current stock levels
  useEffect(() => {
    setInventory((prev) =>
      prev.map((item) => {
        let status: InventoryItem["status"] = "in-stock"
        if (item.currentStock === 0) {
          status = "out-of-stock"
        } else if (item.currentStock <= item.minStock) {
          status = "low-stock"
        } else if (item.currentStock >= item.maxStock) {
          status = "overstocked"
        }

        return {
          ...item,
          status,
          totalValue: item.currentStock * item.unitCost,
          lastUpdated: new Date().toISOString(),
        }
      }),
    )
  }, [])

  const updateStock = (itemId: string, quantity: number, reason: string, type: "in" | "out") => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newStock = type === "in" ? item.currentStock + quantity : item.currentStock - quantity
          return {
            ...item,
            currentStock: Math.max(0, newStock),
            lastUpdated: new Date().toISOString(),
          }
        }
        return item
      }),
    )

    // Add movement record
    const movement: StockMovement = {
      id: `M${Date.now()}`,
      itemId,
      itemName: inventory.find((item) => item.id === itemId)?.name || "",
      type,
      quantity,
      reason,
      location: inventory.find((item) => item.id === itemId)?.location || "",
      performedBy: "Admin",
      timestamp: new Date().toISOString(),
    }
    setMovements((prev) => [movement, ...prev])
  }

  const createTransfer = (transferData: Omit<StockTransfer, "id" | "createdAt">) => {
    const newTransfer: StockTransfer = {
      ...transferData,
      id: `T${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setTransfers((prev) => [newTransfer, ...prev])
  }

  const updateTransferStatus = (transferId: string, status: StockTransfer["status"], notes?: string) => {
    setTransfers((prev) =>
      prev.map((transfer) => {
        if (transfer.id === transferId) {
          const updatedTransfer = {
            ...transfer,
            status,
            notes: notes || transfer.notes,
          }

          if (status === "completed") {
            updatedTransfer.completedAt = new Date().toISOString()
            updatedTransfer.approvedBy = "Admin"

            // Update inventory based on transfer
            if (transfer.transferType === "warehouse-to-store") {
              updateStock(transfer.itemId, transfer.quantity, `Transfer to ${transfer.toLocation}`, "out")
            }
          }

          return updatedTransfer
        }
        return transfer
      }),
    )
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert)))
  }

  const getInventorySummary = () => {
    const totalItems = inventory.reduce((sum, item) => sum + item.currentStock, 0)
    const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0)
    const lowStockItems = inventory.filter((item) => item.status === "low-stock").length
    const outOfStockItems = inventory.filter((item) => item.status === "out-of-stock").length
    const inStockItems = inventory.filter((item) => item.status === "in-stock").length
    const pendingTransfers = transfers.filter((transfer) => transfer.status === "pending").length

    return {
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      inStockItems,
      pendingTransfers,
    }
  }

  const refreshInventory = () => {
    // Force refresh of inventory data
    setInventory((prev) => [...prev])
  }

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        transfers,
        movements,
        alerts,
        updateStock,
        createTransfer,
        updateTransferStatus,
        acknowledgeAlert,
        getInventorySummary,
        refreshInventory,
      }}
    >
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider")
  }
  return context
}
