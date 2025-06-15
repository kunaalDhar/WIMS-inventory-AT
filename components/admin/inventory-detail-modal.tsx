"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useInventory } from "@/contexts/inventory-context"
import { Package, Plus, Minus, AlertTriangle, TrendingUp, Search, Filter } from "lucide-react"

interface InventoryDetailModalProps {
  isOpen: boolean
  onClose: () => void
}

export function InventoryDetailModal({ isOpen, onClose }: InventoryDetailModalProps) {
  const { inventory, updateStock } = useInventory()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [adjustmentQuantity, setAdjustmentQuantity] = useState("")
  const [adjustmentReason, setAdjustmentReason] = useState("")

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || item.status === filterStatus
    return matchesSearch && matchesFilter
  })

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

  const handleStockAdjustment = (type: "in" | "out") => {
    if (!selectedItem || !adjustmentQuantity || !adjustmentReason) return

    const quantity = Number.parseInt(adjustmentQuantity)
    if (isNaN(quantity) || quantity <= 0) return

    updateStock(selectedItem, quantity, adjustmentReason, type)
    setSelectedItem(null)
    setAdjustmentQuantity("")
    setAdjustmentReason("")
  }

  const totalValue = filteredInventory.reduce((sum, item) => sum + item.totalValue, 0)
  const lowStockCount = filteredInventory.filter((item) => item.status === "low-stock").length
  const outOfStockCount = filteredInventory.filter((item) => item.status === "out-of-stock").length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Inventory Management</span>
          </DialogTitle>
          <DialogDescription>
            Complete inventory overview with real-time stock levels and management tools
          </DialogDescription>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{filteredInventory.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold">{lowStockCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Out of Stock</p>
                  <p className="text-2xl font-bold">{outOfStockCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex space-x-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="overstocked">Overstocked</option>
            </select>
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInventory.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  {getStatusBadge(item.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.category} • {item.volume}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Current Stock</p>
                    <p className="font-semibold">{item.currentStock} cases</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Min Stock</p>
                    <p className="font-semibold">{item.minStock} cases</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-semibold">{item.location}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Value</p>
                    <p className="font-semibold">{formatCurrency(item.totalValue)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Stock Level</span>
                    <span>{Math.round((item.currentStock / item.maxStock) * 100)}%</span>
                  </div>
                  <Progress value={Math.min((item.currentStock / item.maxStock) * 100, 100)} className="h-2" />
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedItem(item.id)} className="flex-1">
                    <Plus className="w-4 h-4 mr-1" />
                    Adjust
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>Supplier: {item.supplier}</p>
                  <p>Last Updated: {new Date(item.lastUpdated).toLocaleString()}</p>
                  {item.expiryDate && <p>Expires: {new Date(item.expiryDate).toLocaleDateString()}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stock Adjustment Modal */}
        {selectedItem && (
          <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adjust Stock</DialogTitle>
                <DialogDescription>
                  Adjust stock levels for {inventory.find((item) => item.id === selectedItem)?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={adjustmentQuantity}
                    onChange={(e) => setAdjustmentQuantity(e.target.value)}
                    placeholder="Enter quantity"
                  />
                </div>
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    placeholder="Enter reason for adjustment"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleStockAdjustment("in")}
                    className="flex-1"
                    disabled={!adjustmentQuantity || !adjustmentReason}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Stock
                  </Button>
                  <Button
                    onClick={() => handleStockAdjustment("out")}
                    variant="outline"
                    className="flex-1"
                    disabled={!adjustmentQuantity || !adjustmentReason}
                  >
                    <Minus className="w-4 h-4 mr-2" />
                    Remove Stock
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  )
}
