"use client"

import { useState } from "react"
import { useOrders } from "@/contexts/order-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DollarSign, Edit, Save, Search, Package, Clock, CheckCircle, AlertTriangle } from "lucide-react"

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

export function OrderPricingPanel() {
  const { orders, setAdminPricing, approveOrder, rejectOrder } = useOrders()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [itemPrices, setItemPrices] = useState<Record<string, number>>({})
  const [adminNotes, setAdminNotes] = useState("")
  const [allowPriceAdjustment, setAllowPriceAdjustment] = useState(false)

  const handleEditOrder = (order: Order) => {
    setSelectedOrder({ ...order })

    // Initialize item prices with salesman prices or existing admin prices
    const prices: Record<string, number> = {}
    order.items.forEach((item) => {
      prices[item.id] = order.adminPricing?.itemPrices?.[item.id] || item.salesmanPrice || 0
    })
    setItemPrices(prices)
    setAdminNotes(order.adminNotes || "")
    setAllowPriceAdjustment(order.allowPriceAdjustment || false)
    setIsEditDialogOpen(true)
  }

  const handleUpdateItemPrice = (itemId: string, price: number) => {
    setItemPrices((prev) => ({
      ...prev,
      [itemId]: price,
    }))
  }

  const calculateTotals = () => {
    if (!selectedOrder) return { subtotal: 0, tax: 0, total: 0 }

    const subtotal = selectedOrder.items.reduce((sum, item) => {
      const price = itemPrices[item.id] || 0
      return sum + price * item.requestedQuantity
    }, 0)

    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + tax

    return { subtotal, tax, total }
  }

  const handleSaveAdminPricing = () => {
    if (!selectedOrder) return

    const { subtotal, tax, total } = calculateTotals()

    const pricing = {
      subtotal,
      tax,
      total,
      itemPrices,
    }

    setAdminPricing(selectedOrder.id, pricing, adminNotes, allowPriceAdjustment)
    setIsEditDialogOpen(false)
    setSelectedOrder(null)
  }

  const handleApproveOrder = (orderId: string) => {
    approveOrder(orderId)
  }

  const handleRejectOrder = (orderId: string) => {
    const reason = prompt("Please provide a reason for rejection:")
    if (reason) {
      rejectOrder(orderId, reason)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      admin_priced: "default",
      salesman_adjusted: "outline",
      approved: "default",
      rejected: "destructive",
      completed: "default",
    } as const

    const labels = {
      pending: "PENDING PRICING",
      admin_priced: "ADMIN PRICED",
      salesman_adjusted: "SALESMAN ADJUSTED",
      approved: "APPROVED",
      rejected: "REJECTED",
      completed: "COMPLETED",
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {labels[status as keyof typeof labels] || status.toUpperCase()}
      </Badge>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "admin_priced":
        return <DollarSign className="w-4 h-4 text-blue-600" />
      case "salesman_adjusted":
        return <Edit className="w-4 h-4 text-purple-600" />
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "rejected":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <Package className="w-4 h-4 text-gray-600" />
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.salesmanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendorName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const pendingOrders = filteredOrders.filter((order) => order.status === "pending")
  const adminPricedOrders = filteredOrders.filter((order) => order.status === "admin_priced")
  const adjustedOrders = filteredOrders.filter((order) => order.status === "salesman_adjusted")

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order Pricing Management</h1>
          <p className="text-muted-foreground">Set official pricing and manage salesman price adjustments</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search orders by salesman, order ID, or vendor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending Pricing</SelectItem>
                <SelectItem value="admin_priced">Admin Priced</SelectItem>
                <SelectItem value="salesman_adjusted">Salesman Adjusted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Pending Pricing</p>
                <p className="text-2xl font-bold">{pendingOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Admin Priced</p>
                <p className="text-2xl font-bold">{adminPricedOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Edit className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Salesman Adjusted</p>
                <p className="text-2xl font-bold">{adjustedOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order Pricing Management</CardTitle>
          <CardDescription>Set official pricing and manage price adjustments for fruit juice orders</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Salesman</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Adjustment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const currentPricing = order.finalPricing || order.adminPricing
                  const hasAdjustment = order.status === "salesman_adjusted"

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.salesmanName}</TableCell>
                      <TableCell>{order.vendorName}</TableCell>
                      <TableCell>{order.items.length} types</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          {getStatusBadge(order.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {currentPricing ? (
                          <span className="font-medium">₹{currentPricing.total.toFixed(2)}</span>
                        ) : (
                          <span className="text-muted-foreground">Not priced</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {hasAdjustment && (
                          <Badge variant="outline" className="text-purple-600">
                            Adjusted
                          </Badge>
                        )}
                        {order.allowPriceAdjustment && order.status === "admin_priced" && (
                          <Badge variant="outline" className="text-blue-600">
                            Allowed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {(order.status === "pending" || order.status === "salesman_adjusted") && (
                            <Button variant="ghost" size="sm" onClick={() => handleEditOrder(order)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {order.status === "admin_priced" && (
                            <Button variant="ghost" size="sm" onClick={() => handleApproveOrder(order.id)}>
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {order.status === "salesman_adjusted" && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleApproveOrder(order.id)}>
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleRejectOrder(order.id)}>
                                <AlertTriangle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Set Official Pricing - {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Set official admin pricing for order from {selectedOrder?.salesmanName} for vendor{" "}
              {selectedOrder?.vendorName}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Salesman</Label>
                  <p className="text-sm">{selectedOrder.salesmanName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Vendor</Label>
                  <p className="text-sm">{selectedOrder.vendorName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Order Date</Label>
                  <p className="text-sm">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
              </div>

              {/* Salesman Adjustment Info */}
              {selectedOrder.status === "salesman_adjusted" && selectedOrder.salesmanAdjustmentNotes && (
                <Alert>
                  <Edit className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Salesman Adjustment:</strong> {selectedOrder.salesmanAdjustmentNotes}
                  </AlertDescription>
                </Alert>
              )}

              {/* Order Notes */}
              {selectedOrder.notes && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Label className="text-sm font-medium text-blue-800">Order Notes from Salesman:</Label>
                  <p className="text-sm text-blue-700 mt-1">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Items Pricing Table */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Set Official Prices (Per Case)</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>S.No.</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Cases</TableHead>
                      <TableHead>Salesman Price</TableHead>
                      <TableHead>Official Price</TableHead>
                      <TableHead>Final Price</TableHead>
                      <TableHead>Line Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item, index) => {
                      const salesmanPrice = item.salesmanPrice || 0
                      const adminPrice = itemPrices[item.id] || 0
                      const finalPrice = item.finalPrice || adminPrice
                      const adjustment = finalPrice - adminPrice
                      const lineTotal = adminPrice * item.requestedQuantity

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.category}</p>
                            </div>
                          </TableCell>
                          <TableCell>{item.volume}</TableCell>
                          <TableCell className="font-medium">{item.requestedQuantity}</TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">₹{salesmanPrice.toFixed(2)}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <span>₹</span>
                              <Input
                                type="number"
                                step="0.01"
                                value={itemPrices[item.id] || ""}
                                onChange={(e) => handleUpdateItemPrice(item.id, Number.parseFloat(e.target.value) || 0)}
                                className="w-24"
                                placeholder="0.00"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">₹{finalPrice.toFixed(2)}</span>
                              {adjustment !== 0 && (
                                <Badge variant="outline" className={adjustment > 0 ? "text-red-600" : "text-green-600"}>
                                  {adjustment > 0 ? "+" : ""}₹{adjustment.toFixed(2)}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">₹{lineTotal.toFixed(2)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Price Adjustment Permission */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowAdjustment"
                    checked={allowPriceAdjustment}
                    onCheckedChange={setAllowPriceAdjustment}
                  />
                  <Label htmlFor="allowAdjustment" className="text-sm font-medium">
                    Allow salesman to adjust prices (₹10-₹15 range)
                  </Label>
                </div>
                {allowPriceAdjustment && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Salesman will be allowed to adjust prices within ₹10-₹15 range after you set the official pricing.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Order Totals */}
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="w-80 space-y-2 p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{calculateTotals().subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (10%):</span>
                      <span>₹{calculateTotals().tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>₹{calculateTotals().total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label htmlFor="adminNotes">Admin Notes</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about pricing decisions..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-between">
                <div className="space-x-2">
                  <Button onClick={handleSaveAdminPricing}>
                    <Save className="w-4 h-4 mr-2" />
                    Set Official Pricing
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
