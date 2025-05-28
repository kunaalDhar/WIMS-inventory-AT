"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface OrderItem {
  id: string
  name: string
  category: string
  volume: string
  bottlesPerCase: number
  requestedQuantity: number
  unit: string
  description?: string
  salesmanPrice?: number
  adminPrice?: number
  finalPrice?: number
}

interface Vendor {
  id: string
  name: string
  email: string
  phone: string
  address: string
  contactPerson: string
  createdAt: string
  createdBy: string
}

interface Order {
  id: string
  salesmanId: string
  salesmanName: string
  vendorId: string
  vendorName: string
  items: OrderItem[]
  status: "pending" | "admin_priced" | "salesman_adjusted" | "approved" | "rejected" | "completed"
  totalItems: number
  notes: string
  createdAt: string
  adminPricedAt?: string
  salesmanAdjustedAt?: string
  approvedAt?: string
  adminNotes?: string
  salesmanAdjustmentNotes?: string
  allowPriceAdjustment?: boolean
  priceAdjustmentRange?: { min: number; max: number }
  salesmanPricing?: {
    subtotal: number
    total: number
    itemPrices: Record<string, number>
  }
  adminPricing?: {
    subtotal: number
    tax: number
    total: number
    itemPrices: Record<string, number>
  }
  finalPricing?: {
    subtotal: number
    tax: number
    total: number
    itemPrices: Record<string, number>
    adjustments: Record<string, number>
  }
}

interface OrderContextType {
  orders: Order[]
  vendors: Vendor[]
  availableItems: OrderItem[]
  addOrder: (order: Omit<Order, "id" | "createdAt">) => void
  addVendor: (vendor: Omit<Vendor, "id" | "createdAt">) => void
  setAdminPricing: (
    orderId: string,
    pricing: Order["adminPricing"],
    adminNotes?: string,
    allowAdjustment?: boolean,
  ) => void
  setSalesmanAdjustment: (orderId: string, adjustments: Record<string, number>, notes?: string) => void
  updateOrderStatus: (orderId: string, status: Order["status"]) => void
  approveOrder: (orderId: string) => void
  rejectOrder: (orderId: string, reason: string) => void
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [availableItems] = useState<OrderItem[]>([
    {
      id: "1",
      name: "Litchi",
      category: "Fruit Juice",
      volume: "160 ml",
      bottlesPerCase: 40,
      requestedQuantity: 0,
      unit: "cases",
      description: "Litchi flavored juice - 160ml bottles, 40 bottles per case",
    },
    {
      id: "2",
      name: "Mango",
      category: "Fruit Juice",
      volume: "160 ml",
      bottlesPerCase: 40,
      requestedQuantity: 0,
      unit: "cases",
      description: "Mango flavored juice - 160ml bottles, 40 bottles per case",
    },
    {
      id: "3",
      name: "Guava",
      category: "Fruit Juice",
      volume: "160 ml",
      bottlesPerCase: 40,
      requestedQuantity: 0,
      unit: "cases",
      description: "Guava flavored juice - 160ml bottles, 40 bottles per case",
    },
    {
      id: "4",
      name: "Mix Fruit",
      category: "Fruit Juice",
      volume: "160 ml",
      bottlesPerCase: 40,
      requestedQuantity: 0,
      unit: "cases",
      description: "Mixed fruit flavored juice - 160ml bottles, 40 bottles per case",
    },
    {
      id: "5",
      name: "Orange",
      category: "Fruit Juice",
      volume: "160 ml",
      bottlesPerCase: 40,
      requestedQuantity: 0,
      unit: "cases",
      description: "Orange flavored juice - 160ml bottles, 40 bottles per case",
    },
  ])

  // Load data from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem("wims-orders")
    const savedVendors = localStorage.getItem("wims-vendors")

    if (savedOrders) {
      setOrders(JSON.parse(savedOrders))
    }
    if (savedVendors) {
      setVendors(JSON.parse(savedVendors))
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("wims-orders", JSON.stringify(orders))
  }, [orders])

  useEffect(() => {
    localStorage.setItem("wims-vendors", JSON.stringify(vendors))
  }, [vendors])

  const addOrder = (orderData: Omit<Order, "id" | "createdAt">) => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "pending", // Always start as pending
    }
    setOrders((prev) => [...prev, newOrder])
  }

  const addVendor = (vendorData: Omit<Vendor, "id" | "createdAt">) => {
    const newVendor: Vendor = {
      ...vendorData,
      id: `VEN-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setVendors((prev) => [...prev, newVendor])
  }

  const setAdminPricing = (
    orderId: string,
    pricing: Order["adminPricing"],
    adminNotes?: string,
    allowAdjustment?: boolean,
  ) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              adminPricing: pricing,
              adminNotes,
              allowPriceAdjustment: allowAdjustment || false,
              priceAdjustmentRange: allowAdjustment ? { min: 10, max: 15 } : undefined,
              status: "admin_priced" as const,
              adminPricedAt: new Date().toISOString(),
              // Update items with admin prices
              items: order.items.map((item) => ({
                ...item,
                adminPrice: pricing?.itemPrices?.[item.id] || 0,
                finalPrice: pricing?.itemPrices?.[item.id] || 0,
              })),
            }
          : order,
      ),
    )
  }

  const setSalesmanAdjustment = (orderId: string, adjustments: Record<string, number>, notes?: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId || !order.allowPriceAdjustment || !order.adminPricing) {
          return order
        }

        // Calculate new pricing with adjustments
        const adjustedItemPrices: Record<string, number> = {}
        let adjustedSubtotal = 0

        order.items.forEach((item) => {
          const adminPrice = order.adminPricing!.itemPrices[item.id] || 0
          const adjustment = adjustments[item.id] || 0
          const finalPrice = adminPrice + adjustment
          adjustedItemPrices[item.id] = finalPrice
          adjustedSubtotal += finalPrice * item.requestedQuantity
        })

        const adjustedTax = adjustedSubtotal * 0.1
        const adjustedTotal = adjustedSubtotal + adjustedTax

        const finalPricing = {
          subtotal: adjustedSubtotal,
          tax: adjustedTax,
          total: adjustedTotal,
          itemPrices: adjustedItemPrices,
          adjustments,
        }

        return {
          ...order,
          finalPricing,
          salesmanAdjustmentNotes: notes,
          status: "salesman_adjusted" as const,
          salesmanAdjustedAt: new Date().toISOString(),
          // Update items with final prices
          items: order.items.map((item) => ({
            ...item,
            finalPrice: adjustedItemPrices[item.id],
          })),
        }
      }),
    )
  }

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)))
  }

  const approveOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "approved" as const,
              approvedAt: new Date().toISOString(),
            }
          : order,
      ),
    )
  }

  const rejectOrder = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "rejected" as const,
              adminNotes: reason,
            }
          : order,
      ),
    )
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        vendors,
        availableItems,
        addOrder,
        addVendor,
        setAdminPricing,
        setSalesmanAdjustment,
        updateOrderStatus,
        approveOrder,
        rejectOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider")
  }
  return context
}
