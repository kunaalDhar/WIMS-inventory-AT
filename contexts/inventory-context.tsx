"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface InventoryItem {
  id: string
  name: string
  category: string
  volume: string
  currentStock: number
  status: "in-stock" | "low-stock" | "out-of-stock" | "overstocked"
  unitCost: number
  totalValue: number
  lastOrderDate?: string
  expiryDate?: string
  minPrice?: number
  maxPrice?: number
  minStock: number
  maxStock: number
  location: string
  bottlesPerCase: number
  supplier: string
  reorderPoint: number
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
  isDataLoaded: boolean
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
  clearInventoryData: () => void
  updateItemPrice: (itemId: string, newPrice: number) => void
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

// Storage keys for inventory data
const INVENTORY_STORAGE_KEYS = {
  INVENTORY: "wims-inventory-v2",
  TRANSFERS: "wims-transfers-v2",
  MOVEMENTS: "wims-movements-v2",
  ALERTS: "wims-alerts-v2",
  LAST_SYNC: "wims-inventory-last-sync-v2",
} as const

// Utility functions for safe localStorage operations
const safeGet = (key: string, defaultValue: any = []) => {
  try {
    if (typeof window === "undefined") return defaultValue
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading inventory data from localStorage key "${key}":`, error)
    return defaultValue
  }
}

const safeSet = (key: string, value: any) => {
  try {
    if (typeof window === "undefined") return
    localStorage.setItem(key, JSON.stringify(value))
    localStorage.setItem(INVENTORY_STORAGE_KEYS.LAST_SYNC, new Date().toISOString())
  } catch (error) {
    console.error(`Error writing inventory data to localStorage key "${key}":`, error)
  }
}

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [transfers, setTransfers] = useState<StockTransfer[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  // Initialize data from localStorage on mount
  useEffect(() => {
    const initializeInventoryData = () => {
      try {
        console.log("🔄 Initializing inventory data from localStorage...")

        // Only use empty array as fallback, not demo items
        let savedInventory = safeGet(INVENTORY_STORAGE_KEYS.INVENTORY, [])
        // Ensure unitCost is always a number
        if (Array.isArray(savedInventory)) {
          savedInventory = savedInventory.map(item => ({
            ...item,
            unitCost: Number(item.unitCost) || 0
          }))
        }
        const savedTransfers = safeGet(INVENTORY_STORAGE_KEYS.TRANSFERS, [])
        const savedMovements = safeGet(INVENTORY_STORAGE_KEYS.MOVEMENTS, [])
        const savedAlerts = safeGet(INVENTORY_STORAGE_KEYS.ALERTS, [])

        setInventory(Array.isArray(savedInventory) ? savedInventory : [])
        setTransfers(Array.isArray(savedTransfers) ? savedTransfers : [])
        setMovements(Array.isArray(savedMovements) ? savedMovements : [])
        setAlerts(Array.isArray(savedAlerts) ? savedAlerts : [])

        console.log(`✅ Loaded inventory data:`)
        console.log(`  - ${savedInventory.length} inventory items`)
        console.log(`  - ${savedTransfers.length} transfers`)
        console.log(`  - ${savedMovements.length} movements`)
        console.log(`  - ${savedAlerts.length} alerts`)

        setIsDataLoaded(true)
      } catch (error) {
        console.error("❌ Error initializing inventory data:", error)
        // Fallback to empty data
        setInventory([])
        setIsDataLoaded(true)
      }
    }

    const timer = setTimeout(initializeInventoryData, 100)
    return () => clearTimeout(timer)
  }, [])

  // Auto-save inventory data to localStorage
  useEffect(() => {
    if (isDataLoaded) {
      console.log("💾 Auto-saving inventory to localStorage")
      safeSet(INVENTORY_STORAGE_KEYS.INVENTORY, inventory)
    }
  }, [inventory, isDataLoaded])

  useEffect(() => {
    if (isDataLoaded) {
      safeSet(INVENTORY_STORAGE_KEYS.TRANSFERS, transfers)
    }
  }, [transfers, isDataLoaded])

  useEffect(() => {
    if (isDataLoaded) {
      safeSet(INVENTORY_STORAGE_KEYS.MOVEMENTS, movements)
    }
  }, [movements, isDataLoaded])

  useEffect(() => {
    if (isDataLoaded) {
      safeSet(INVENTORY_STORAGE_KEYS.ALERTS, alerts)
    }
  }, [alerts, isDataLoaded])

  // Update stock status based on current stock levels
  useEffect(() => {
    if (isDataLoaded) {
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
    }
  }, [isDataLoaded])

  const updateStock = (itemId: string, quantity: number, reason: string, type: "in" | "out") => {
    console.log(`📦 Updating stock for item ${itemId}: ${type} ${quantity} units`)

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
    console.log("🚚 Creating new transfer:", newTransfer.id)
    setTransfers((prev) => [newTransfer, ...prev])
  }

  const updateTransferStatus = (transferId: string, status: StockTransfer["status"], notes?: string) => {
    console.log(`📝 Updating transfer ${transferId} status to ${status}`)

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
    console.log("✅ Acknowledging alert:", alertId)
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
    console.log("🔄 Manually refreshing inventory data...")
    const savedInventory = safeGet(INVENTORY_STORAGE_KEYS.INVENTORY, [])
    const savedTransfers = safeGet(INVENTORY_STORAGE_KEYS.TRANSFERS, [])
    const savedMovements = safeGet(INVENTORY_STORAGE_KEYS.MOVEMENTS, [])
    const savedAlerts = safeGet(INVENTORY_STORAGE_KEYS.ALERTS, [])

    setInventory(savedInventory)
    setTransfers(savedTransfers)
    setMovements(savedMovements)
    setAlerts(savedAlerts)
  }

  const clearInventoryData = () => {
    console.log("🗑️ Clearing all inventory data...")
    setInventory([])
    setTransfers([])
    setMovements([])
    setAlerts([])

    // Clear localStorage
    Object.values(INVENTORY_STORAGE_KEYS).forEach((key) => {
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.error(`Error clearing inventory localStorage key "${key}":`, error)
      }
    })
  }

  const updateItemPrice = (itemId: string, newPrice: number) => {
    console.log('[updateItemPrice] Updating', itemId, 'to price', newPrice);
    setInventory((prev) => {
      const updated = prev.map((item) =>
        item.id === itemId ? { ...item, unitCost: newPrice } : item
      );
      console.log('[updateItemPrice] Updated inventory:', updated);
      return updated;
    });
  };

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        transfers,
        movements,
        alerts,
        isDataLoaded,
        updateStock,
        createTransfer,
        updateTransferStatus,
        acknowledgeAlert,
        getInventorySummary,
        refreshInventory,
        clearInventoryData,
        updateItemPrice,
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
